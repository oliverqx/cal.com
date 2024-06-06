import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import { boxyHQAuthenticate, getBoxyHQKey } from "../lib/boxysdk";

const ZPingInputSchema = z.object({
  credentialId: z.number(),
  // environmentId: z.string(),
  adminRootToken: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!req.session?.user?.id || !req.session.user.email) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized" });
  }
  const { credentialId, adminRootToken } = ZPingInputSchema.parse(req.body);
  const environmentId = "8a7ce8ffe5aa4dfea050ec54f03c596e";

  const boxyHqKey = await getBoxyHQKey(credentialId);

  // Admin key is needed to edit templates.
  const boxyAdminKey = await boxyHQAuthenticate(adminRootToken, boxyHqKey.endpoint, req.session.user.email);

  try {
    // await boxyHqCreateTemplates(boxyAdminKey, boxyHqKey.projectId, boxyHqKey.endpoint, environmentId);
    return res.status(200).json({ message: "Templates created successfully." });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
