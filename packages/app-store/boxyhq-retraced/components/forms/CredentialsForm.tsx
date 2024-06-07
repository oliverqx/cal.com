import { useRef } from "react";
import { z } from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import { showToast } from "@calcom/ui";

import { useAppCredential } from "../../context/CredentialContext";
import { FormRenderer } from "./FormRenderer";

export const ZBoxyCredentialsFormInput = z.object({
  activeEnvironment: z.object({ key: z.string(), label: z.string(), value: z.string() }),
  projectName: z.string(),
  endpoint: z.string(),
});

export type BoxyCredentialsForm = z.infer<typeof ZBoxyCredentialsFormInput>;

export const CredentialsForm = () => {
  const { credentialData, options } = useAppCredential();
  const { t } = useLocale();

  const refForm = useRef<any | null>(null);
  const updateAppCredentialsMutation = trpc.viewer.appsRouter.updateAppCredentials.useMutation({
    onSuccess: () => {
      showToast(t("keys_have_been_saved"), "success");
      refForm.current.reset(refForm.current.getValues());
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });

  const projectUpdateFormFields = [
    {
      name: "projectName",
      label: "Project Name",
      type: "string",
    },
    {
      name: "endpoint",
      label: "Endpoint",
      type: "string",
    },
    {
      name: "activeEnvironment",
      label: "Active Environment",
      type: "select",
      options,
    },
  ];

  if (!credentialData) return <h1>Loading...</h1>;
  return (
    <FormRenderer
      fields={projectUpdateFormFields}
      FormZodSchema={ZBoxyCredentialsFormInput}
      onSubmit={updateAppCredentialsMutation.mutate}
      defaultValues={credentialData}
    />
  );
};
