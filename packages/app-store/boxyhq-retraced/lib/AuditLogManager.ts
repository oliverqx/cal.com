import * as Retraced from "@retracedhq/retraced";

import type { AuditLogsManager } from "@calcom/features/audit-logs/types";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import {
  AuditLogTriggerTargets,
  AuditLogSystemTriggerEvents,
  AuditLogAppTriggerEvents,
} from "@calcom/prisma/enums";

import type { AppKeys } from "../zod";

const log = logger.getSubLogger({ prefix: ["AuditLogManager"] });

export default class BoxyHQAuditLogManager implements AuditLogsManager {
  public client: undefined | Retraced.Client;
  private id: number;
  constructor(appKeys: AppKeys, id: number) {
    log.silly("Initializing BoxyHQAuditLogManager");
    this.id = id;
    this.client = new Retraced.Client({
      apiKey: appKeys.environments[appKeys.activeEnvironment].token,
      projectId: appKeys.projectId,
      endpoint: appKeys.endpoint,
    });
  }

  public async reportEvent(event: any) {
    log.silly(
      "Report Event called",
      safeStringify({
        // TODO: Strip event of any sensitive info both here and before reporting within createEvent
        event,
      })
    );
    // If app updated is current AuditLog installation, report event as system change.
    if (event.action === AuditLogAppTriggerEvents.APP_KEYS_UPDATED && event.target.id === this.id) {
      event.action = AuditLogSystemTriggerEvents.SYSTEM_CREDENTIALS_UPDATED;
      event.target.type = AuditLogTriggerTargets.SYSTEM;
      // TODO: Event off/on is part of core feature not implementation.
      if (
        event.fields["oldCredential.key.disabledEvents"] !==
        event.fields["updatedCredential.key.disabledEvents"]
      ) {
        if (
          event.fields["oldCredential.key.disabledEvents"] >
          event.fields["updatedCredential.key.disabledEvents"]
        ) {
          event.action = "EVENT_ON";
        } else {
          event.action = "EVENT_OFF";
        }
      }
    }

    if (event.action === AuditLogSystemTriggerEvents.SYSTEM_MISC) {
      event.action = event.fields?.implementationAction;
    }

    return this.client?.reportEvent(event);
  }
}
