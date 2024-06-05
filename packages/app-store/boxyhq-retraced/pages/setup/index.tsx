import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useReducer, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import { z } from "zod";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Stepper, showToast } from "@calcom/ui";
import { Spinner } from "@calcom/ui/components/icon/Spinner";

import { ProjectCreationForm } from "../../components/ProjectCreationForm";
import appConfig from "../../config.json";
import { boxyEnvironmentTransformer } from "../../context/CredentialContext";
import {
  BoxySetupStages,
  creatingTemplates,
  credentialCreated,
  initialState,
  reducer,
} from "../../context/utils";
import { ZBoxyProjectCreationInput, appSettingsFormSchema, getClientSafeAppCredential } from "../../zod";
import type { AppSettingsForm, BoxyProjectCreationInput } from "../../zod";

const stages = {
  [BoxySetupStages.CONFIRMATION]: {
    state: BoxySetupStages.CONFIRMATION,
    text: {
      title: "confirm_credentials_title",
      description: "confirm_credentials_description",
    },
    component: ProjectCreationForm,
    button: (props: any) => {
      return (
        <Button type="submit" loading={props.isLoading} onClick={() => props.handleSubmitButton()}>
          {props.isDirty ? "Update" : "Continue"}
        </Button>
      );
    },
  },
  [BoxySetupStages.CREATION]: {
    state: BoxySetupStages.CREATION,
    text: {
      title: "auditlog_credentials_title",
      description: "auditlog_credentials_description",
    },
    component: ProjectCreationForm,
    buttonText: "Create",
  },
  [BoxySetupStages.TEMPLATE_CREATION]: {
    state: BoxySetupStages.TEMPLATE_CREATION,
    text: {
      title: "create_auditlog_templates",
      description: "create_templates_description",
    },
    component: () => <Spinner className="w-[30%]" />,
  },
};

export default function BoxyHQSetup() {
  const router = useRouter();
  const { t } = useLocale("audit-logs");
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(false);

  const confirmationForm = useForm<AppSettingsForm>({
    resolver: zodResolver(appSettingsFormSchema),
  });

  const creationForm = useForm<BoxyProjectCreationInput>({
    resolver: zodResolver(ZBoxyProjectCreationInput),
  });

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
    const parsedEnvironments = boxyEnvironmentTransformer.parse(appCredential.settings.environments);

    if (appCredential.id) {
      setIsLoading(false);
      showToast("BoxyHQ App created successfully.", "success");

      dispatch(credentialCreated(appCredential.id, appCredential.url, Object.values(parsedEnvironments)));

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
      await creationForm.handleSubmit(async (values) => await onCreate(values))();
    } else if (state.boxyCredentialState === BoxySetupStages.CONFIRMATION) {
      return dispatch(creatingTemplates());
      // router.push(state.credentialInfo.url);
    } else {
      return;
    }
  }

  const Component = stages[state.boxyCredentialState].component;

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
            <h1 className="text-default">{t(stages[state.boxyCredentialState].text.title)}</h1>
            <div className="mt-1 text-sm">{t(stages[state.boxyCredentialState].text.description)} </div>
          </div>
        </div>
        <div className="flex w-full justify-center">
          {/* <ProjectCreationForm form={props.creationForm} /> */}
          <Component form={creationForm} />
        </div>
        <div className="flex w-full justify-between">
          <Stepper href="" step={1} steps={[1, 2]} />
          {stages[state.boxyCredentialState].state === BoxySetupStages.CONFIRMATION ? (
            stages[state.boxyCredentialState].button({
              isLoading,
              handleSubmitButton,
              isDirty: confirmationForm.formState.isDirty,
            })
          ) : (
            <Button type="submit" loading={isLoading} onClick={() => handleSubmitButton()}>
              Submit
            </Button>
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
