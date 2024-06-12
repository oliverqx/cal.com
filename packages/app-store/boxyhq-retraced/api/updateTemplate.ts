import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { handleAuditLogTrigger } from "@calcom/features/audit-logs/lib/handleAuditLogTrigger";
import getIP from "@calcom/lib/getIP";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import { ZBoxyTemplate } from "../components/event-settings/EventSettingsInterface";
import { boxyHQAuthenticate, boxyHqCreateTemplate, deleteBoxyTemplate } from "../lib/boxysdk";
import { getDefaultTemplate } from "../lib/constants";

const ZUpdateTemplateInputSchema = z.object({
  projectId: z.coerce.string(),
  template: ZBoxyTemplate,
  sudoKey: z.string(),
  endpoint: z.string(),
  newTemplate: z.string(),
  eventTriggerToMatch: z.string(),
  environmentId: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session;
  if (!session || !session.user.id) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized. User is missing email." });
  }
  const {
    sudoKey,
    endpoint,
    projectId,
    template: oldTemplate,
    environmentId,
    eventTriggerToMatch,
    newTemplate,
  } = ZUpdateTemplateInputSchema.parse(req.body);

  // Admin key is needed to edit templates.
  try {
    const boxyAdminKey = await boxyHQAuthenticate(sudoKey, endpoint, session.user.email);
    await deleteBoxyTemplate(boxyAdminKey, projectId, endpoint, template.id, environmentId);
    const updatedTemplate = await (
      await boxyHqCreateTemplate({
        boxyAdminKey: boxyAdminKey,
        projectId,
        endpoint,
        environmentId,
        template: getDefaultTemplate({ eventTriggerToMatch, template: newTemplate }),
      })
    ).json();

    await handleAuditLogTrigger({
      action: "systemMisc",
      user: { id: session.user.id, name: session.user.name },
      sourceIp: getIP(req),
      data: {
        oldTemplate,
        updatedTemplate,
        implementationAction: "SYSTEM_TEMPLATE_UPDATED",
      },
    });

    return res.status(200).json({ message: "Successfully updated template." });
  } catch (e) {
    return res.status(424).json({ message: e });
  }
}

export default defaultResponder(handler);
