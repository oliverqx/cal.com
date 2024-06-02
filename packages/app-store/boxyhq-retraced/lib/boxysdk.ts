import z from "zod";

import prisma from "@calcom/prisma";

import config from "../config.json";
import { appKeysSchema } from "../zod";

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

export async function boxyHQAuthenticate(apiToken: string, endpoint: string) {
  const loginHeaders = new Headers();
  loginHeaders.append("Authorization", `token=${apiToken}`);
  loginHeaders.append("Content-Type", "application/json");

  const loginClaim = JSON.stringify({
    claims: {
      email: "david@acme.com",
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
