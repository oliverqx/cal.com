import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import { z } from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, showToast } from "@calcom/ui";

import { FormRenderer } from "../../components/forms/FormRenderer";
import appConfig from "../../config.json";
import { getClientSafeAppCredential } from "../../zod";

export const ZBoxyProjectCreationInput = z.object({
  sudoKey: z.string(),
  boxyHqEndpoint: z.string(),
  projectName: z.string(),
});

export type BoxyProjectCreationInput = z.infer<typeof ZBoxyProjectCreationInput>;

export default function BoxyHQSetup() {
  const router = useRouter();
  const { t } = useLocale("audit-logs");
  const [isLoading, setIsLoading] = useState(false);

  async function onCreate(values: BoxyProjectCreationInput) {
    setIsLoading(true);
    const json = await (
      await fetch(`/api/integrations/${appConfig.slug}/createProject`, {
        method: "POST",
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    const appCredential = getClientSafeAppCredential.extend({ url: z.string() }).parse(json);

    if (appCredential.id) {
      setIsLoading(false);
      showToast("BoxyHQ App created successfully.", "success");
      router.push(appCredential.url);
    } else {
      showToast(json.message, "error");
    }
  }

  const projectCreationFormFields = [
    {
      name: "projectName",
      label: "Project Name",
      type: "string",
    },
    {
      name: "boxyHqEndpoint",
      label: "Endpoint",
      type: "string",
    },
    {
      name: "sudoKey",
      label: "Admin Root Key",
      type: "password",
    },
  ];

  const refForm = useRef<any | null>(null);

  return (
    <div className="bg-emphasis flex h-screen">
      <div className="bg-default m-auto flex min-h-[500px] flex-col justify-between rounded p-5 md:w-[600px] md:p-10">
        <div className="flex space-x-5">
          {/* eslint-disable @next/next/no-img-element */}
          <img
            src="/api/app-store/boxyhq-retraced/logo.png"
            alt="BoxyHQ Retraced"
            className="h-[50px] w-[50px] max-w-2xl"
          />
          <div>
            <h1 className="text-default">{t("auditlog_credentials_title")}</h1>
            <div className="mt-1 text-sm">{t("auditlog_credentials_description")} </div>
          </div>
        </div>
        <div className="flex w-full justify-center">
          <FormRenderer
            ref={refForm}
            FormZodSchema={ZBoxyProjectCreationInput}
            fields={projectCreationFormFields}
            onSubmit={onCreate}
          />
        </div>
        <div className="flex w-full justify-between">
          <Button type="submit" loading={isLoading} onClick={() => refForm.current?.submit()}>
            Submit
          </Button>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
