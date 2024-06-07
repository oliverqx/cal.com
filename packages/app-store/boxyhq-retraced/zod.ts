import { z } from "zod";

import { Credential } from "../_utils/zod";

export const appKeysSchema = z.object({
  activeEnvironment: z.string().min(1),
  endpoint: z.string().min(1),
  projectId: z.string(),
});
export type AppKeys = z.infer<typeof appKeysSchema>;

export const boxyHqEnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
});

export const appDataSchema = z.object({});

export const appSettingsSchema = z.object({
  disabledEvents: z.array(z.string()).default([]),
  environments: z.record(boxyHqEnvironmentSchema),
  projectName: z.string(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const getClientSafeAppCredential = Credential.extend({
  key: appKeysSchema,
  settings: z.object({
    projectName: z.string(),
    environments: z.record(boxyHqEnvironmentSchema.omit({ token: true })),
    disabledEvents: z.array(z.string()).default([]),
  }),
});
export type ClientSafeAppCredential = z.infer<typeof getClientSafeAppCredential>;