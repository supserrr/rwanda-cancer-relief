-- Migration: Add Review Status to Resources
-- Description: Adds reviewed status tracking for admin resource review process
-- Created: 2025-01-16

-- Add reviewed status fields to resources table
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS reviewed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster filtering by review status
CREATE INDEX IF NOT EXISTS idx_resources_reviewed ON resources(reviewed) WHERE reviewed = false;

-- Add comment for documentation
COMMENT ON COLUMN resources.reviewed IS 'Whether the resource has been reviewed by an admin';
COMMENT ON COLUMN resources.reviewed_at IS 'Timestamp when the resource was reviewed';
COMMENT ON COLUMN resources.reviewed_by IS 'Admin user ID who reviewed the resource';

