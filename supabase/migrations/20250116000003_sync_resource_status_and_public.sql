-- Migration: Sync Resource Status and isPublic Fields
-- Description: Fixes inconsistencies between status and isPublic fields in existing resources
-- Created: 2025-01-16

-- Step 1: Set status to 'published' for resources that are public but don't have published status
-- This handles resources that were published before the status field was added
UPDATE resources
SET status = 'published'
WHERE is_public = true 
  AND (status IS NULL OR status NOT IN ('published', 'rejected'))
  AND reviewed = true;

-- Step 2: Set isPublic = true for resources that have published status but are not public
-- This ensures published resources are always public
UPDATE resources
SET is_public = true
WHERE status = 'published' 
  AND is_public = false;

-- Step 3: Set isPublic = false for resources that are rejected
-- Rejected resources should never be public
UPDATE resources
SET is_public = false
WHERE status = 'rejected' 
  AND is_public = true;

-- Step 4: Set status to 'pending_review' for resources that are not public and have no status
-- This handles resources that were created before the status field was added
UPDATE resources
SET status = 'pending_review'
WHERE status IS NULL 
  AND is_public = false;

-- Step 5: For resources that are public but not reviewed, set them to pending_review and make them private
-- This handles edge cases where resources might be public but not properly reviewed
UPDATE resources
SET status = 'pending_review',
    is_public = false
WHERE is_public = true 
  AND reviewed = false 
  AND (status IS NULL OR status = 'pending_review');

-- Step 6: Ensure reviewed resources that are not published have appropriate status
-- If reviewed but not published, status should be 'reviewed'
UPDATE resources
SET status = 'reviewed'
WHERE reviewed = true 
  AND status NOT IN ('published', 'rejected')
  AND is_public = false;

-- Add comment to document the migration
COMMENT ON COLUMN resources.status IS 'Resource status: pending_review (default), reviewed (admin reviewed), published (reviewed and published), rejected (rejected by admin). Synced with is_public on 2025-01-16.';

