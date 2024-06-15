import {
  getDefaultAppSettings,
  getDefaultGeneralSettingsOptions,
} from "@calcom/features/audit-logs/constants";
import { type GeneralSettingsOption } from "@calcom/features/audit-logs/types";
import type { DefaultAppSettingOptionEntry } from "@calcom/features/audit-logs/types";
import { getHref } from "@calcom/features/audit-logs/utils";
import type { IconName } from "@calcom/ui";

import { ResetTemplatesCard } from "../components/general-settings/ResetTemplatesCard";

type BoxyAppSettingsOptionsEntry = {
  key: DefaultAppSettingOptionEntry | BoxyAppSettingsOptions;
  name: string;
  href: string;
  icon: IconName;
};

export enum BoxyAppSettingsOptions {
  "LOGS" = "logs",
}

export function getAppSettingsOptions(
  credentialId: number
): (BoxyAppSettingsOptionsEntry | DefaultAppSettingOptionEntry)[] {
  const defaultAppSettings = getDefaultAppSettings(credentialId);
  const boxyhqViewer: BoxyAppSettingsOptionsEntry = {
    key: BoxyAppSettingsOptions.LOGS,
    name: "Audit logs",
    href: getHref("/apps/installed/auditLogs", {
      credentialId: credentialId.toString(),
      activeOption: "logs",
    }),
    icon: "scroll-text",
  };
  return [...defaultAppSettings, boxyhqViewer];
}

export interface ResetSettingsOption extends GeneralSettingsOption {
  component?: (option: ResetSettingsOption) => JSX.Element;
}

export function getGeneralSettingsOptions(): GeneralSettingsOption[] {
  const defaultOptions = getDefaultGeneralSettingsOptions();
  const templateReset: ResetSettingsOption = {
    name: "Template",
    description: "Reset templates on all events.",
    button: "Reset",
    component: (option: ResetSettingsOption) => <ResetTemplatesCard option={option} />,
  };
  return [...defaultOptions, templateReset];
}
