import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";

import AuditLogManager from "../lib/AuditLogManager";
import { appKeysSchema } from "../zod";

const ZPingInputSchema = z.object({
  credentialId: z.number(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { credentialId } = ZPingInputSchema.parse(req.body);

  const data = await prisma.credential.findUnique({
    where: {
      id: credentialId,
    },
  });

  const appKeys = appKeysSchema.parse(data?.key);
  const auditLogManager = new AuditLogManager(appKeys);

  try {
    const token = await auditLogManager.client?.getViewerToken("default", "", true);

    return res.status(200).json({ message: token });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
