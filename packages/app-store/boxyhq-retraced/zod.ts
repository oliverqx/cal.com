import { z } from "zod";

export const appKeysSchema = z.object({
  activeEnvironment: z.string().min(1),
  projectId: z.string().min(1),
  endpoint: z.string().min(1),
});
export type AppKeys = z.infer<typeof appKeysSchema>;

export const appDataSchema = z.object({});

export const boxyHqEnvironmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  token: z.string(),
});

export const appSettingsSchema = z.object({
  disabledEvents: z.array(z.string()),
  environments: z.record(boxyHqEnvironmentSchema),
  projectName: z.string(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const ZBoxyProjectCreationInput = z.object({
  sudoKey: z.string(),
  boxyHqEndpoint: z.string(),
  projectName: z.string(),
});
export type BoxyProjectCreationInput = z.infer<typeof ZBoxyProjectCreationInput>;

export const boxyEnvironmentTranformInfoClientSafe = boxyHqEnvironmentSchema.transform((values) => {
  return {
    key: values.id,
    label: values.name,
    value: values.name.toLowerCase(),
  };
});

export const boxyEnvironmentClientSafe = z.object({
  key: z.coerce.string(),
  label: z.string(),
  value: z.string(),
});

export const boxySettingsInfoClientSafe = z.object({
  projectName: z.string(),
  environments: z.record(boxyEnvironmentTranformInfoClientSafe),
});

export const ExpectedCredential = z.object({
  url: z.string().optional(),
  activeEnvironment: boxyEnvironmentClientSafe,
  credentialId: z.number(),
  endpoint: z.string(),
  environments: z.array(boxyEnvironmentClientSafe),
  projectName: z.string(),
});

export const appSettingsFormSchema = z.object({
  activeEnvironment: z.object({ key: z.string(), label: z.string(), value: z.string() }),
  projectName: z.string(),
  endpoint: z.string(),
});
export type AppSettingsForm = z.infer<typeof appSettingsFormSchema>;
