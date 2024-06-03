import { z } from "zod";

export const appKeysSchema = z.object({
  activeEnvironment: z.string().min(1),
  projectId: z.string().min(1),
  endpoint: z.string().min(1),
});

export type AppKeys = z.infer<typeof appKeysSchema>;

export const appDataSchema = z.object({});

export const credentialSettingsSchema = z.object({
  disabledEvents: z.array(z.string()),
  environments: z.record(
    z.object({
      id: z.string(),
      name: z.string(),
      token: z.string(),
    })
  ),
});

export type CredentialSettings = z.infer<typeof credentialSettingsSchema>;
