# Counselor Profile Data Model Redesign

## Overview
- Replace ad-hoc counselor metadata with structured columns and tables that support regulatory compliance, service availability, and multi-surface visibility.
- Ensure downstream consumers (onboarding, settings, admin approvals, public listings, realtime sync) rely on typed fields instead of arbitrary JSON.
- Introduce explicit approval gating and multi-channel visibility preferences so dashboard access matches operational policy.

## Schema Additions & Changes

### profiles (existing)
- `visibility_settings JSONB NOT NULL DEFAULT '{"publicLanding":true,"patientDirectory":true,"internal":true}'`
  - Keys represent discoverability surfaces; values are booleans.
  - Expected keys: `publicLanding`, `patientDirectory`, `internal`.
  - Future-proof by allowing additional keys (e.g., `marketingSpotlight`).
- `approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected','needs_more_info','suspended'))`
  - Controls dashboard access for counselors.
- `approval_submitted_at TIMESTAMPTZ NULL`
  - Populated when onboarding is completed; used for admin SLAs.
- `approval_reviewed_at TIMESTAMPTZ NULL`
  - Timestamp when status leaves `pending`.
- `approval_reviewed_by UUID NULL REFERENCES auth.users(id)`
  - Tracks the reviewing admin.
- `approval_notes TEXT`
  - Freeform admin notes visible internally.

### counselor_profiles (new)
Stores counselor-specific structured data. One-to-one with `profiles` (`role = 'counselor'`).

| Column | Type | Notes |
| --- | --- | --- |
| `profile_id` | UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE | Matches Supabase auth user ID |
| `practice_name` | TEXT | Optional clinic or organization name |
| `practice_location` | TEXT | Freeform location summary |
| `service_regions` | TEXT[] | Regions served (e.g., provinces, countries) |
| `primary_timezone` | TEXT | IANA identifier (e.g., `Africa/Kigali`) |
| `supported_timezones` | TEXT[] | Additional IANA zones counselor can cover |
| `accepting_new_patients` | BOOLEAN NOT NULL DEFAULT TRUE | Controls booking eligibility |
| `waitlist_enabled` | BOOLEAN NOT NULL DEFAULT FALSE | Allows capturing interest when fully booked |
| `availability_status` | TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available','limited','waitlist','unavailable')) | High-level status used in filters |
| `session_modalities` | TEXT[] NOT NULL DEFAULT ARRAY['chat','video','phone']::TEXT[] | Allowed consultation formats; include `in_person` when relevant |
| `session_durations` | INTEGER[] NULL | Typical durations in minutes |
| `telehealth_offered` | BOOLEAN NOT NULL DEFAULT TRUE | Quick flag for virtual care |
| `in_person_offered` | BOOLEAN NOT NULL DEFAULT FALSE | Pair with location details |
| `languages` | TEXT[] | Overrides `profiles.languages` as the source of truth |
| `specializations` | TEXT[] | Focus areas / treatment modalities |
| `demographics_served` | TEXT[] | Populations counselor is trained to support |
| `approach_summary` | TEXT | Short blurb about therapeutic approach |
| `bio` | TEXT | Long-form bio; supersedes `profiles.bio` |
| `years_experience` | INTEGER | Numeric years in practice |
| `professional_highlights` | TEXT[] | Key accomplishments, awards |
| `education_history` | JSONB | Structured entries `{ degree, institution, graduation_year }` |
| `license_number` | TEXT | Primary license identifier |
| `license_jurisdiction` | TEXT | Authority / region that issued the license |
| `license_expiry` | DATE | Used for compliance reminders |
| `license_document_url` | TEXT | Supabase storage path |
| `resume_url` | TEXT | CV storage reference |
| `certification_documents` | JSONB | Array of `{ name, url, issued_at, expires_at }` |
| `cpd_status` | TEXT | e.g., `current`, `due_soon`, `lapsed` |
| `cpd_renewal_due_at` | DATE | Drives reminder logic |
| `references` | JSONB | Array of `{ name, organization, email, phone }` |
| `motivation_statement` | TEXT | Counselor’s motivation submitted during onboarding |
| `emergency_contact_name` | TEXT | Optional internal record |
| `emergency_contact_phone` | TEXT | Works with profile auditing |
| `metadata` | JSONB NOT NULL DEFAULT '{}'::JSONB | Future-proof container for non-critical fields |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |

Triggers:
- Reuse `update_updated_at_column()` to keep `updated_at` fresh.

### counselor_documents (new)
Tracks additional compliance artifacts beyond the primary license/resume.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID PRIMARY KEY DEFAULT uuid_generate_v4() | |
| `profile_id` | UUID NOT NULL REFERENCES counselor_profiles(profile_id) ON DELETE CASCADE | |
| `document_type` | TEXT NOT NULL CHECK (document_type IN ('license','resume','certification','background_check','insurance','other')) | |
| `storage_path` | TEXT NOT NULL | Supabase storage object path |
| `display_name` | TEXT | Friendly label |
| `issued_at` | DATE | Optional |
| `expires_at` | DATE | Optional, used for reminders |
| `status` | TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','approved','rejected','expired')) | |
| `reviewed_at` | TIMESTAMPTZ NULL | |
| `reviewed_by` | UUID NULL REFERENCES auth.users(id) | |
| `notes` | TEXT | Admin notes |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | |

### approval workflow helper view (planned)
- Create a view `pending_counselor_approvals` combining profile core info, counselor profile details, and document statuses to power the admin approvals dashboard.

## Data Migration Strategy
1. **Backfill** existing counselor metadata into structured columns:
   - Parse `metadata` keys (e.g., `licenseNumber`, `availability`, `consultationTypes`) and populate new fields.
   - Derive `session_modalities` from `consultationTypes`; ensure defaults include `chat`, `video`, `phone`.
   - Move `bios` and `credentials` into `counselor_profiles.bio` and `professional_highlights`.
2. **Visibility defaults**: populate `visibility_settings` with all surfaces enabled for current counselors.
3. **Approval status**: existing counselors default to `approved`; onboarding flow sets `pending` for new submissions.
4. **Documents**: create `counselor_documents` entries for existing resume/license uploads when storage paths are available.

## Access Control & RLS
- `counselor_profiles` and `counselor_documents` inherit `profiles` RLS via `profile_id`.
- New policies:
  - Counselors can `SELECT/UPDATE` their own records.
  - Admins can `SELECT/UPDATE` all counselor data.
  - Patients can `SELECT` subset of counselor fields when `visibility_settings` allows the relevant surface or the patient is assigned to the counselor.

## Approval Flow Logic
- On onboarding completion: set `profiles.approval_status = 'pending'`, `approval_submitted_at = NOW()`, emit notification for admins.
- Dashboard guard: block counselors whose status is not `approved`, show waiting splash with realtime subscription to approval status.
- When admin updates status to `approved`:
  - Set `approval_reviewed_at` + `approval_reviewed_by`.
  - Trigger Supabase function to send email notification.
  - Realtime change propagates to counselor session, unlocking dashboard access immediately.

## Enumerations & Shared Constants
Define shared enums in TypeScript and the database to keep UI, API, and storage aligned:
- `CounselorApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs_more_info' | 'suspended'`
- `CounselorAvailabilityStatus = 'available' | 'limited' | 'waitlist' | 'unavailable'`
- `CounselorDocumentType = 'license' | 'resume' | 'certification' | 'background_check' | 'insurance' | 'other'`
- Visibility surface keys: `'publicLanding' | 'patientDirectory' | 'internal' | 'marketingSpotlight' (future)`
- Session modalities: `'chat' | 'video' | 'phone' | 'in_person'`

## Implementation Notes
- Update Supabase migrations to add new columns and tables with triggers and RLS policies.
- Update Auth/Admin APIs to map legacy metadata to the new structure.
- Provide helper utilities to read visibility defaults and compute discoverability.
- Ensure all date/time columns use timezone-aware types (`TIMESTAMPTZ`) except `DATE` for pure date fields.
