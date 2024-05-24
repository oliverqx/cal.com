import { getDefaultAppSettings } from "@calcom/features/audit-logs/constants";
import type { AppSettingOptionEntry } from "@calcom/features/audit-logs/types";
import { getHref } from "@calcom/features/audit-logs/utils";

export function getAppSettingsOptions(credentialId: number): AppSettingOptionEntry[] {
  const defaultAppSettings = getDefaultAppSettings(credentialId);
  const boxyhqViewer: AppSettingOptionEntry = {
    name: "Audit logs",
    href: getHref("/apps/installed/auditLogs", {
      credentialId: credentialId.toString(),
      activeOption: "logs",
    }),
    icon: "scroll-text",
  };
  return [...defaultAppSettings, boxyhqViewer];
}
