import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import { boxyHQAuthenticate, boxyHqCreateTemplates, deleteBoxyTemplate } from "../lib/boxysdk";
import { getDefaultTemplate } from "../lib/constants";

const ZUpdateTemplateInputSchema = z.object({
  projectId: z.coerce.string(),
  templateId: z.string(),
  sudoKey: z.string(),
  endpoint: z.string(),
  newTemplate: z.string(),
  eventTriggerToMatch: z.string(),
  environmentId: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session;
  if (!session || !session.user.email) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized. User is missing email." });
  }
  const { sudoKey, endpoint, projectId, templateId, environmentId, eventTriggerToMatch, newTemplate } =
    ZUpdateTemplateInputSchema.parse(req.body);

  // Admin key is needed to edit templates.
  try {
    const boxyAdminKey = await boxyHQAuthenticate(sudoKey, endpoint, session.user.email);
    await deleteBoxyTemplate(boxyAdminKey, projectId, endpoint, templateId, environmentId);
    await boxyHqCreateTemplates({
      boxyAdminKey: boxyAdminKey,
      projectId,
      endpoint,
      environmentId,
      templates: [getDefaultTemplate({ eventTriggerToMatch, template: newTemplate })],
    });

    return res.status(200).json({ message: "Successfully updated template." });
  } catch (e) {
    return res.status(424).json({ message: e });
  }
}

export default defaultResponder(handler);
