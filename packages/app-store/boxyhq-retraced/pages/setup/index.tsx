import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import z from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, showToast } from "@calcom/ui";

import { AdminKeyForm } from "../../components/AdminKeyForm";
import { CredentialsForm, FormAction } from "../../components/CredentialsForm";
import appConfig from "../../config.json";
import type { AppKeys } from "../../zod";
import { appKeysSchema } from "../../zod";

const formSchema = appKeysSchema;

const stageText = {
  CREDENTIALS: {
    title: "provide_auditlog_credentials",
    description: "generate_api_key_description",
  },
  TEMPLATES: {
    title: "create_auditlog_templates",
    description: "create_auditLog_description",
  },
};

const BoxySetupStages = {
  CREDENTIALS: "CREDENTIALS",
  TEMPLATES: "TEMPLATES",
} as const;

type BoxySetupStagesKeys = keyof typeof BoxySetupStages;
type BoxySetupStagesValues = (typeof BoxySetupStages)[BoxySetupStagesKeys];

export default function BoxyHQSetup() {
  const router = useRouter();
  const [stage, setStage] = useState<BoxySetupStagesValues>(BoxySetupStages.CREDENTIALS);
  const [credentialId, setCredentialId] = useState<undefined | number>(undefined);
  const [url, setUrl] = useState<undefined | string>(undefined);

  const form = useForm<AppKeys>({
    resolver: zodResolver(formSchema),
  });

  const form2 = useForm<{ adminKey: string }>({
    resolver: zodResolver(z.object({ adminKey: z.string() })),
  });

  async function onCreate(values: AppKeys) {
    const res = await fetch(`/api/integrations/${appConfig.slug}/add`, {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json: { url: string; credentialId: number; message: string } = await res.json();

    if (res.ok) {
      showToast("BoxyHQ App created successfully.", "success");
      setStage(BoxySetupStages.TEMPLATES);
      setCredentialId(json.credentialId);
      setUrl(json.url);
    } else {
      showToast(json.message, "error");
    }
  }

  const mutation = useMutation({
    mutationFn: async ({ adminKey }: { adminKey: string }) => {
      if (!credentialId || !url) {
        showToast("Credential ID is not set. Configuration might've failed.", "error");
        return;
      }

      const response = await fetch(`/api/integrations/${appConfig.slug}/createTemplates`, {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          credentialId,
          adminRootToken: adminKey,
        }),
      });

      if (response.status === 200) {
        showToast("Templates created successfully.", "success");
        router.push(url);
      } else {
        showToast("Templates creation failed. Please ensure your credentials are valid.", "error");
      }

      return {
        status: response.status,
        message: response.statusText,
        lastCheck: new Date().toLocaleString(),
      };
    },
  });

  async function handleSubmitButton() {
    if (stage === BoxySetupStages.CREDENTIALS) {
      return form.handleSubmit(async (values) => await onCreate(values))();
    } else {
      return form2.handleSubmit((values) => mutation.mutate(values))();
    }
  }
  return (
    <div className="bg-emphasis flex h-screen">
      <div className="bg-default m-auto rounded p-5 md:w-[600px] md:p-10">
        <div className="flex flex-col space-y-8">
          <div className="flex space-x-5">
            <Title stage={stage} />
          </div>
          <div>{renderStage(stage, form, form2, onCreate, mutation)}</div>
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
  form: UseFormReturn<
    {
      apiKey: string;
      projectId: string;
      endpoint: string;
    },
    any
  >,
  form2: UseFormReturn<{ adminKey: string }, any>,
  onCreate: (values: AppKeys) => Promise<void>,
  mutation: any
) {
  switch (stage) {
    case BoxySetupStages.CREDENTIALS:
      return <CredentialsForm form={form} action={FormAction.CREATE} onCreate={onCreate} hideBtn />;
    case BoxySetupStages.TEMPLATES:
      return (
        <div className="flex h-[100%] w-[100%] flex-col space-y-4">
          <AdminKeyForm form={form2} />
        </div>
      );

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
