-- Migration: Enable RLS on notification_types
-- Lint remediation: rls_disabled_in_public_public_notification_types
-- Created: 2025-11-11

BEGIN;

ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_types FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'notification_types'
          AND policyname = 'Authenticated users can read active notification types'
    ) THEN
        CREATE POLICY "Authenticated users can read active notification types"
            ON public.notification_types
            FOR SELECT
            TO authenticated
            USING (is_active IS TRUE);
    END IF;
END $$;

COMMIT;

