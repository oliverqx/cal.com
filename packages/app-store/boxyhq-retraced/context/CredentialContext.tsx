import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState, useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { trpc } from "@calcom/trpc";

import type { AppSettingsForm } from "../zod";
import { appKeysSchema, boxyHqEnvironmentSchema, getClientSafeAppCredential } from "../zod";

const AuditLogCredentialContext = createContext<
  | {
      data:
        | {
            apiKey?: string;
            endpoint?: string;
            projectId?: string;
            settings?: any;
            isInvalid?: boolean | null;
          }
        | undefined;
      isLoading: boolean;
      credentialId: number;
      activePanel: string | null;
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
  // This is about navigation for AppSettingsInterface
  const searchParams = useSearchParams();
  const activePanel = searchParams.get(credentialId.toString());

  // This is credential data.
  const { data, isLoading } = trpc.viewer.appCredentialById.useQuery({
    id: credentialId,
  });

  // This is about available environment options
  const [options, setOptions] = useState<{ label: string; value: string; key: string }[]>([
    {
      label: "none",
      value: "none",
      key: "none",
    },
  ]);

  // This is about mounting the credential data once its been received
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

  // This holds form for app settings
  const form = useForm<AppSettingsForm>({
    resolver: zodResolver(appKeysSchema),
  });

  return (
    <AuditLogCredentialContext.Provider
      value={{
        data,
        isLoading,
        credentialId,
        activePanel,
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
