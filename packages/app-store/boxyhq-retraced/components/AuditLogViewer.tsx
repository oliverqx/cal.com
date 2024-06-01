import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { showToast } from "@calcom/ui";

import appConfig from "../config.json";
import { useAppCredential } from "../context/CredentialContext";

// Package is vanilla js. No typings available.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const RetracedEventsBrowser = dynamic(() => import("@retracedhq/logs-viewer"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

export const AuditLogViewer = () => {
  const credentialId = useAppCredential;
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

      console.log({ response });

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      auditLogToken={viewerToken?.message}
      host="http://localhost:3000/auditlog/viewer/v1"
      header="My Audit Log"
      mount={true}
    />
  );
};
