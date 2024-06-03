import type { NextApiRequest, NextApiResponse } from "next";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import checkSession from "../../_utils/auth";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { createDefaultInstallation } from "../../_utils/installation";
import config from "../config.json";
import { appKeysSchema } from "../zod";

export async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = checkSession(req);

  const { apiKey, projectId, endpoint } = appKeysSchema.parse(req.body);
  if (!apiKey || !projectId || !endpoint)
    throw new HttpError({ statusCode: 400, message: "App Keys invalid." });

  try {
    const appCredential = await createDefaultInstallation({
      appType: config.type,
      user: session.user,
      slug: config.slug,
      key: {
        apiKey,
        projectId,
        endpoint,
      },
    });
    return res.status(200).json({
      url: getInstalledAppPath({ variant: "auditLogs", slug: config.slug }),
      credentialId: appCredential.id,
    });
  } catch (reason) {
    return res.status(500).json({ message: "Could not add BoxyHQ Retraced app" });
  }
}

export default defaultResponder(getHandler);
