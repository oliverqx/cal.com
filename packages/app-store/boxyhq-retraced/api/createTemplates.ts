import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";

const ZPingInputSchema = z.object({
  credentialId: z.number(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { credentialId } = ZPingInputSchema.parse(req.body);
  const credential = await prisma.credential.findFirst({
    where: {
      id: credentialId,
    },
  });

  if (!credential) {
    throw new Error(`Unable to find user credential for type }`);
  }

  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkNjYxN2M4MGNhZjk0M2ZhOTA2ZmQ1OTEyZDlmZDk5ZCIsImlhdCI6MTcxNzE1ODU2MCwiZXhwIjoxNzE4OTcyOTYwfQ.O6y_0sAL7DjHkFPkLMI-QR0Stiy-Hovzbh4jwVFfifQ"
  );
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    name: "SYSTEM.PING",
    rule: [
      {
        comparator: "is",
        path: "action",
        value: "SYSTEM.PING",
      },
    ],
    template: "{{ actor.name }} has pinged system.",
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow" as const,
  };

  try {
    const l = await fetch(
      "http://localhost:3000/auditlog/admin/v1/project/8a270f6ce7164151b3382f41bf4ac2d8/templates?environment_id=f1f96d20af39404aa1c4add932cce77d",
      requestOptions
    );
    return res.status(200).json({ message: l });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
