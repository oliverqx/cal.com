import * as Retraced from "@retracedhq/retraced";

import type { AppKeys } from "@calcom/app-store/boxyhq-retraced/zod";
import type { AuditLogEvent, AuditLogsManager } from "@calcom/features/audit-logs/types";
import logger from "@calcom/lib/logger";

const log = logger.getSubLogger({ prefix: ["AuditLogManager"] });

export default class BoxyHQAuditLogManager implements AuditLogsManager {
  private client: undefined | Retraced.Client;
  constructor(appKeys: AppKeys) {
    log.silly("Initializing BoxyHQAuditLogManager");

    this.client = new Retraced.Client({
      apiKey: appKeys.apiKey,
      projectId: appKeys.projectId,
      endpoint: appKeys.endpoint,
    });
  }

  public async reportEvent(event: AuditLogEvent) {
    return await this.client?.reportEvent({
      action: event.action,
      group: {
        id: "dev",
        name: "dev",
      },
      crud: "c",
      created: new Date(),
      source_ip: "127.0.0.1",
      actor: event.actor,
      target: {
        ...event.target,
        id: "100",
      },
    });
  }
}
