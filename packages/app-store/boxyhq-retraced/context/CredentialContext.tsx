import { createContext, useContext, useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";

import { trpc } from "@calcom/trpc";

import type { BoxyCredentialsForm } from "../components/forms/CredentialsForm";
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
