import { AuditLogBookingTriggerEvents, AuditLogSystemTriggerEvents } from "@calcom/prisma/enums";

type BoxyHQTemplate = {
  name: string;
  rule: BoxyHQTemplateRule[];
  template: string;
};

type BoxyHQTemplateRule = {
  comparator: string;
  path: string;
  value: string;
};

const RULE = {
  comparator: "is",
  path: "action",
};

function getDefaultTemplate({
  eventTriggerToMatch,
  template,
}: {
  eventTriggerToMatch: string;
  template: string;
}): BoxyHQTemplate {
  return {
    name: eventTriggerToMatch,
    rule: [{ ...RULE, value: eventTriggerToMatch }],
    template,
  };
}

export const AuditLogBookingDefaultTemplates: BoxyHQTemplate[] = [
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_CANCELLED,
    template: "{{ actor.name }} cancelled {{ fields.bookingType }} event with {{ target.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_CREATED,
    template: "{{ actor.name }} booked {{ fields.bookingType }} event with {{ target.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_CONFIRMED,
    template: "{{ target.name }} confirmed {{ fields.bookingType }} event with {{ actor.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_PAID,
    template: "{{ actor.name }} paid {{ fields.bookingType }} event with {{ target.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_PAYMENT_INITIATED,
    template: "{{ actor.name }} initiated payment for {{ fields.bookingType }} with {{ target.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_REQUESTED,
    template: "{{ actor.name }} requested event {{ fields.bookingType }} with {{ target.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_REJECTED,
    template: "{{ actor.name }} rejected event {{ fields.bookingType }} with {{ target.name }}",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogBookingTriggerEvents.BOOKING_RESCHEDULED,
    template: "{{ actor.name }} rescheduled {{ fields.bookingType }} event with {{ target.name }}",
  }),
];

export const AuditLogSystemDefaultTemplates: BoxyHQTemplate[] = [
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogSystemTriggerEvents.SYSTEM_PING,
    template: "{{ actor.name }} pinged system.",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogSystemTriggerEvents.SYSTEM_CREDENTIALS_UPDATED,
    template: "{{ actor.name }} updated credentials.",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogSystemTriggerEvents.SYSTEM_TEMPLATE_UPDATED,
    template: "{{ actor.name }} updated template.",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogSystemTriggerEvents.SYSTEM_EVENT_OFF,
    template: "{{ actor.name }} disabled event reporting for x.",
  }),
  getDefaultTemplate({
    eventTriggerToMatch: AuditLogSystemTriggerEvents.SYSTEM_EVENT_ON,
    template: "{{ actor.name }} enabled event reporting for x.",
  }),
];

export const AuditLogDefaultTemplates = [
  ...AuditLogBookingDefaultTemplates,
  ...AuditLogSystemDefaultTemplates,
];
