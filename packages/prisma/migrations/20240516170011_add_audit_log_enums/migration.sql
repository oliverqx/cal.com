-- CreateEnum
CREATE TYPE "AuditLogTriggerEvents" AS ENUM ('BOOKING_CREATED', 'BOOKING_PAYMENT_INITIATED', 'BOOKING_PAID', 'BOOKING_RESCHEDULED', 'BOOKING_REQUESTED', 'BOOKING_CANCELLED', 'BOOKING_REJECTED');

-- CreateEnum
CREATE TYPE "AuditLogTriggerTargets" AS ENUM ('BOOKING', 'WEBHOOKS', 'API_KEYS', 'SCHEDULE', 'EVENT_TYPES', 'TEAMS', 'USER_PROFILE', 'PASSWORD', 'IMPERSONATION');
