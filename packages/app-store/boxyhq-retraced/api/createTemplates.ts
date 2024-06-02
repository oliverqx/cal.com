import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { defaultResponder } from "@calcom/lib/server";

import { boxyHQAuthenticate, getBoxyHQKey } from "../lib/boxysdk";
import { AuditLogDefaultTemplates } from "../lib/constants";

const ZPingInputSchema = z.object({
  credentialId: z.number(),
  environmentId: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { credentialId, environmentId } = ZPingInputSchema.parse(req.body);

  const boxyHqKey = await getBoxyHQKey(credentialId);

  // Admin key is needed to edit templates.
  const boxyAdminKey = await boxyHQAuthenticate(boxyHqKey.apiKey, boxyHqKey.endpoint);

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

  try {
    await fetch(
      `${boxyHqKey.endpoint}/admin/v1/project/${boxyHqKey.projectId}/templates?environment_id=${environmentId}`,
      requestOptions
    );

    return res.status(200).json({ message: "Templates created successfully." });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
