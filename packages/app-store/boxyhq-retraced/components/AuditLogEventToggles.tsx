import { useState } from "react";

import { availableTriggerEvents, availableTriggerTargets } from "@calcom/features/audit-logs/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { AuditLogTriggerTargets } from "@calcom/prisma/enums";
import { trpc } from "@calcom/trpc";
import { Badge, Switch, Select } from "@calcom/ui";
import { showToast } from "@calcom/ui";

import { useAppCredential } from "../context/CredentialContext";
import ManagedAuditLogEventDialog from "./ManagedAuditLogEventDialog";

export const AuditLogEventToggles = () => {
  const { t } = useLocale();
  const { t: tAuditLogs } = useLocale("audit-logs");
  const { data, credentialId } = useAppCredential();

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

        <ul className="border-subtle divide-subtle my-4 h-[350px] divide-y overflow-scroll rounded-md border">
          {Object.values(availableTriggerEvents[value.key]).map((triggerEvent, key) => (
            <li key={key} className="hover:bg-muted group relative flex items-center  justify-between p-4 ">
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center">
                  <div className="text-default text-sm font-semibold ltr:mr-2 rtl:ml-2">
                    <span>{tAuditLogs(`events.${triggerEvent}.title`)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="grayWithoutHover" data-testid={true ? "required" : "optional"}>
                      {t("optional")}
                    </Badge>
                  </div>
                </div>
                <p className="text-subtle max-w-[280px] break-words pt-1 text-sm sm:max-w-[500px]">
                  {tAuditLogs(`events.${triggerEvent}.description`)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={!disabledEvents.has(triggerEvent)}
                  onCheckedChange={(checked) => {
                    handleEventToggle(checked, triggerEvent);
                  }}
                  classNames={{ container: "p-2 hover:bg-subtle rounded" }}
                  tooltip={
                    true ? tAuditLogs(`tooltipInformationEnabled`) : tAuditLogs(`tooltipInformationDisabled`)
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
