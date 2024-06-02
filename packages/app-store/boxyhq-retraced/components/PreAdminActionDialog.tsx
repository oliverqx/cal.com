import type { ReactElement, JSXElementConstructor } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { ConfirmationDialogContent, Dialog } from "@calcom/ui";

interface PreAdminActionDialogProps {
  onOpenChange: () => void;
  isLoading: boolean;
  isOpen: boolean;
  onConfirm: (e: { preventDefault: () => void }) => void;
  children: React.ReactNode;
  confirmBtn?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
}

export default function PreAdminActionDialog(props: PreAdminActionDialogProps) {
  const { t } = useLocale("audit-logs");
  const { onOpenChange, isLoading, onConfirm, isOpen } = props;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <ConfirmationDialogContent
        isPending={isLoading}
        variety="information"
        title={t("admin_action_auditLog_dialog_title", {
          actionKey: "asdf",
        })}
        confirmDisabled={isLoading}
        cancelBtnText={t("go_back")}
        confirmBtn={props.confirmBtn}>
        {props.children}
      </ConfirmationDialogContent>
    </Dialog>
  );
}
