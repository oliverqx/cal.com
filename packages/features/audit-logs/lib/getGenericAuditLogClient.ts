import type { AvailableTriggerEventsType } from "../constants";
import type { AuditLogEvent, GenericAuditLogClient } from "../types";

export function getGenericAuditLogClient(
  apiKey: string,
  projectId: string,
  endpoint: string,
  disabledEvents: AvailableTriggerEventsType[]
): GenericAuditLogClient {
  return {
    credentials: {
      apiKey: apiKey,
      projectId: projectId,
      endpoint: endpoint,
      disabledEvents,
    },
    reportEvent: (event: AuditLogEvent) => {
      console.log({ ...event });
    },
  };
}
