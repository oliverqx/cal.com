import { faker } from "@faker-js/faker";
import { vi, describe, test, expect, beforeAll } from "vitest";

import { createEvent } from "@calcom/features/audit-logs/lib/handleAuditLogTrigger";
import { flattenObject } from "@calcom/features/audit-logs/utils";

import AuditLogManager from "./AuditLogManager";

const mockReportEvent = vi.fn();
vi.mock("@retracedhq/retraced", () => ({
  Client: vi.fn().mockImplementation(() => {
    return { reportEvent: mockReportEvent };
  }),
}));
let boxyHqAuditLogManager: AuditLogManager;
describe("BoxyHQ Audit Log Manager", () => {
  beforeAll(() => {
    boxyHqAuditLogManager = new AuditLogManager(
      {
        activeEnvironment: "test",
        endpoint: "http://localhost:3000",
        projectId: faker.datatype.uuid(),
        disabledEvents: [],
        environments: {
          test: {
            id: faker.datatype.uuid(),
            name: "Testing Environment",
            token: faker.datatype.uuid(),
          },
        },
        projectName: "Cal.com",
      },
      1
    );
  });

  test("intercepts a SYSTEM_MISC trigger and assigns it the proper implementation specific action.", async () => {
    mockReportEvent.mockImplementation((_) => {
      // Retraced SDK returns eventId, which is a number
      return Promise.resolve(1);
    });

    const data = { implementationAction: "SYSTEM_TEMPLATE_UPDATED" };
    const event = {
      ...createEvent("systemMisc", { id: "1", name: "Oliver Q." }, data),
      is_anonymous: false,
      is_failure: false,
      group: {
        id: "default",
        name: "default",
      },
      fields: flattenObject(data),
      created: new Date(),
      source_ip: faker.internet.ipv4(),
    };

    await boxyHqAuditLogManager.reportEvent(event);

    expect(mockReportEvent).toHaveBeenCalledWith({ ...event, action: "SYSTEM_TEMPLATE_UPDATED" });
  });

  test("intercepts a SYSTEM_CREDENTIALS_UPDATED trigger and assigns EVENT_OFF when an event was disabled", async () => {
    mockReportEvent.mockImplementation((_) => {
      // Retraced SDK returns eventId, which is a number
      return Promise.resolve(1);
    });

    const data = {
      id: 1,
      oldCredential: { key: { disabledEvents: [1, 2, 3] } },
      newCredential: { key: { disabledEvents: [1, 2, 3, 4] } },
    };
    const event = {
      ...createEvent("updateAppCredentials", { id: "1", name: "Oliver Q." }, data),
      is_anonymous: false,
      is_failure: false,
      group: {
        id: "default",
        name: "default",
      },
      fields: flattenObject(data),
      created: new Date(),
      source_ip: faker.internet.ipv4(),
    };
    await boxyHqAuditLogManager.reportEvent(event);
    expect(mockReportEvent).toHaveBeenCalledWith({ ...event, action: "EVENT_OFF" });
  });

  test("intercepts a SYSTEM_CREDENTIALS_UPDATED trigger and assigns EVENT_ON when an event was enabled", async () => {
    mockReportEvent.mockImplementation((_) => {
      // Retraced SDK returns eventId, which is a number
      return Promise.resolve(1);
    });

    const data = {
      id: 1,
      oldCredential: { key: { disabledEvents: [1, 2, 3, 4] } },
      newCredential: { key: { disabledEvents: [1, 2, 3] } },
    };
    const event = {
      ...createEvent("updateAppCredentials", { id: "1", name: "Oliver Q." }, data),
      is_anonymous: false,
      is_failure: false,
      group: {
        id: "default",
        name: "default",
      },
      fields: flattenObject(data),
      created: new Date(),
      source_ip: faker.internet.ipv4(),
    };
    await boxyHqAuditLogManager.reportEvent(event);
    expect(mockReportEvent).toHaveBeenCalledWith({ ...event, action: "EVENT_OFF" });
  });
});
