import z from "zod";

import prisma from "@calcom/prisma";

import config from "../config.json";
import { appKeysSchema } from "../zod";
import type { BoxyHQTemplate } from "./constants";

const loginSuccessSchema = z.object({
  token: z.string(),
});

export async function getBoxyHQKey(credentialId: number) {
  console.log({ credentialId });
  const credential = await prisma.credential.findFirst({
    where: {
      id: credentialId,
    },
  });

  if (!credential) {
    throw new Error(`Unable to find user credential with id ${credentialId} for app ${config.slug}`);
  }

  const appKeys = appKeysSchema.parse(credential.key);
  if (!appKeys.activeEnvironment || !appKeys.endpoint || !appKeys.projectId) {
    throw new Error(`Invalid BoxyHQ key for credential with id: ${credentialId}`);
  }

  return appKeys;
}

export async function boxyHQAuthenticate(adminToken: string, endpoint: string, email: string) {
  const loginHeaders = new Headers();
  loginHeaders.append("Authorization", `token=${adminToken}`);
  loginHeaders.append("Content-Type", "application/json");

  const loginClaim = JSON.stringify({
    claims: {
      email: email,
    },
  });

  const loginRequestOptions = {
    method: "POST",
    headers: loginHeaders,
    body: loginClaim,
    redirect: "follow" as const,
  };

  let login: z.infer<typeof loginSuccessSchema> | undefined = undefined;

  try {
    const response = await (await fetch(`${endpoint}/admin/v1/user/_login`, loginRequestOptions)).json();
    login = loginSuccessSchema.parse(response);
  } catch (e) {
    console.log(e);
  }

  if (!login) {
    throw new Error(`Unable to authenticate at BoxyHQ`);
  }

  return login.token;
}

export function boxyHqCreateTemplates({
  boxyAdminKey,
  projectId,
  endpoint,
  environmentId,
  templates,
}: {
  boxyAdminKey: string;
  projectId: string;
  endpoint: string;
  environmentId: string;
  templates: BoxyHQTemplate[];
}) {
  const headers = new Headers();
  headers.append("Authorization", boxyAdminKey);
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({ templates: templates });

  const requestOptions = {
    method: "POST",
    headers,
    body,
    redirect: "follow" as const,
  };

  return fetch(
    `${endpoint}/admin/v1/project/${projectId}/templates?environment_id=${environmentId}`,
    requestOptions
  );
}

export function getBoxyTemplates(
  boxyAdminKey: string,
  projectId: string,
  endpoint: string,
  environmentId: string
) {
  const headers = new Headers();
  headers.append("Authorization", boxyAdminKey);

  const requestOptions = {
    method: "GET",
    headers: headers,
    redirect: "follow" as const,
  };

  return fetch(
    `${endpoint}/admin/v1/project/${projectId}/templates?environment_id=${environmentId}`,
    requestOptions
  );
}

export function deleteBoxyTemplate(
  boxyAdminKey: string,
  projectId: string,
  endpoint: string,
  templateId: string,
  environmentId: string
) {
  const headers = new Headers();
  headers.append("Authorization", boxyAdminKey);

  const requestOptions = {
    method: "DELETE",
    headers: headers,
    redirect: "follow" as const,
  };

  return fetch(
    `${endpoint}/admin/v1/project/${projectId}/templates/${templateId}?environment_id=${environmentId}`,
    requestOptions
  );
}

export async function createProject(
  boxyAdminKey: string,
  projectName: string,
  boxyHqEndpoint: string
): Promise<BoxyHqProject | undefined> {
  const headers = new Headers();
  headers.append("Authorization", boxyAdminKey);
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({
    name: projectName,
  });

  const requestOptions = {
    method: "POST",
    headers,
    body,
    redirect: "follow" as const,
  };

  try {
    return (await (await fetch(`${boxyHqEndpoint}/admin/v1/project`, requestOptions)).json()).project;
  } catch (e) {
    console.log(e);
  }
}

export type BoxyHqProject = {
  id: string;
  name: string;
  created: number;
  environments: Environment[];
  tokens: Token[];
};

type Token = {
  project_id: string;
  environment_id: string;
  token: string;
  disabled: boolean;
  name: string;
  created: Date;
};

type Environment = {
  id: string;
  name: string;
};

type Credential = {
  id: string;
  projectId: string;
  settings: {
    disabledEvents: string[];
    environments: {
      [key: string]: {
        id: string;
        name: string;
        token: string;
      };
    };
  };
};
