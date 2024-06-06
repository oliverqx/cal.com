import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useContext, useState, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@calcom/trpc";

import type { AppSettingsForm, ClientSafeAppCredential } from "../zod";
import { appKeysSchema, boxyHqEnvironmentSchema, getClientSafeAppCredential } from "../zod";

const AuditLogCredentialContext = createContext<
  | {
      data: ClientSafeAppCredential | undefined;
      isLoading: boolean;
      credentialId: number;
      form: UseFormReturn<AppSettingsForm, any>;
      options: {
        label: string;
        value: string;
        key: string;
      }[];
    }
  | undefined
>(undefined);

export const boxyEnvironmentTransformer = z.record(
  boxyHqEnvironmentSchema.omit({ token: true }).transform((values) => {
    return { label: values.name, value: values.id, key: values.id };
  })
);

export const AuditLogCredentialProvider = ({
  credentialId,
  children,
}: {
  credentialId: number;
  children: React.ReactNode;
}) => {
  // This holds form for app settings
  const form = useForm<AppSettingsForm>({
    resolver: zodResolver(appKeysSchema),
  });

  // This holds credential data.
  const { data, isLoading }: { data: ClientSafeAppCredential | undefined; isLoading: boolean } =
    trpc.viewer.appCredentialById.useQuery({
      id: credentialId,
    });

  // This holds all ailable environment options
  const [options, setOptions] = useState<{ label: string; value: string; key: string }[]>([
    {
      label: "none",
      value: "none",
      key: "none",
    },
  ]);

  // This is processing necessary credential data once its been received
  useEffect(() => {
    if (isLoading === false && data) {
      const {
        key: { activeEnvironment: activeEnvironmentId, endpoint },
        settings: { projectName, environments },
      } = getClientSafeAppCredential.parse(data);

      const parsedEnvironment = boxyEnvironmentTransformer.parse(environments);

      form.reset({
        activeEnvironment: parsedEnvironment[activeEnvironmentId],
        projectName,
        endpoint,
      });
      setOptions(Object.values(parsedEnvironment));
    }
  }, [isLoading]);

  return (
    <AuditLogCredentialContext.Provider
      value={{
        data,
        isLoading,
        credentialId,
        form,
        options,
      }}>
      {children}
    </AuditLogCredentialContext.Provider>
  );
};

export function useAppCredential() {
  const credential = useContext(AuditLogCredentialContext);
  if (credential === undefined) {
    throw new Error(`useAppCredential must be used within an AuditLogCredentialProvider`);
  }
  return credential;
}
