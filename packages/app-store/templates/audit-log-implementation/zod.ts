import { z } from "zod";

export const appKeysSchema = z.object({
  apiKey: z.string().min(1),
  projectId: z.string().min(1),
  endpoint: z.string().min(1),
});

export type AppKeys = z.infer<typeof appKeysSchema>;

export const appDataSchema = z.object({});

export const appSettingsSchema = z.object({
  disabledEvents: z.array(z.enum(["AuditLogBookingTriggerEvents"])),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export type CredentialSettings = z.infer<typeof appSettingsSchema>;
