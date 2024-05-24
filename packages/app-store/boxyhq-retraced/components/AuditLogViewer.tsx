// Package is vanilla js. No typings available.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import RetracedEventsBrowser from "@retracedhq/logs-viewer";
import { useQuery } from "@tanstack/react-query";

import { showToast } from "@calcom/ui";

import appConfig from "../config.json";

export const AuditLogViewer = ({ credentialId }: { credentialId: number }) => {
  const { data: viewerToken } = useQuery({
    queryKey: ["viewerToken", credentialId.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/${appConfig.slug}/viewerToken`, {
        method: "post",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
          credentialId,
        }),
      });

      if (response.status === 200) {
        showToast("Viewer token retrieved successfully.", "success");
      } else {
        showToast("Unable to fetch viewer token, please review your credentials.", "error");
      }

      return await response.json();
    },
  });

  return (
    <RetracedEventsBrowser
      auditLogToken={viewerToken?.message}
      host="http://localhost:3000/auditlog/viewer/v1"
      header="My Audit Log"
      mount={true}
    />
  );
};
