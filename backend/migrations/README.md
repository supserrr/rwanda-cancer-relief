# Database Migrations

This directory contains SQL migration files for the Rwanda Cancer Relief backend database.

## Migration Files

### 001_initial_schema.sql
Creates all base tables and indexes:
- `profiles` - User profile extensions (extends Supabase Auth users)
- `sessions` - Counseling sessions
- `resources` - Educational resources (audio, PDF, video, article)
- `chats` - Chat conversations
- `messages` - Chat messages
- `notifications` - User notifications

Also creates:
- UUID extension
- Indexes for performance optimization
- Triggers for automatic `updated_at` timestamp updates

### 002_rls_policies.sql
Sets up Row Level Security (RLS) policies for all tables:
- Enables RLS on all tables
- Creates policies for SELECT, INSERT, UPDATE, DELETE operations
- Implements role-based access control:
  - Users can only access their own data
  - Admins have elevated access
  - Counselors can view assigned patients
  - Patients can view their assigned counselors
  - Public resources are accessible to all authenticated users

### 003_seed_data.sql
Contains reference data structure and utility functions:
- Automatic profile creation trigger (creates profile when user signs up)
- Example reference data structure structure (commented out - modify with actual user IDs)
- **Note**: Only run reference data structure in development/development environments

## Running Migrations

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute each migration sequentially

### Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migrations in order
\i migrations/001_initial_schema.sql
\i migrations/002_rls_policies.sql
\i migrations/003_seed_data.sql
```

### Manual Execution

1. Copy the contents of `001_initial_schema.sql`
2. Paste into Supabase SQL Editor
3. Execute
4. Repeat for `002_rls_policies.sql`
5. Repeat for `003_seed_data.sql`

## Migration Order

**Important**: Migrations must be run in this exact order:

1. `001_initial_schema.sql` - Creates tables and indexes
2. `002_rls_policies.sql` - Sets up security policies
3. `003_seed_data.sql` - Adds triggers and optional reference data structure

## Verification

After running migrations, verify the setup:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check if policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## Rollback

If you need to rollback migrations:

```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
-- ... (repeat for all policies)

-- Drop all tables (DANGER: This deletes all data)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

## Notes

- All tables use UUIDs as primary keys
- Timestamps use `TIMESTAMP WITH TIME ZONE` for timezone awareness
- `updated_at` fields are automatically updated via triggers
- RLS policies ensure data security at the database level
- The profile creation trigger automatically creates a profile when a user signs up via Supabase Auth

## Troubleshooting

### Error: "relation already exists"
- Tables may already exist. Check with `\dt` in psql or in Supabase Dashboard
- Drop tables if starting fresh (see Rollback section)

### Error: "permission denied"
- Ensure you're using the service role key for admin operations
- Check RLS policies are correctly configured

### Error: "foreign key constraint"
- Ensure auth.users records exist before creating profiles
- Check that referenced UUIDs exist in the referenced tables

