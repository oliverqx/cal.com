import * as Retraced from "@retracedhq/retraced";

import type { AuditLogsManager } from "@calcom/features/audit-logs/types";
import logger from "@calcom/lib/logger";

import type { AppKeys, AppSettings } from "../zod";

const log = logger.getSubLogger({ prefix: ["AuditLogManager"] });

export default class BoxyHQAuditLogManager implements AuditLogsManager {
  public client: undefined | Retraced.Client;
  constructor(appKeys: AppKeys, appSettings: AppSettings) {
    log.silly("Initializing BoxyHQAuditLogManager");

    this.client = new Retraced.Client({
      apiKey: appSettings.environments[appKeys.activeEnvironment].token,
      projectId: appKeys.projectId,
      endpoint: appKeys.endpoint,
    });
  }

  public async reportEvent(event: Retraced.Event) {
    return this.client?.reportEvent(event);
  }
}
