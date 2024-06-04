import { z } from "zod";

import { Credential } from "../_utils/zod";

export const appKeysSchema = z.object({
  activeEnvironment: z.string().min(1),
  endpoint: z.string().min(1),
});
export type AppKeys = z.infer<typeof appKeysSchema>;

export const boxyHqEnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
});

export const ZBoxyProjectCreationInput = z.object({
  sudoKey: z.string(),
  boxyHqEndpoint: z.string(),
  projectName: z.string(),
});

export type BoxyProjectCreationInput = z.infer<typeof ZBoxyProjectCreationInput>;

export const appDataSchema = z.object({});

export const appSettingsSchema = z.object({
  disabledEvents: z.array(z.string()),
  environments: z.record(boxyHqEnvironmentSchema),
  projectName: z.string(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const getClientSafeAppCredential = Credential.extend({
  key: appKeysSchema,
  settings: z.object({
    projectName: z.string(),
    environments: z.record(boxyHqEnvironmentSchema.omit({ token: true })),
  }),
});

export const appSettingsFormSchema = z.object({
  activeEnvironment: z.object({ key: z.string(), label: z.string(), value: z.string() }),
  projectName: z.string(),
  endpoint: z.string(),
});
export type AppSettingsForm = z.infer<typeof appSettingsFormSchema>;
