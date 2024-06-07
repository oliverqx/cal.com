import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";

import { trpc } from "@calcom/trpc";
import { showToast } from "@calcom/ui";

import type { BoxyTemplate } from "../components/event-settings/EventSettingsInterface";
import type { BoxyCredentialsForm } from "../components/forms/CredentialsForm";
import appConfig from "../config.json";
import type { ClientSafeAppCredential } from "../zod";
import { boxyHqEnvironmentSchema, getClientSafeAppCredential } from "../zod";

const AuditLogCredentialContext = createContext<
  | {
      data: ClientSafeAppCredential | undefined;
      credentialData: BoxyCredentialsForm | undefined;
      isLoading: boolean;
      credentialId: number;
      options: {
        label: string;
        value: string;
        key: string;
      }[];
      sudoKey: string | undefined;
      setSudoKey: Dispatch<SetStateAction<string | undefined>>;
      isFetchingTemplates: boolean;
      templates: Map<string, BoxyTemplate> | undefined;
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
  // This holds credential data.
  const { data, isLoading }: { data: ClientSafeAppCredential | undefined; isLoading: boolean } =
    trpc.viewer.appCredentialById.useQuery({
      id: credentialId,
    });

  // This holds all available environment options
  const [options, setOptions] = useState<{ label: string; value: string; key: string }[]>([
    {
      label: "none",
      value: "none",
      key: "none",
    },
  ]);

  const [credentialData, setCredentialData] = useState<BoxyCredentialsForm>();

  // This is processing necessary credential data once its been received
  useEffect(() => {
    if (isLoading === false && data) {
      const {
        key: { activeEnvironment: activeEnvironmentId, endpoint },
        settings: { projectName, environments },
      } = getClientSafeAppCredential.parse(data);

      const parsedEnvironment = boxyEnvironmentTransformer.parse(environments);

      setCredentialData({
        activeEnvironment: parsedEnvironment[activeEnvironmentId],
        projectName,
        endpoint,
      });
      setOptions(Object.values(parsedEnvironment));
    }
  }, [isLoading, data]);

  const [sudoKey, setSudoKey] = useState<string | undefined>();

  const { data: templates, isLoading: isFetchingTemplates } = useQuery({
    queryKey: ["getTemplates", credentialId.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/${appConfig.slug}/getTemplates`, {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          credentialId,
          sudoKey,
        }),
      });

      const body = await response.json();

      const templates = body.message.templates;

      const templateMap: Map<string, BoxyTemplate> = new Map();
      templates.map((template: BoxyTemplate) => templateMap.set(template.name, template));

      if (response.status === 200) {
        showToast("Templates retrieved successfully.", "success");
      } else {
        showToast("Templates retrieval failed. Please ensure your credentials are valid.", "error");
      }

      return templateMap;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!sudoKey,
  });

  return (
    <AuditLogCredentialContext.Provider
      value={{
        data,
        credentialData,
        isLoading,
        credentialId,
        options,
        sudoKey,
        setSudoKey,
        templates,
        isFetchingTemplates,
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
