-- Add reading_time column to resources table for article type resources
ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS reading_time TEXT;

-- Add comment to document the field
COMMENT ON COLUMN resources.reading_time IS 'Estimated reading time for article resources (e.g., "5 min", "10 minutes")';

