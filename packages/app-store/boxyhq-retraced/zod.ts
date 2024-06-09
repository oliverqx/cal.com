import { z } from "zod";

import { Credential } from "../_utils/zod";

export const boxyHqEnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
});

export const appDataSchema = z.object({});

export const appKeysSchema = z.object({
  activeEnvironment: z.string().min(1),
  endpoint: z.string().min(1),
  projectId: z.string(),
  disabledEvents: z.array(z.string()).default([]),
  environments: z.record(boxyHqEnvironmentSchema),
  projectName: z.string(),
});
export type AppKeys = z.infer<typeof appKeysSchema>;

export const getClientSafeAppCredential = Credential.extend({
  key: appKeysSchema
    .omit({ environments: true })
    .extend({ environments: z.record(boxyHqEnvironmentSchema.omit({ token: true })) }),
});
export type ClientSafeAppCredential = z.infer<typeof getClientSafeAppCredential>;
