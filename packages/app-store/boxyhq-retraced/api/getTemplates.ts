import type { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import { boxyHQAuthenticate, getBoxyHQKey, getBoxyTemplates } from "../lib/boxysdk";

const ZPingInputSchema = z.object({
  credentialId: z.number(),
  sudoKey: z.string(),
});

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.session;
  if (!session || !session.user.email) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized. User is missing email." });
  }
  const { credentialId, sudoKey } = ZPingInputSchema.parse(req.body);
  const boxyHqKey = await getBoxyHQKey(credentialId);

  // Admin key is needed to edit templates.
  const boxyAdminKey = await boxyHQAuthenticate(sudoKey, boxyHqKey.endpoint, session.user.email);

  try {
    const response = await (
      await getBoxyTemplates(
        boxyAdminKey,
        boxyHqKey.projectId,
        boxyHqKey.endpoint,
        boxyHqKey.activeEnvironment
      )
    ).json();

    return res.status(200).json({ message: response });
  } catch (e) {
    return res.status(500).json({ message: e });
  }
}

export default defaultResponder(handler);
