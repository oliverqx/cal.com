-- CreateEnum
CREATE TYPE "AuditLogTriggerTargets" AS ENUM ('BOOKING', 'SYSTEM', 'CREDENTIAL', 'WEBHOOKS', 'API_KEYS', 'SCHEDULE', 'EVENT_TYPES', 'TEAMS', 'USER_PROFILE', 'PASSWORD', 'IMPERSONATION', 'APPS', 'ROUTING_FORMS', 'WORKFLOWS', 'SETTINGS');

-- CreateEnum
CREATE TYPE "AuditLogSystemTriggerEvents" AS ENUM ('SYSTEM_PING', 'SYSTEM_SETTINGS_UPDATED', 'SYSTEM_MISC', 'SYSTEM_EVENT_OFF', 'SYSTEM_EVENT_ON');

-- CreateEnum
CREATE TYPE "AuditLogBookingTriggerEvents" AS ENUM ('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_PAYMENT_INITIATED', 'BOOKING_PAID', 'BOOKING_RESCHEDULED', 'BOOKING_REQUESTED', 'BOOKING_CANCELLED', 'BOOKING_REJECTED');

-- CreateEnum
CREATE TYPE "AuditLogAppTriggerEvents" AS ENUM ('APP_KEYS_UPDATED', 'APP_TOGGLE', 'APP_CREATED');

-- CreateEnum
CREATE TYPE "AuditLogCredentialTriggerEvents" AS ENUM ('CREDENTIAL_KEYS_UPDATED', 'CREDENTIAL_CREATED', 'CREDENTIAL_DELETED')

-- CreateEnum
CREATE TYPE "AuditLogApiKeysTriggerEvents" AS ENUM ('API_KEY_CREATED', 'API_KEY_UPDATED', 'API_KEY_DELETED', 'API_KEY_USED', 'API_KEY_LIST_ALL_KEYS', 'API_KEY_FIND_KEY');

-- CreateEnum
CREATE TYPE "AuditLogWebhookTriggerEvents" AS ENUM ('WEBHOOK_CREATED', 'WEBHOOK_DELETED', 'WEBHOOK_UPDATED', 'WEBHOOK_TESTED', 'WEBHOOK_SCHEDULED');
