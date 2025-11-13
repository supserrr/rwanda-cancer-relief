-- Migration: Add Resource Status
-- Description: Adds status field to resources to track review and publication workflow
-- Created: 2025-01-16

-- Add status field to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'reviewed', 'published', 'rejected'));

-- Update existing resources:
-- - If reviewed = true, set status = 'reviewed'
-- - If is_public = true and reviewed = true, set status = 'published'
-- - Otherwise, set status = 'pending_review'
UPDATE resources 
SET status = CASE
  WHEN is_public = true AND reviewed = true THEN 'published'
  WHEN reviewed = true THEN 'reviewed'
  ELSE 'pending_review'
END;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);

-- Add comment for documentation
COMMENT ON COLUMN resources.status IS 'Resource status: pending_review (default), reviewed (admin reviewed), published (reviewed and published), rejected (rejected by admin)';

