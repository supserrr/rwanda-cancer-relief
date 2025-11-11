-- Migration: Optimize RLS policies by caching auth functions
-- Addresses Supabase lint warnings 0003 (auth_rls_initplan) and 0006 (multiple_permissive_policies)
-- Created: 2025-11-11

BEGIN;

------------------------------------------------------------------------------
-- Helper expressions
------------------------------------------------------------------------------

-- Drop and rebuild chat participation helper to use (select auth.jwt()).
CREATE OR REPLACE FUNCTION public.is_participant(chat_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chats c
    WHERE c.id = chat_id
      AND (
        user_id = ANY(c.participants)
        OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
      )
  );
$$;

------------------------------------------------------------------------------
-- Sessions
------------------------------------------------------------------------------

DROP POLICY IF EXISTS sessions_select_policy ON public.sessions;
DROP POLICY IF EXISTS sessions_insert_policy ON public.sessions;
DROP POLICY IF EXISTS sessions_update_policy ON public.sessions;
DROP POLICY IF EXISTS sessions_delete_policy ON public.sessions;

CREATE POLICY sessions_select_policy
    ON public.sessions FOR SELECT
    USING (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY sessions_insert_policy
    ON public.sessions FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY sessions_update_policy
    ON public.sessions FOR UPDATE
    USING (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY sessions_delete_policy
    ON public.sessions FOR DELETE
    USING (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Counselor documents
------------------------------------------------------------------------------

DROP POLICY IF EXISTS counselor_documents_select_policy ON public.counselor_documents;
DROP POLICY IF EXISTS counselor_documents_insert_policy ON public.counselor_documents;
DROP POLICY IF EXISTS counselor_documents_update_policy ON public.counselor_documents;
DROP POLICY IF EXISTS counselor_documents_delete_policy ON public.counselor_documents;

CREATE POLICY counselor_documents_select_policy
    ON public.counselor_documents FOR SELECT
    USING (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY counselor_documents_insert_policy
    ON public.counselor_documents FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY counselor_documents_update_policy
    ON public.counselor_documents FOR UPDATE
    USING (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY counselor_documents_delete_policy
    ON public.counselor_documents FOR DELETE
    USING (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Chats
------------------------------------------------------------------------------

DROP POLICY IF EXISTS chats_select_policy ON public.chats;
DROP POLICY IF EXISTS chats_insert_policy ON public.chats;
DROP POLICY IF EXISTS chats_update_policy ON public.chats;
DROP POLICY IF EXISTS chats_delete_policy ON public.chats;

CREATE POLICY chats_select_policy
    ON public.chats FOR SELECT
    USING (
      (SELECT auth.uid()) = ANY(participants)
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY chats_insert_policy
    ON public.chats FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = ANY(participants)
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY chats_update_policy
    ON public.chats FOR UPDATE
    USING (
      (SELECT auth.uid()) = ANY(participants)
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY chats_delete_policy
    ON public.chats FOR DELETE
    USING (
      (SELECT auth.uid()) = ANY(participants)
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Messages
------------------------------------------------------------------------------

DROP POLICY IF EXISTS messages_select_policy ON public.messages;
DROP POLICY IF EXISTS messages_insert_policy ON public.messages;
DROP POLICY IF EXISTS messages_update_policy ON public.messages;
DROP POLICY IF EXISTS messages_delete_policy ON public.messages;

CREATE POLICY messages_select_policy
    ON public.messages FOR SELECT
    USING (
      public.is_participant(chat_id, (SELECT auth.uid()))
    );

CREATE POLICY messages_insert_policy
    ON public.messages FOR INSERT
    WITH CHECK (
      (
        sender_id = (SELECT auth.uid())
        AND public.is_participant(chat_id, (SELECT auth.uid()))
      )
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY messages_update_policy
    ON public.messages FOR UPDATE
    USING (
      sender_id = (SELECT auth.uid())
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      sender_id = (SELECT auth.uid())
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY messages_delete_policy
    ON public.messages FOR DELETE
    USING (
      sender_id = (SELECT auth.uid())
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Profiles
------------------------------------------------------------------------------

DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;

CREATE POLICY profiles_select_policy
    ON public.profiles FOR SELECT
    USING (
      (SELECT auth.uid()) = id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
      OR role = 'counselor'
      OR assigned_counselor_id = (SELECT auth.uid())
    );

CREATE POLICY profiles_update_policy
    ON public.profiles FOR UPDATE
    USING (
      (SELECT auth.uid()) = id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      (SELECT auth.uid()) = id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Counselor profiles
------------------------------------------------------------------------------

DROP POLICY IF EXISTS counselor_profiles_select_policy ON public.counselor_profiles;
DROP POLICY IF EXISTS counselor_profiles_update_policy ON public.counselor_profiles;

CREATE POLICY counselor_profiles_select_policy
    ON public.counselor_profiles FOR SELECT
    USING (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY counselor_profiles_update_policy
    ON public.counselor_profiles FOR UPDATE
    USING (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      (SELECT auth.uid()) = profile_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Patient progress & items
------------------------------------------------------------------------------

DROP POLICY IF EXISTS patient_progress_select ON public.patient_progress;
DROP POLICY IF EXISTS patient_progress_insert ON public.patient_progress;
DROP POLICY IF EXISTS patient_progress_update ON public.patient_progress;
DROP POLICY IF EXISTS patient_progress_delete ON public.patient_progress;

CREATE POLICY patient_progress_select
    ON public.patient_progress FOR SELECT
    USING (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = assigned_counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY patient_progress_insert
    ON public.patient_progress FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = assigned_counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY patient_progress_update
    ON public.patient_progress FOR UPDATE
    USING (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = assigned_counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      (SELECT auth.uid()) = patient_id
      OR (SELECT auth.uid()) = assigned_counselor_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY patient_progress_delete
    ON public.patient_progress FOR DELETE
    USING (
      COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

DROP POLICY IF EXISTS patient_progress_items_access ON public.patient_progress_items;

CREATE POLICY patient_progress_items_access
    ON public.patient_progress_items FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.patient_progress pp
        WHERE pp.id = progress_id
          AND (
            (SELECT auth.uid()) = pp.patient_id
            OR (SELECT auth.uid()) = pp.assigned_counselor_id
            OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
          )
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.patient_progress pp
        WHERE pp.id = progress_id
          AND (
            (SELECT auth.uid()) = pp.patient_id
            OR (SELECT auth.uid()) = pp.assigned_counselor_id
            OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
          )
      )
    );

------------------------------------------------------------------------------
-- Resource metrics
------------------------------------------------------------------------------

DROP POLICY IF EXISTS resource_metrics_select ON public.resource_metrics;
DROP POLICY IF EXISTS resource_metrics_upsert ON public.resource_metrics;

CREATE POLICY resource_metrics_select
    ON public.resource_metrics FOR SELECT
    USING (
      user_id IS NULL
      OR (SELECT auth.uid()) = user_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') IN ('admin', 'counselor')
    );

CREATE POLICY resource_metrics_insert
    ON public.resource_metrics FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = user_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') IN ('admin', 'counselor')
    );

CREATE POLICY resource_metrics_update
    ON public.resource_metrics FOR UPDATE
    USING (
      (SELECT auth.uid()) = user_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') IN ('admin', 'counselor')
    )
    WITH CHECK (
      (SELECT auth.uid()) = user_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') IN ('admin', 'counselor')
    );

CREATE POLICY resource_metrics_delete
    ON public.resource_metrics FOR DELETE
    USING (
      COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- System health & admin activity log
------------------------------------------------------------------------------

DROP POLICY IF EXISTS system_health_admin_access ON public.system_health;
CREATE POLICY system_health_admin_access
    ON public.system_health FOR ALL
    USING (COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin');

DROP POLICY IF EXISTS admin_activity_log_admin_access ON public.admin_activity_log;
CREATE POLICY admin_activity_log_admin_access
    ON public.admin_activity_log FOR ALL
    USING (COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin')
    WITH CHECK (COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin');

------------------------------------------------------------------------------
-- Support tickets (consolidated to avoid duplicate permissive policies)
------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Patients can view own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Patients can create support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Patients can update own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can manage support tickets" ON public.support_tickets;

CREATE POLICY support_tickets_select_policy
    ON public.support_tickets FOR SELECT
    USING (
      (SELECT auth.uid()) = user_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY support_tickets_insert_policy
    ON public.support_tickets FOR INSERT
    WITH CHECK (
      (SELECT auth.uid()) = user_id
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY support_tickets_update_policy
    ON public.support_tickets FOR UPDATE
    USING (
      (
        (SELECT auth.uid()) = user_id
        AND status IN ('open', 'in_progress')
      )
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    )
    WITH CHECK (
      (
        (SELECT auth.uid()) = user_id
        AND status IN ('open', 'in_progress')
      )
      OR COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

CREATE POLICY support_tickets_delete_policy
    ON public.support_tickets FOR DELETE
    USING (
      COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
    );

------------------------------------------------------------------------------
-- Counselor documents function ownership (ensure stable)
------------------------------------------------------------------------------

ALTER FUNCTION public.is_participant(uuid, uuid) OWNER TO postgres;

COMMIT;

