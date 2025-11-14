# Supabase Query Error Troubleshooting Guide

## Problem

Console error appearing in session detail page:
```
[SessionRoom] Direct query error: {}
[SessionRoom] Error details: {}
```

This indicates a Supabase query is failing, but the error object is not providing diagnostic information.

## Root Causes

### 1. RLS (Row Level Security) Policy Denial
**Most Common**: Supabase RLS policies are preventing the query from accessing patient profiles.

**Symptoms**:
- Error details show empty/minimal information
- Query returns no data but doesn't throw a clear error
- Fallback queries also fail

**Solution**:
Check your RLS policies on the `profiles` table:
```sql
-- Check current RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';

-- Example: Should allow counselors to see patient profiles
-- they have sessions with
```

### 2. Authentication Issues
**Possible**: User is not authenticated or session token expired.

**Symptoms**:
- Error appears intermittently
- Happens especially after long idle times
- Other authenticated queries also fail

**Solution**:
```typescript
// Verify user is authenticated
const { data: { user }, error } = await supabase.auth.getUser();
if (!user) {
  console.error('User not authenticated');
}
```

### 3. Missing or Renamed Columns
**Possible**: The database schema doesn't have all the columns we're selecting.

**Symptoms**:
- Error when selecting specific columns
- Works with `select('*')`
- Related to specific column names

**Solution**:
```sql
-- Verify column exists in profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('id', 'full_name', 'email', 'role', 'avatar_url', 'metadata', 'created_at', 'updated_at');
```

### 4. Supabase Service Outage
**Unlikely but possible**: Supabase service is experiencing issues.

**Solution**:
- Check [Supabase Status Page](https://status.supabase.com)
- Try querying other tables
- Check Supabase project logs

### 5. Invalid Query Syntax
**Possible**: The query itself has syntax errors.

**Symptoms**:
- Specific columns always fail
- Works when removing certain filters
- Error message indicates syntax issues

**Solution**:
Verify the query syntax is correct for your Supabase version.

## Diagnostic Steps

### Step 1: Check Browser Console
Open Developer Tools (F12) and look for these log patterns:

**Good Pattern**:
```
[SessionRoom] ✅ Found profile via direct query with role filter
```

**Bad Pattern**:
```
[SessionRoom] Direct query error: {}
[SessionRoom] Error details: {}
```

### Step 2: Enable Verbose Logging
The improved error handling provides more details:

```
[SessionRoom] Error details: {
  message: "...",
  code: "...",
  status: "...",
  fullError: "{...}"
}
```

**Useful fields to check**:
- `message`: The actual error message
- `code`: Supabase error code (e.g., "PGRST301" for policy violation)
- `status`: HTTP status code (403 = permission denied, 404 = not found)
- `fullError`: Complete error object as JSON

### Step 3: Check Supabase Project Logs

1. Go to Supabase Dashboard
2. Select your project
3. Go to "Logs" section
4. Filter by time and look for failed queries

### Step 4: Verify RLS Policies

Access Supabase SQL Editor and run:

```sql
-- Check RLS enabled
SELECT * FROM pg_tables 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Check policies
SELECT * FROM pg_policies 
WHERE tablename = 'profiles';

-- Test query directly
SELECT id, full_name, email, role, avatar_url 
FROM profiles 
WHERE role = 'patient' 
LIMIT 1;
```

### Step 5: Test with Supabase Client Directly

In browser console, test the query:

```javascript
const { data, error } = await supabase
  .from('profiles')
  .select('id,full_name,email,role,avatar_url,metadata,created_at,updated_at')
  .eq('role', 'patient')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| PGRST301 | RLS policy violation | Check RLS policies |
| 403 | Forbidden | Verify user permissions |
| 404 | Not found | Verify table/column names |
| 500 | Server error | Check Supabase status |
| FETCH_ERROR | Network error | Check internet connection |

## Solution Strategies

### Strategy 1: Fix RLS Policy

**Current Issue**: Counselor can't see patient profiles

**Solution**: Update RLS policy in Supabase SQL Editor:

```sql
-- Drop existing policy if needed
DROP POLICY IF EXISTS "Counselors can view patients with sessions" ON profiles;

-- Create new policy allowing counselors to see patients they have sessions with
CREATE POLICY "Counselors can view patients with sessions" ON profiles
  FOR SELECT
  USING (
    -- Allow if user is the profile owner
    auth.uid() = id
    OR
    -- Allow if user is a counselor viewing a patient they have a session with
    (
      role = 'patient' AND
      (SELECT count(*) FROM sessions 
       WHERE sessions.counselor_id = auth.uid() 
       AND sessions.patient_id = profiles.id) > 0
    )
    OR
    -- Allow if user is a patient viewing their counselor
    (
      role = 'counselor' AND
      (SELECT count(*) FROM sessions 
       WHERE sessions.patient_id = auth.uid() 
       AND sessions.counselor_id = profiles.id) > 0
    )
  );
```

### Strategy 2: Use Fallback Query

If role-filtered query fails, system automatically tries without role filter:

```typescript
// This happens automatically in the code:
// 1. Try with role filter
// 2. If fails, try without role filter
// 3. If still fails, use fallback participant
```

### Strategy 3: Enable Service Role Bypass

For admin operations (use carefully!):

```typescript
// In a server-side API route only - NEVER in client
const { data, error } = await supabaseServiceClient
  .from('profiles')
  .select('id,full_name,email,role,avatar_url,metadata,created_at,updated_at')
  .in('id', [participantId]);
```

### Strategy 4: Add User to RLS Exception

If counselor should see all patient profiles:

```sql
-- Grant exception (use cautiously)
GRANT ALL ON profiles TO authenticated;
```

## Prevention Tips

1. **Always test queries** in Supabase SQL Editor first
2. **Verify RLS policies** allow the intended access
3. **Use explicit column selection** instead of `select('*')`
4. **Add proper error handling** with fallbacks
5. **Log error details** for debugging
6. **Monitor Supabase logs** regularly

## Quick Fixes Checklist

- [ ] Check browser console for actual error message
- [ ] Verify user is authenticated
- [ ] Check Supabase project logs
- [ ] Test query in Supabase SQL Editor
- [ ] Verify RLS policies exist and are correct
- [ ] Confirm table and column names are correct
- [ ] Try with `select('*')` to isolate column issues
- [ ] Check Supabase status page
- [ ] Restart dev server
- [ ] Clear browser cache

## Related Configuration

### Environment Variables
Verify these are set correctly:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Client Configuration
Check `/lib/supabase/client.ts` is properly configured.

## Getting Help

If the error persists:

1. Check the Supabase logs at: `Supabase Dashboard → Logs`
2. Look for patterns in: `[SessionRoom]` console logs
3. Verify RLS policies match your access requirements
4. Test queries directly in Supabase SQL Editor
5. Check [Supabase Discord Community](https://discord.supabase.com)

## Recent Improvements (Commit fd61a6d)

The latest commit improved error diagnostics:

- Enhanced error logging with optional chaining (`?.`)
- Added `fullError` field with complete error JSON
- Added `status` field for HTTP status codes
- Better null checking in fallback queries

These improvements help identify the actual cause of the error.

---

**Last Updated**: November 14, 2025
**Relevant Code**: `/apps/web/app/dashboard/counselor/sessions/session/[sessionId]/page.tsx` lines 154-190

