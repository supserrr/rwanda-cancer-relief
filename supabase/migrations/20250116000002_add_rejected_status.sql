-- Migration: Add Rejected Status to Resources
-- Description: Updates the status constraint to include 'rejected' status
-- Created: 2025-01-16

-- Drop the existing constraint
ALTER TABLE resources
DROP CONSTRAINT IF EXISTS chk_resource_status;

-- Add the new constraint with 'rejected' status
ALTER TABLE resources
ADD CONSTRAINT chk_resource_status CHECK (status IN ('pending_review', 'reviewed', 'published', 'rejected'));

-- Update the comment
COMMENT ON COLUMN resources.status IS 'Resource status: pending_review (default), reviewed (admin reviewed), published (reviewed and published), rejected (rejected by admin)';

