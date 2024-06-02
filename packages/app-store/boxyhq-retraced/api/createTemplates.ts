import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { defaultResponder } from "@calcom/lib/server";

import { boxyHQAuthenticate, boxyHqCreateTemplates, getBoxyHQKey } from "../lib/boxysdk";
import { getIdentifier } from "../lib/utils";

const ZPingInputSchema = z.object({
  credentialId: z.number(),
  // environmentId: z.string(),
  adminRootToken: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = getIdentifier(req);

  const { credentialId, adminRootToken } = ZPingInputSchema.parse(req.body);
  const environmentId = "8a7ce8ffe5aa4dfea050ec54f03c596e";

  const boxyHqKey = await getBoxyHQKey(credentialId);

  // Admin key is needed to edit templates.
  const boxyAdminKey = await boxyHQAuthenticate(adminRootToken, boxyHqKey.endpoint, email);

  try {
    await boxyHqCreateTemplates(boxyAdminKey, boxyHqKey.projectId, boxyHqKey.endpoint, environmentId);
    return res.status(200).json({ message: "Templates created successfully." });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
