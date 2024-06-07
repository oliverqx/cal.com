import type { NextApiRequest, NextApiResponse } from "next";

import getInstalledAppPath from "@calcom/app-store/_utils/getInstalledAppPath";
import { createDefaultInstallation } from "@calcom/app-store/_utils/installation";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import appConfig from "../config.json";
import type { BoxyHqProject } from "../lib/boxysdk";
import { boxyHQAuthenticate, boxyHqCreateTemplates, createProject } from "../lib/boxysdk";
import { AuditLogDefaultTemplates } from "../lib/constants";
import { ZBoxyProjectCreationInput } from "../pages/setup";
import { getClientSafeAppCredential } from "../zod";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session;
  if (!session || !session.user.email) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized. User is missing email." });
  }

  const { sudoKey, boxyHqEndpoint, projectName } = ZBoxyProjectCreationInput.parse(req.body);
  const boxyAuthenticationToken = await boxyHQAuthenticate(sudoKey, boxyHqEndpoint, session.user.email);

  let projectMetadata: BoxyHqProject | undefined;
  try {
    projectMetadata = await createProject(boxyAuthenticationToken, projectName, boxyHqEndpoint);
  } catch (e) {
    return res.status(500).json({ message: e });
  }

  const environments: { [key: string]: { id: string; name: string; token: string } } = {};

  projectMetadata?.environments.forEach((environment) => {
    const token = projectMetadata?.tokens.find((token) => token.environment_id === environment.id)?.token;
    environments[environment.id] = {
      id: environment.id,
      name: environment.name,
      token: token as string,
    };
  });

  const boxyHqMetadata = {
    name: projectMetadata?.name,
    projectId: projectMetadata?.id,
    environments: environments,
  };

  let clientSafeAppCredential;
  try {
    const appCredential = await createDefaultInstallation({
      appType: appConfig.type,
      user: session.user,
      slug: appConfig.slug,
      key: {
        activeEnvironment: Object.values(boxyHqMetadata.environments)[0].id,
        projectId: boxyHqMetadata.projectId,
        endpoint: boxyHqEndpoint,
      },
      settings: {
        disabledEvents: [],
        projectName: boxyHqMetadata.name,
        environments: boxyHqMetadata.environments,
      },
    });

    clientSafeAppCredential = getClientSafeAppCredential.parse(appCredential);
  } catch (reason) {
    return res.status(500).json({ message: "Could not add BoxyHQ Retraced app" });
  }

  try {
    await boxyHqCreateTemplates({
      boxyAdminKey: boxyAuthenticationToken,
      projectId: clientSafeAppCredential.key.projectId,
      endpoint: clientSafeAppCredential.key.endpoint,
      environmentId: clientSafeAppCredential.key.activeEnvironment,
      templates: AuditLogDefaultTemplates,
    });

    return res.status(200).json({
      url: getInstalledAppPath({ variant: "auditLogs", slug: appConfig.slug }),
      ...clientSafeAppCredential,
    });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
