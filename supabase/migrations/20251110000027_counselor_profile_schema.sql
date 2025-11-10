-- Migration: Counselor profile schema overhaul
-- Description: Adds counselor-specific structured data tables, visibility settings, and approval workflow columns.
-- Created: 2025-11-10

BEGIN;

-- Extend profiles with visibility and approval metadata
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS visibility_settings JSONB NOT NULL DEFAULT '{"publicLanding":true,"patientDirectory":true,"internal":true}'::JSONB,
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected','needs_more_info','suspended')),
    ADD COLUMN IF NOT EXISTS approval_submitted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approval_reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approval_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Counselor profile details
CREATE TABLE IF NOT EXISTS public.counselor_profiles (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    practice_name TEXT,
    practice_location TEXT,
    service_regions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    primary_timezone TEXT,
    supported_timezones TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    accepting_new_patients BOOLEAN NOT NULL DEFAULT TRUE,
    waitlist_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available','limited','waitlist','unavailable')),
    session_modalities TEXT[] NOT NULL DEFAULT ARRAY['chat','video','phone']::TEXT[],
    session_durations INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
    telehealth_offered BOOLEAN NOT NULL DEFAULT TRUE,
    in_person_offered BOOLEAN NOT NULL DEFAULT FALSE,
    languages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    specializations TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    demographics_served TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    approach_summary TEXT,
    bio TEXT,
    years_experience INTEGER,
    professional_highlights TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    education_history JSONB NOT NULL DEFAULT '[]'::JSONB,
    license_number TEXT,
    license_jurisdiction TEXT,
    license_expiry DATE,
    license_document_url TEXT,
    resume_url TEXT,
    certification_documents JSONB NOT NULL DEFAULT '[]'::JSONB,
    cpd_status TEXT,
    cpd_renewal_due_at DATE,
    professional_references JSONB NOT NULL DEFAULT '[]'::JSONB,
    motivation_statement TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplemental compliance documents
CREATE TABLE IF NOT EXISTS public.counselor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.counselor_profiles(profile_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('license','resume','certification','background_check','insurance','other')),
    storage_path TEXT NOT NULL,
    display_name TEXT,
    issued_at DATE,
    expires_at DATE,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected','expired')),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reuse updated_at trigger for counselor tables
CREATE TRIGGER update_counselor_profiles_updated_at
    BEFORE UPDATE ON public.counselor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counselor_documents_updated_at
    BEFORE UPDATE ON public.counselor_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable row level security
ALTER TABLE public.counselor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_documents ENABLE ROW LEVEL SECURITY;

-- Counselor profile policies
DROP POLICY IF EXISTS counselor_profiles_select_policy ON public.counselor_profiles;
CREATE POLICY counselor_profiles_select_policy
    ON public.counselor_profiles FOR SELECT
    USING (
        auth.uid() = profile_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = public.counselor_profiles.profile_id
              AND (
                  (
                      COALESCE(auth.jwt() ->> 'role', '') = 'patient'
                      AND (
                          COALESCE((p.visibility_settings ->> 'patientDirectory')::BOOLEAN, TRUE)
                          OR p.assigned_counselor_id = auth.uid()
                      )
                  )
                  OR (
                      auth.uid() IS NULL
                      AND COALESCE((p.visibility_settings ->> 'publicLanding')::BOOLEAN, TRUE)
                  )
                  OR (
                      COALESCE(auth.jwt() ->> 'role', '') IN ('counselor','staff')
                      AND COALESCE((p.visibility_settings ->> 'internal')::BOOLEAN, TRUE)
                  )
              )
        )
    );

DROP POLICY IF EXISTS counselor_profiles_update_policy ON public.counselor_profiles;
CREATE POLICY counselor_profiles_update_policy
    ON public.counselor_profiles FOR UPDATE
    USING (
        auth.uid() = profile_id OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    )
    WITH CHECK (
        auth.uid() = profile_id OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

-- Counselor document policies
DROP POLICY IF EXISTS counselor_documents_select_policy ON public.counselor_documents;
CREATE POLICY counselor_documents_select_policy
    ON public.counselor_documents FOR SELECT
    USING (
        auth.uid() = profile_id
        OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

DROP POLICY IF EXISTS counselor_documents_update_policy ON public.counselor_documents;
CREATE POLICY counselor_documents_update_policy
    ON public.counselor_documents FOR UPDATE
    USING (
        auth.uid() = profile_id OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    )
    WITH CHECK (
        auth.uid() = profile_id OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

DROP POLICY IF EXISTS counselor_documents_insert_policy ON public.counselor_documents;
CREATE POLICY counselor_documents_insert_policy
    ON public.counselor_documents FOR INSERT
    WITH CHECK (
        auth.uid() = profile_id OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

DROP POLICY IF EXISTS counselor_documents_delete_policy ON public.counselor_documents;
CREATE POLICY counselor_documents_delete_policy
    ON public.counselor_documents FOR DELETE
    USING (
        auth.uid() = profile_id OR COALESCE(auth.jwt() ->> 'role', '') = 'admin'
    );

COMMIT;
