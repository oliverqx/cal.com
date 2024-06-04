import type * as Retraced from "@retracedhq/retraced";
import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { CRUD } from "@calcom/features/audit-logs/types";
import { defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";

import AuditLogManager from "../lib/AuditLogManager";
import { appKeysSchema } from "../zod";

const pingEvent: Retraced.Event = {
  action: "SYSTEM.PING",
  actor: {
    id: "-1",
    name: "App interface",
  },
  target: {
    id: "-1",
    name: "connection",
    type: "SYSTEM",
  },
  group: {
    id: "default",
    name: "default",
  },
  crud: CRUD.CREATE,
  created: new Date(),
};

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
    await auditLogManager.reportEvent(pingEvent);
  } catch (e) {
    return res.status(500).json({ message: e });
  }

  return res.status(200).end();
}

export default defaultResponder(handler);
