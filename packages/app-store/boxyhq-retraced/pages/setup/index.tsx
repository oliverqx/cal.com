import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, showToast } from "@calcom/ui";

import { CredentialsForm, FormAction } from "../../components/CredentialsForm";
import { ProjectCreationForm } from "../../components/ProjectCreationForm";
import appConfig from "../../config.json";
import type { AppSettingsForm } from "../../zod";
import { ZBoxyProjectCreationInput, type BoxyProjectCreationInput } from "../../zod";

const formSchema = ZBoxyProjectCreationInput;

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
  const [stage, setStage] = useState<BoxySetupStagesValues>(BoxySetupStages.CREATION);
  const [credentialId, setCredentialId] = useState<undefined | number>(undefined);
  const [url, setUrl] = useState<undefined | string>(undefined);
  const [options, setOptions] = useState<{ label: string; value: string; key: string }[]>([
    {
      label: "none",
      value: "none",
      key: "none",
    },
  ]);

  const confirmationForm = useForm<AppSettingsForm>({
    resolver: zodResolver(formSchema),
  });
  const creationForm = useForm<BoxyProjectCreationInput>({
    resolver: zodResolver(formSchema),
  });

  async function onCreate(values: BoxyProjectCreationInput) {
    const res = await fetch(`/api/integrations/${appConfig.slug}/createProject`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json: {
      url: string;
      credentialId: number;
      endpoint: string;
      activeEnvironment: { value: string; label: string; key: string };
      projectName: string;
      environments: { value: string; label: string; key: string }[];
      message: string;
    } = await res.json();

    if (res.ok) {
      showToast("BoxyHQ App created successfully.", "success");
      setStage(BoxySetupStages.CONFIRMATION);
      setCredentialId(json.credentialId);
      setUrl(json.url);
      confirmationForm.reset({
        activeEnvironment: json.activeEnvironment,
        endpoint: json.endpoint,
        projectName: json.projectName,
      });
      setOptions(json.environments);
    } else {
      showToast(json.message, "error");
    }
  }

  async function handleSubmitButton() {
    if (stage === BoxySetupStages.CREATION) {
      return creationForm.handleSubmit(
        async (values) => await onCreate(values),
        (e) => console.log(e)
      )();
    } else {
      return console.log("HEYEEERAREEAFASDc");
    }
  }

  return (
    <div className="bg-emphasis flex h-screen">
      <div className="bg-default m-auto rounded p-5 md:w-[600px] md:p-10">
        <div className="flex flex-col space-y-8">
          <div className="flex space-x-5">
            <Title stage={stage} />
          </div>
          <div>{renderStage(stage, creationForm, confirmationForm, options)}</div>
          <div className="flex w-full justify-end">
            <Button type="submit" onClick={() => handleSubmitButton()}>
              Submit
            </Button>
          </div>
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
  options: { label: string; value: string; key: string }[]
) {
  switch (stage) {
    case BoxySetupStages.CREATION:
      return <ProjectCreationForm form={creationForm} />;
    case BoxySetupStages.CONFIRMATION:
      return <CredentialsForm options={options} form={confirmationForm} action={FormAction.CREATE} />;
    default:
      break;
  }
}

function Title({ stage }: { stage: BoxySetupStagesValues }) {
  const { t } = useLocale("audit-logs");
  return (
    <>
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
    </>
  );
}
