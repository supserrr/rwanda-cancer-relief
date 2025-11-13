-- Add 'in-person' session type to the sessions table
-- This migration updates the CHECK constraint on the type column to include 'in-person'

ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_type_check;

ALTER TABLE sessions 
  ADD CONSTRAINT sessions_type_check 
  CHECK (type IN ('video', 'audio', 'chat', 'in-person'));

