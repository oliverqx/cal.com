import z from "zod";

import prisma from "@calcom/prisma";

import config from "../config.json";
import { appKeysSchema } from "../zod";
import { AuditLogDefaultTemplates } from "./constants";

const loginSuccessSchema = z.object({
  token: z.string(),
});

export async function getBoxyHQKey(credentialId: number) {
  const credential = await prisma.credential.findFirst({
    where: {
      id: credentialId,
    },
  });

  if (!credential) {
    throw new Error(`Unable to find user credential with id ${credentialId} for app ${config.slug}`);
  }

  const appKeys = appKeysSchema.parse(credential.key);
  if (!appKeys.apiKey || !appKeys.endpoint || !appKeys.projectId) {
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

export function boxyHqCreateTemplates(
  boxyAdminKey: string,
  projectId: string,
  endpoint: string,
  environmentId: string
) {
  const headers = new Headers();
  headers.append("Authorization", boxyAdminKey);
  headers.append("Content-Type", "application/json");

  const body = JSON.stringify({ templates: AuditLogDefaultTemplates });

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

export function createProject(boxyAdminKey: string, projectName: string, boxyHqEndpoint: string) {
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

  return fetch(`${boxyHqEndpoint}/admin/v1/project`, requestOptions);
}
