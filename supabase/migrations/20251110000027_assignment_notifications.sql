-- Migration: Patient assignment notification trigger
-- Created: 2025-11-10

BEGIN;

CREATE OR REPLACE FUNCTION public.enqueue_patient_assignment_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    patient_name TEXT;
    counselor_name TEXT;
BEGIN
    IF NEW.assigned_counselor_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.assigned_counselor_id = COALESCE(OLD.assigned_counselor_id, '00000000-0000-0000-0000-000000000000') THEN
        RETURN NEW;
    END IF;

    SELECT full_name INTO patient_name FROM profiles WHERE id = NEW.id;
    SELECT full_name INTO counselor_name FROM profiles WHERE id = NEW.assigned_counselor_id;

    INSERT INTO notifications (user_id, title, message, type_key, metadata, delivery_status, priority, channels)
    VALUES (
        NEW.assigned_counselor_id,
        'New patient assignment',
        COALESCE('You have been assigned a new patient: ' || COALESCE(patient_name, 'Patient') || '.', 'You have been assigned a new patient.'),
        'patient_assignment',
        jsonb_build_object(
            'patientId', NEW.id,
            'patientName', COALESCE(patient_name, 'Patient'),
            'trigger', 'assignment_trigger'
        ),
        'pending',
        'high',
        ARRAY['in_app']::TEXT[]
    );

    INSERT INTO notifications (user_id, title, message, type_key, metadata, delivery_status, priority, channels)
    VALUES (
        NEW.id,
        'Your counselor has been assigned',
        COALESCE('You have been paired with counselor ' || COALESCE(counselor_name, 'your counselor') || '.', 'A counselor has been assigned to you.'),
        'patient_assignment',
        jsonb_build_object(
            'counselorId', NEW.assigned_counselor_id,
            'counselorName', COALESCE(counselor_name, 'Counselor'),
            'trigger', 'assignment_trigger'
        ),
        'pending',
        'normal',
        ARRAY['in_app']::TEXT[]
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_patient_assignment_notifications ON profiles;

CREATE TRIGGER trigger_patient_assignment_notifications
    AFTER UPDATE OF assigned_counselor_id ON profiles
    FOR EACH ROW
    WHEN (NEW.assigned_counselor_id IS DISTINCT FROM OLD.assigned_counselor_id AND NEW.assigned_counselor_id IS NOT NULL)
    EXECUTE FUNCTION public.enqueue_patient_assignment_notifications();

COMMIT;

