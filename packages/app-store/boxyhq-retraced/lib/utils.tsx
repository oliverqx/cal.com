import checkSession from "_utils/auth";
import type { NextApiRequest } from "next";

import {
  getDefaultAppSettings,
  getDefaultGeneralSettingsOptions,
} from "@calcom/features/audit-logs/constants";
import { type GeneralSettingsOption } from "@calcom/features/audit-logs/types";
import type { DefaultAppSettingOptionEntry } from "@calcom/features/audit-logs/types";
import { getHref } from "@calcom/features/audit-logs/utils";
import { HttpError } from "@calcom/lib/http-error";
import type { IconName } from "@calcom/ui";

import { BoxyHQTemplatesSettingsOptionCard } from "../components/BoxyHQTemplatesSettingsOptionCard";

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

export interface BoxyGeneralSettingsOption extends GeneralSettingsOption {
  resetDescription: string;
  resetButton: string;
  component?: (option: BoxyGeneralSettingsOption) => JSX.Element;
}

export function getGeneralSettingsOptions(): GeneralSettingsOption[] {
  const defaultOptions = getDefaultGeneralSettingsOptions();
  const templateReset: BoxyGeneralSettingsOption = {
    name: "Template",
    description: "Create default templates for all events.",
    button: "Create",
    resetDescription: "Reset templates to default values",
    resetButton: "Reset",
    component: (option: BoxyGeneralSettingsOption) => <BoxyHQTemplatesSettingsOptionCard option={option} />,
  };
  return [...defaultOptions, templateReset];
}

export function getIdentifier(req: NextApiRequest) {
  const session = checkSession(req);
  if (!session.user.email) {
    throw new HttpError({ statusCode: 401, message: "Unauthorized. User is missing email." });
  }
  return session.user.email; // Email will be used to identify user in BoxyHQ side
}
