-- Migration: Create support tickets infrastructure
-- Description: Creates support_tickets table for managing patient support requests
-- Created: 2025-11-10

BEGIN;

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical', 'scheduling', 'billing', 'account', 'feature', 'other')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
    description TEXT NOT NULL,
    admin_notes TEXT,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Patients can view their own tickets
CREATE POLICY "Patients can view own support tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Patients can create their own tickets
CREATE POLICY "Patients can create support tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Patients can update their tickets while open
CREATE POLICY "Patients can update own support tickets"
    ON support_tickets FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('open', 'in_progress'));

-- Admins can manage all tickets
CREATE POLICY "Admins can manage support tickets"
    ON support_tickets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

