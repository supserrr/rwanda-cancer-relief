-- Migration: Update profiles with structured patient preference fields
-- Description: Adds dedicated columns for patient contact, emergency, and preference data
--              and backfills values from existing metadata.
-- Created: 2025-11-10

BEGIN;

-- Add new structured columns for patient settings/preferences
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS preferred_language TEXT,
    ADD COLUMN IF NOT EXISTS contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
    ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
    ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS security_preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
    ADD COLUMN IF NOT EXISTS support_preferences JSONB NOT NULL DEFAULT '{}'::JSONB;

-- Backfill from metadata where possible
WITH metadata_source AS (
    SELECT
        id,
        metadata,
        COALESCE(metadata ->> 'preferredLanguage', metadata ->> 'language') AS preferred_language,
        metadata ->> 'phoneNumber' AS contact_phone,
        metadata ->> 'emergencyContactName' AS emergency_contact_name,
        metadata ->> 'emergencyContactPhone' AS emergency_contact_phone,
        metadata -> 'notificationPreferences' AS notification_preferences,
        metadata -> 'securityPreferences' AS security_preferences,
        metadata -> 'supportPreferences' AS support_preferences,
        metadata ->> 'treatmentStage' AS treatment_stage
    FROM profiles
)
UPDATE profiles p
SET
    preferred_language = COALESCE(p.preferred_language, ms.preferred_language),
    contact_phone = COALESCE(p.contact_phone, ms.contact_phone, p.phone_number),
    emergency_contact_name = COALESCE(p.emergency_contact_name, ms.emergency_contact_name),
    emergency_contact_phone = COALESCE(p.emergency_contact_phone, ms.emergency_contact_phone),
    notification_preferences = CASE
        WHEN (p.notification_preferences IS NULL OR p.notification_preferences = '{}'::JSONB) AND ms.notification_preferences IS NOT NULL
            THEN ms.notification_preferences
        ELSE p.notification_preferences
    END,
    security_preferences = CASE
        WHEN (p.security_preferences IS NULL OR p.security_preferences = '{}'::JSONB) AND ms.security_preferences IS NOT NULL
            THEN ms.security_preferences
        ELSE p.security_preferences
    END,
    support_preferences = CASE
        WHEN (p.support_preferences IS NULL OR p.support_preferences = '{}'::JSONB) AND ms.support_preferences IS NOT NULL
            THEN ms.support_preferences
        ELSE p.support_preferences
    END,
    treatment_stage = COALESCE(p.treatment_stage, ms.treatment_stage)
FROM metadata_source ms
WHERE p.id = ms.id;

-- Ensure JSON columns default to empty object for existing rows
UPDATE profiles
SET notification_preferences = COALESCE(notification_preferences, '{}'::JSONB),
    security_preferences = COALESCE(security_preferences, '{}'::JSONB),
    support_preferences = COALESCE(support_preferences, '{}'::JSONB);

COMMIT;

