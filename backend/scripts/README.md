# Backend Scripts

Utility scripts for the Rwanda Cancer Relief backend.

## Available Scripts

### verify-supabase.ts

Verifies Supabase connection and database setup.

**Usage:**
```bash
npm run verify:supabase
```

**What it checks:**
- Environment variables are set
- Supabase connection works
- Database tables exist
- RLS policies are enabled
- Authentication is configured

**Output:**
- ✅ Green checkmarks for successful checks
- ❌ Red X marks for failures
- ⚠️ Yellow warnings for potential issues

**Troubleshooting:**
- If connection fails: Check your `.env` file
- If tables missing: Run migrations
- If RLS issues: Verify policies were applied


