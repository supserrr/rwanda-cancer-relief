/**
 * Update Resources RLS Policies - Robust Version
 * 
 * Updates the resources table RLS policies to check both JWT claims and
 * the profiles table for admin role, ensuring compatibility with both methods.
 */

BEGIN;

-- Drop existing resources policies
DROP POLICY IF EXISTS "Resources select policy" ON resources;
DROP POLICY IF EXISTS "Resources update policy" ON resources;
DROP POLICY IF EXISTS "Resources delete policy" ON resources;

-- Consolidated SELECT policy for resources
CREATE POLICY "Resources select policy"
    ON resources FOR SELECT
    USING (
        -- Anyone can view public resources
        is_public = true
        OR
        -- Users can view their own resources (even if private)
        publisher = (SELECT auth.uid())
        OR
        -- Admins can view all resources (check JWT claim or profiles table)
        (
            COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
            )
        )
    );

-- Consolidated UPDATE policy for resources
CREATE POLICY "Resources update policy"
    ON resources FOR UPDATE
    USING (
        -- Users can update their own resources
        publisher = (SELECT auth.uid())
        OR
        -- Admins can update any resource (check JWT claim or profiles table)
        (
            COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
            )
        )
    )
    WITH CHECK (
        -- Users can update their own resources
        publisher = (SELECT auth.uid())
        OR
        -- Admins can update any resource (check JWT claim or profiles table)
        (
            COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
            )
        )
    );

-- Consolidated DELETE policy for resources
CREATE POLICY "Resources delete policy"
    ON resources FOR DELETE
    USING (
        -- Users can delete their own resources
        publisher = (SELECT auth.uid())
        OR
        -- Admins can delete any resource (check JWT claim or profiles table)
        (
            COALESCE((SELECT auth.jwt()) ->> 'role', '') = 'admin'
            OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
            )
        )
    );

COMMIT;
