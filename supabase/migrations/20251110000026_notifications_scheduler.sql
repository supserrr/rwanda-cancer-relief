-- Migration: Notification scheduling metadata and lookup tables
-- Created: 2025-11-10

BEGIN;

CREATE TABLE IF NOT EXISTS notification_types (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    default_priority TEXT NOT NULL DEFAULT 'normal' CHECK (default_priority IN ('low', 'normal', 'high', 'critical')),
    default_channels TEXT[] NOT NULL DEFAULT ARRAY['in_app']::TEXT[],
    default_delay_seconds INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO notification_types (key, name, description, category, default_priority, default_channels, default_delay_seconds)
VALUES
    (
        'message_received',
        'New Message',
        'Triggered when a new chat message is received.',
        'communication',
        'high',
        ARRAY['in_app']::TEXT[],
        0
    ),
    (
        'patient_assignment',
        'New Patient Assignment',
        'Triggered when a counselor is assigned a new patient.',
        'operations',
        'high',
        ARRAY['in_app']::TEXT[],
        0
    ),
    (
        'session_reminder',
        'Session Reminder',
        'Reminder about an upcoming counseling session.',
        'reminder',
        'normal',
        ARRAY['in_app']::TEXT[],
        3600
    ),
    (
        'system_alert',
        'System Alert',
        'Important updates or maintenance notifications from administrators.',
        'system',
        'critical',
        ARRAY['in_app']::TEXT[],
        0
    )
ON CONFLICT (key) DO UPDATE
SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    default_priority = EXCLUDED.default_priority,
    default_channels = EXCLUDED.default_channels,
    default_delay_seconds = EXCLUDED.default_delay_seconds,
    updated_at = NOW();

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS type_key TEXT,
    ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'scheduled', 'sent', 'failed', 'cancelled')),
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    ADD COLUMN IF NOT EXISTS channels TEXT[] NOT NULL DEFAULT ARRAY['in_app']::TEXT[],
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_key_fkey;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_key_fkey
        FOREIGN KEY (type_key) REFERENCES notification_types(key) ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_schedule
    ON notifications(user_id, scheduled_for)
    WHERE delivery_status IN ('pending', 'scheduled');

CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status
    ON notifications(delivery_status);

CREATE INDEX IF NOT EXISTS idx_notifications_type_key
    ON notifications(type_key);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_notifications_timestamp'
    ) THEN
        CREATE TRIGGER update_notifications_timestamp
            BEFORE UPDATE ON notifications
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

COMMIT;

