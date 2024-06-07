import { useSearchParams } from "next/navigation";

import { DefaultAppSettingsOptions } from "@calcom/features/audit-logs/types";

import { useAppCredential, AuditLogCredentialProvider } from "../context/CredentialContext";
import { BoxyAppSettingsOptions } from "../lib/utils";
import { AuditLogViewer } from "./AuditLogViewer";
import { AuditSystemStatus } from "./AuditSystemStatus";
import { NavigationPanel } from "./NavigationPanel";
import { EventSettingsGuard } from "./event-settings/EventSettingsGuard";
import { AppKeyForm } from "./forms/AppKeyForm";
import { GeneralSettings } from "./general-settings/GeneralSettings";

export default function AppSettings(props: { credentialId: number }) {
  return (
    <AuditLogCredentialProvider credentialId={props.credentialId}>
      <Interface />
    </AuditLogCredentialProvider>
  );
}

function Interface() {
  const { isLoading, credentialId } = useAppCredential();
  const searchParams = useSearchParams();
  const activePanel = searchParams.get(credentialId.toString());

  if (isLoading) return null;

  return (
    <div className="align-right space-y-4 px-4 pb-10 pt-4">
      <div className="items-between flex space-x-4">
        <div className="flex w-[25%] flex-col space-y-4">
          <AuditSystemStatus />
          <NavigationPanel />
        </div>
        <div className="flex w-[80%] flex-col justify-between space-y-4">{renderPanel(activePanel)}</div>
      </div>
    </div>
  );
}

function renderPanel(activePanel: string | null) {
  switch (activePanel) {
    case DefaultAppSettingsOptions.TRIGGERS: {
      return <EventSettingsGuard />;
    }

    case DefaultAppSettingsOptions.GENERAL: {
      return <GeneralSettings />;
    }

    case BoxyAppSettingsOptions.LOGS: {
      return <AuditLogViewer />;
    }

    // DefaultAppSettingsOptions.CREDENTIALS
    default:
      return <AppKeyForm />;
  }
}
