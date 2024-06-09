import { useRef } from "react";
import { z } from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import { showToast } from "@calcom/ui";

import { useAppCredential } from "../../context/CredentialContext";
import { FormRenderer } from "./FormRenderer";

export const ZBoxyAppKeyFormInput = z.object({
  activeEnvironment: z.object({ key: z.string(), label: z.string(), value: z.string() }),
  projectName: z.string(),
  endpoint: z.string(),
});

export type BoxyAppKeyForm = z.infer<typeof ZBoxyAppKeyFormInput>;

export const AppKeyForm = () => {
  const { appKey, data, options, credentialId, environments } = useAppCredential();
  const { t } = useLocale();

  const refForm = useRef<any | null>(null);
  const { mutate: updateAppKey, isPending } = trpc.viewer.appsRouter.updateAppCredentials.useMutation({
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

  function handleSubmit(values: BoxyAppKeyForm) {
    if (!environments) return;
    updateAppKey({
      credentialId,
      key: {
        ...values,
        activeEnvironment: environments[values.activeEnvironment.value].id,
      },
    });
  }

  if (!appKey) return <h1>Loading...</h1>;
  return (
    <FormRenderer
      fields={projectUpdateFormFields}
      FormZodSchema={ZBoxyAppKeyFormInput}
      onSubmit={handleSubmit}
      defaultValues={appKey}
      isLoading={isPending}
      showInternalButton
      ref={refForm}
    />
  );
};
