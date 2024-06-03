import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { defaultResponder } from "@calcom/lib/server";

import { boxyHQAuthenticate, createProject } from "../lib/boxysdk";
import { getIdentifier } from "../lib/utils";

const ZPingInputSchema = z.object({
  sudoKey: z.string(),
  boxyHqEndpoint: z.string(),
  projectName: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const email = getIdentifier(req);
  const { sudoKey, boxyHqEndpoint, projectName } = ZPingInputSchema.parse(req.body);
  const boxyAuthenticationToken = await boxyHQAuthenticate(sudoKey, boxyHqEndpoint, email);

  try {
    await createProject(boxyAuthenticationToken, projectName, boxyHqEndpoint);
    return res.status(200).json({ message: "Templates created successfully." });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
