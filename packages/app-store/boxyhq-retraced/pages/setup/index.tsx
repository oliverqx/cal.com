import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import { z } from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, showToast } from "@calcom/ui";

import { CredentialsForm, FormAction } from "../../components/CredentialsForm";
import { ProjectCreationForm } from "../../components/ProjectCreationForm";
import appConfig from "../../config.json";
import { boxyEnvironmentTransformer } from "../../context/CredentialContext";
import { ZBoxyProjectCreationInput, appSettingsFormSchema, getClientSafeAppCredential } from "../../zod";
import type { AppSettingsForm, BoxyProjectCreationInput } from "../../zod";

const stageText = {
  CREATION: {
    title: "provide_auditlog_credentials",
    description: "generate_api_key_description",
  },
  CONFIRMATION: {
    title: "create_auditlog_templates",
    description: "create_auditLog_description",
  },
};

const BoxySetupStages = {
  CREATION: "CREATION",
  CONFIRMATION: "CONFIRMATION",
} as const;

type BoxySetupStagesKeys = keyof typeof BoxySetupStages;
type BoxySetupStagesValues = (typeof BoxySetupStages)[BoxySetupStagesKeys];

export default function BoxyHQSetup() {
  const router = useRouter();
  const { t } = useLocale("audit-logs");

  // This is about navigation
  const [stage, setStage] = useState<BoxySetupStagesValues>(BoxySetupStages.CREATION);

  // This is creedential information mounting
  const [credentialId, setCredentialId] = useState<undefined | number>(undefined);
  const [url, setUrl] = useState<undefined | string>(undefined);

  // This is about available environment options
  const [options, setOptions] = useState<{ label: string; value: string; key: string }[]>([
    {
      label: "none",
      value: "none",
      key: "none",
    },
  ]);

  // Confirmation Form
  const confirmationForm = useForm<AppSettingsForm>({
    resolver: zodResolver(appSettingsFormSchema),
  });

  // Creation form
  const creationForm = useForm<BoxyProjectCreationInput>({
    resolver: zodResolver(ZBoxyProjectCreationInput),
  });

  // App creation function.
  async function onCreate(values: BoxyProjectCreationInput) {
    const res = await fetch(`/api/integrations/${appConfig.slug}/createProject`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await res.json();

    const appCredential = getClientSafeAppCredential.extend({ url: z.string() }).parse(json);

    const parsedEnvironments = boxyEnvironmentTransformer.parse(appCredential.settings.environments);

    if (res.ok) {
      showToast("BoxyHQ App created successfully.", "success");
      setStage(BoxySetupStages.CONFIRMATION);
      setCredentialId(appCredential.id);
      setUrl(appCredential.url);
      confirmationForm.reset({
        activeEnvironment: parsedEnvironments[appCredential.key.activeEnvironment],
        endpoint: appCredential.key.endpoint,
        projectName: appCredential.settings.projectName,
      });
      setOptions(Object.values(parsedEnvironments));
    } else {
      showToast(json.message, "error");
    }
  }

  // this handles all actions.
  async function handleSubmitButton() {
    if (stage === BoxySetupStages.CREATION) {
      return creationForm.handleSubmit(
        async (values) => await onCreate(values),
        (e) => console.log(e)
      )();
    } else {
      router.push(url as string);
    }
  }

  return (
    <div className="bg-emphasis flex h-screen">
      <div className="bg-default m-auto rounded p-5 md:w-[600px] md:p-10">
        <div className="flex flex-col space-y-8">
          <div className="flex space-x-5">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src="/api/app-store/boxyhq-retraced/logo.png"
              alt="BoxyHQ Retraced"
              className="h-[50px] w-[50px] max-w-2xl"
            />
            <div>
              <h1 className="text-default">{t(stageText[stage].title)}</h1>
              <div className="mt-1 text-sm">{t(stageText[stage].description)} </div>
            </div>
          </div>
          {renderStage(stage, creationForm, confirmationForm, options, handleSubmitButton)}
        </div>
        {/* <Stepper href="" step={1} steps={stageText} /> */}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

function renderStage(
  stage: BoxySetupStagesValues,
  creationForm: UseFormReturn<BoxyProjectCreationInput, any>,
  confirmationForm: UseFormReturn<AppSettingsForm, any>,
  options: { label: string; value: string; key: string }[],
  handleSubmitButton: () => Promise<void>
) {
  switch (stage) {
    case BoxySetupStages.CREATION:
      return (
        <>
          <div>
            <ProjectCreationForm form={creationForm} />;
          </div>
          <div className="flex w-full justify-end">
            <Button type="submit" onClick={() => handleSubmitButton()}>
              Submit
            </Button>
          </div>
        </>
      );
    case BoxySetupStages.CONFIRMATION:
      return (
        <>
          <div>
            <CredentialsForm options={options} hideBtn form={confirmationForm} action={FormAction.CREATE} />
          </div>
          <div className="flex w-full justify-end">
            <Button type="submit" onClick={() => handleSubmitButton()}>
              {confirmationForm.formState.isDirty ? "Update" : "Continue"}
            </Button>
          </div>
        </>
      );
    default:
      return null;
  }
}
