import { z } from "zod";

export const appKeysSchema = z.object({
  activeEnvironment: z.string().min(1),
  projectId: z.string().min(1),
  endpoint: z.string().min(1),
});
export type AppKeys = z.infer<typeof appKeysSchema>;

export const clientSafeAppKeysSchema = z.object({
  activeEnvironment: z.object({ label: z.string(), value: z.string(), key: z.string() }),
  projectId: z.string(),
  endpoint: z.string(),
});

export type ClientSafeAppKeysSchema = z.infer<typeof clientSafeAppKeysSchema>;

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
  projectName: z.string(),
});

export type CredentialSettings = z.infer<typeof credentialSettingsSchema>;

export const ZBoxyProjectCreationInput = z.object({
  sudoKey: z.string(),
  boxyHqEndpoint: z.string(),
  projectName: z.string(),
});
export type BoxyProjectCreationInput = z.infer<typeof ZBoxyProjectCreationInput>;

export const boxyEnvironmentTranformInfoClientSafe = z
  .object({
    name: z.string(),
    id: z.string(),
  })
  .transform((values) => {
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

export const credentialSettingsFormSchema = z.object({
  activeEnvironment: z.object({ key: z.string(), label: z.string(), value: z.string() }),
  projectId: z.string(),
  endpoint: z.string(),
});
