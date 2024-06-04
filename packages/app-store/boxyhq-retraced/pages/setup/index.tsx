import { zodResolver } from "@hookform/resolvers/zod";
import type { BoxyHQCredentialState } from "boxyhq-retraced/context/utils";
import {
  BoxySetupStages,
  afterCredentialCreationSetup,
  initialState,
  reducer,
} from "boxyhq-retraced/context/utils";
import { useRouter } from "next/navigation";
import { useReducer } from "react";
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

const stageText: Record<BoxySetupStages, { title: string; description: string }> = {
  CREATION: {
    title: "provide_auditlog_credentials",
    description: "generate_api_key_description",
  },
  CONFIRMATION: {
    title: "create_auditlog_templates",
    description: "create_auditLog_description",
  },
};

export default function BoxyHQSetup() {
  const router = useRouter();
  const { t } = useLocale("audit-logs");
  const [state, dispatch] = useReducer(reducer, initialState);

  const confirmationForm = useForm<AppSettingsForm>({
    resolver: zodResolver(appSettingsFormSchema),
  });

  const creationForm = useForm<BoxyProjectCreationInput>({
    resolver: zodResolver(ZBoxyProjectCreationInput),
  });

  async function onCreate(values: BoxyProjectCreationInput) {
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
    const parsedEnvironments = boxyEnvironmentTransformer.parse(appCredential.settings.environments);

    if (appCredential.id) {
      showToast("BoxyHQ App created successfully.", "success");

      dispatch(
        afterCredentialCreationSetup(appCredential.id, appCredential.url, Object.values(parsedEnvironments))
      );

      confirmationForm.reset({
        activeEnvironment: parsedEnvironments[appCredential.key.activeEnvironment],
        endpoint: appCredential.key.endpoint,
        projectName: appCredential.settings.projectName,
      });
    } else {
      showToast(json.message, "error");
    }
  }

  async function handleSubmitButton() {
    if (state.boxyCredentialState === BoxySetupStages.CREATION) {
      return creationForm.handleSubmit(async (values) => await onCreate(values))();
    } else {
      router.push(state.credentialInfo.url);
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
              <h1 className="text-default">{t(stageText[state.boxyCredentialState].title)}</h1>
              <div className="mt-1 text-sm">{t(stageText[state.boxyCredentialState].description)} </div>
            </div>
          </div>
          {renderStage({
            state,
            creationForm,
            confirmationForm,
            handleSubmitButton,
          })}
        </div>
        {/* <Stepper href="" step={1} steps={stageText} /> */}
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

type RenderStageProps = {
  creationForm: UseFormReturn<BoxyProjectCreationInput, any>;
  confirmationForm: UseFormReturn<AppSettingsForm, any>;
  handleSubmitButton: () => Promise<void>;
  state: BoxyHQCredentialState;
};
function renderStage(props: RenderStageProps) {
  switch (props.state.boxyCredentialState) {
    case BoxySetupStages.CREATION:
      return (
        <>
          <div>
            <ProjectCreationForm form={props.creationForm} />;
          </div>
          <div className="flex w-full justify-end">
            <Button type="submit" onClick={() => props.handleSubmitButton()}>
              Submit
            </Button>
          </div>
        </>
      );
    case BoxySetupStages.CONFIRMATION:
      return (
        <>
          <div>
            <CredentialsForm
              options={props.state.credentialInfo.options}
              hideBtn
              form={props.confirmationForm}
              action={FormAction.CREATE}
            />
          </div>
          <div className="flex w-full justify-end">
            <Button type="submit" onClick={() => props.handleSubmitButton()}>
              {props.confirmationForm.formState.isDirty ? "Update" : "Continue"}
            </Button>
          </div>
        </>
      );
    default:
      return null;
  }
}
