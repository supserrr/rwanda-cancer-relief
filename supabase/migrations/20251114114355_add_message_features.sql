-- Migration: Add message features (reactions, replies, edits, soft delete)
-- Description: Adds support for message reactions, replies, editing, and soft deletion
-- Created: 2025-11-14

-- Add reactions column (JSONB to store {emoji: userId[]})
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::JSONB;

-- Add reply_to_id column (references messages.id for reply functionality)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Add edited_at column (timestamp when message was edited, null if not edited)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE;

-- Add deleted_at column (timestamp when message was soft deleted, null if not deleted)
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_reply_to_id ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_edited_at ON messages(edited_at) WHERE edited_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at) WHERE deleted_at IS NOT NULL;

-- Create GIN index for reactions JSONB column for efficient querying
CREATE INDEX IF NOT EXISTS idx_messages_reactions ON messages USING GIN(reactions) WHERE reactions != '{}'::JSONB;

-- Add comment to document the reactions structure
COMMENT ON COLUMN messages.reactions IS 'JSONB object storing reactions as {emoji: [userId1, userId2, ...]}';

