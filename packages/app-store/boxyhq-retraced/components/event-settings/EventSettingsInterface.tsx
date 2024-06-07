import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dispatch } from "react";
import { useState, Fragment, useEffect } from "react";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AvailableTriggerEventsType } from "@calcom/features/audit-logs/constants";
import { availableTriggerEvents, availableTriggerTargets } from "@calcom/features/audit-logs/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { AuditLogTriggerTargets } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc";
import { Switch, Select, Icon, Button } from "@calcom/ui";
import { showToast } from "@calcom/ui";
import { Form, InputField } from "@calcom/ui";

import appConfig from "../../config.json";
import { useAppCredential } from "../../context/CredentialContext";
import ManagedAuditLogEventDialog from "./ManagedAuditLogEventDialog";

export const EventSettingsInterface = ({ templates }: { templates: Map<string, BoxyTemplate> }) => {
  const { t } = useLocale();

  const { data, credentialId, sudoKey } = useAppCredential();

  // Select related
  const [value, setValue] = useState<{ label: string; value: AuditLogTriggerTargets; key: string }>(
    availableTriggerTargets.booking
  );
  function onChange(key: string | undefined) {
    if (key) {
      const index = Object.keys(availableTriggerTargets).indexOf(key);
      setValue(Object.values(availableTriggerTargets)[index]);
    } else {
      setValue(Object.values(availableTriggerTargets)[0]);
    }
  }

  // Toggle related
  const [triggerEvent, setTriggerEvent] = useState({ checked: true, action: "" });
  const [disabledEvents, setDisabledEvents] = useState<Set<string>>(new Set(data?.settings.disabledEvents));
  const updateCredentialSettingsMutation = trpc.viewer.appsRouter.updateCredentialSettings.useMutation({
    onSuccess: () => {
      showToast(t("keys_have_been_saved"), "success");
    },
    onError: (error) => {
      showToast(error.message, "error");
    },
  });
  function handleEventToggle(checked: boolean, action: string) {
    setOpen(true);
    setTriggerEvent({ checked, action });
  }

  // ManagedAuditLogEventDialog Related
  const [isOpen, setOpen] = useState(false);
  function handleOpenChange() {
    setOpen((isOpen) => !isOpen);
  }
  async function handleOnConfirm() {
    updateCredentialSettingsMutation.mutate({
      credentialId: credentialId.toString(),
      settings: { toBeDisabled: !triggerEvent.checked, event: triggerEvent.action },
    });

    const newDisabledEvents = disabledEvents;
    if (!triggerEvent.checked) {
      newDisabledEvents.add(triggerEvent.action);
      setDisabledEvents(newDisabledEvents);
    } else {
      newDisabledEvents.delete(triggerEvent.action);
      setDisabledEvents(newDisabledEvents);
    }
  }

  // Template editing related
  const [activeTemplate, setActiveTemplate] = useState<undefined | string>(undefined);

  const form = useForm<{ template: string }>({
    resolver: zodResolver(z.object({ template: z.string() })),
  });

  useEffect(() => {
    if (activeTemplate) {
      form.reset({ template: templates?.get(activeTemplate)?.template });
    }
  }, [templates, activeTemplate, form]);

  const queryClient = useQueryClient();

  const { mutate: updateTemplateMutation, isPending } = useMutation({
    mutationFn: async ({ template }: { template: string }) => {
      if (!activeTemplate || !data) return;
      const response = await fetch(`/api/integrations/${appConfig.slug}/updateTemplate`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          projectId: data.key.projectId,
          templateId: templates?.get(activeTemplate)?.id,
          environmentId: data.key.activeEnvironment,
          sudoKey,
          endpoint: data.key.endpoint,
          newTemplate: template,
          eventTriggerToMatch: activeTemplate,
        }),
      });

      if (response.status === 200) {
        showToast("Templates created successfully.", "success");
      } else {
        showToast("Templates creation failed. Please ensure your credentials are valid.", "error");
      }

      setOpen(false);

      return {
        status: response.status,
        message: response.statusText,
        lastCheck: new Date().toLocaleString(),
      };
    },
    // make sure to _return_ the Promise from the query invalidation
    // so that the mutation stays in `pending` state until the refetch is finished
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["getTemplates", credentialId.toString()] });
    },
  });

  function setFormValue(triggerEvent: string) {
    setActiveTemplate(triggerEvent);
  }

  function submitUpdateTemplate() {
    form.handleSubmit(async (values) => updateTemplateMutation(values))();
  }

  return (
    <>
      <ManagedAuditLogEventDialog
        isPending={false}
        action={triggerEvent.action}
        onOpenChange={() => handleOpenChange()}
        onConfirm={() => handleOnConfirm()}
        isOpen={isOpen}
      />
      <div className="grid h-[100%] w-[100%]">
        <Select<{ label: string; value: AuditLogTriggerTargets; key: string }>
          className="capitalize"
          options={Object.values(availableTriggerTargets)}
          value={value}
          onChange={(e) => onChange(e?.key)}
        />

        <ul className="border-subtle divide-subtle my-4 h-[350px] divide-y overflow-scroll rounded-md border p-0">
          {typeof templates !== undefined && templates
            ? Object.values(availableTriggerEvents[value.key]).map(
                (triggerEvent: AvailableTriggerEventsType, key) => {
                  return (
                    <Fragment key={key}>
                      <EventSettings
                        isLoading={isPending}
                        setFormValue={setFormValue}
                        triggerEvent={triggerEvent}
                        disabled={disabledEvents.has(triggerEvent)}
                        handleEventToggle={handleEventToggle}
                        activeTemplate={activeTemplate}
                        form={form}
                        submitUpdateTemplate={submitUpdateTemplate}
                      />
                    </Fragment>
                  );
                }
              )
            : null}
        </ul>
      </div>
    </>
  );
};

export type BoxyTemplate = {
  project_id: string;
  environment_id: string;
  id: string;
  name: string;
  rule: string;
  template: string | undefined;
  created_at: string;
  updated_at: string | null;
};

function EventSettings({
  triggerEvent,
  disabled,
  handleEventToggle,
  setFormValue,
  activeTemplate,
  form,
  submitUpdateTemplate,
  isLoading,
}: {
  triggerEvent: AvailableTriggerEventsType;
  disabled: boolean;
  handleEventToggle: any;
  setFormValue: Dispatch<any>;
  activeTemplate: string | undefined;
  form: any;
  submitUpdateTemplate: any;
  isLoading: boolean;
}) {
  const { t: tAuditLogs } = useLocale("audit-logs");

  const isActive = activeTemplate === triggerEvent;
  return (
    <li className="hover:bg-muted group relative flex flex-col items-center  justify-between p-6 ">
      <div className="flex w-[100%] items-center justify-between">
        <div>
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="text-default text-sm font-semibold ltr:mr-2 rtl:ml-2">
              <span>{tAuditLogs(`events.${triggerEvent}.title`)}</span>
            </div>
          </div>
          <p className="text-subtle max-w-[280px] break-words pt-1 text-sm sm:max-w-[500px]">
            {tAuditLogs(`events.${triggerEvent}.description`)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon
            onClick={() => setFormValue(triggerEvent)}
            name="file-pen-line"
            className="mr-2 h-[16px] w-[16px] stroke-[2px] ltr:mr-2 rtl:ml-2 md:mt-0"
            data-testid="icon-component"
          />
          <Switch
            checked={!disabled}
            onCheckedChange={(checked) => {
              handleEventToggle(checked, triggerEvent);
            }}
            classNames={{ container: "p-2 hover:bg-subtle rounded" }}
            tooltip={
              true ? tAuditLogs(`tooltipInformationEnabled`) : tAuditLogs(`tooltipInformationDisabled`)
            }
          />
        </div>
      </div>
      {isActive ? (
        <div className="mt-[30px] w-full">
          <Form
            form={form}
            className="flex w-[100%] flex-col justify-between space-y-4"
            handleSubmit={async (values) => {
              console.log({ values });
            }}>
            <Controller
              name="template"
              control={form.control}
              render={({ field: { onBlur, onChange, value } }) => (
                <div className="col-span-4 col-start-2 row-start-1 flex flex-row items-end space-x-5">
                  <InputField
                    required
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    name="Template"
                    className="mb-1"
                    containerClassName="w-[100%]"
                  />
                  <Button
                    data-dirty={form.formState.isDirty}
                    className="mb-1 data-[dirty=false]:hidden "
                    loading={isLoading}
                    onClick={() => submitUpdateTemplate()}>
                    Submit
                  </Button>
                </div>
              )}
            />
          </Form>
        </div>
      ) : null}
    </li>
  );
}
