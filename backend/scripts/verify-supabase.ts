/**
 * Supabase Connection Verification Script
 * 
 * Verifies Supabase connection and database setup
 * Run with: npx tsx scripts/verify-supabase.ts
 */

import dotenv from 'dotenv';
import { getSupabaseClient, getSupabaseServiceClient, testSupabaseConnection } from '../src/config/supabase';

// Load environment variables
dotenv.config({ path: '.env' });

/**
 * Verify Supabase connection and setup
 */
async function verifySupabase() {
  console.log('\n🔍 Verifying Supabase Setup...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables...');
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY', 'SUPABASE_SERVICE_KEY'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.error('   Please check your .env file');
    process.exit(1);
  }
  console.log('✅ All required environment variables are set\n');

  // Test connection
  console.log('🔌 Testing Supabase Connection...');
  try {
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to Supabase');
      process.exit(1);
    }
    console.log('✅ Successfully connected to Supabase\n');
  } catch (error) {
    console.error('❌ Connection error:', error);
    process.exit(1);
  }

  // Check tables
  console.log('📊 Checking Database Tables...');
  try {
    const supabase = getSupabaseServiceClient();
    const { data: tables, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `,
    });

    // Alternative: Use direct query if RPC not available
    const requiredTables = ['profiles', 'sessions', 'resources', 'chats', 'messages', 'notifications'];
    
    console.log('   Checking for required tables:');
    for (const tableName of requiredTables) {
      const { data, error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
      
      if (tableError && tableError.code === 'PGRST116') {
        console.log(`   ❌ Table '${tableName}' does not exist`);
      } else if (tableError) {
        console.log(`   ⚠️  Table '${tableName}' exists but may have issues: ${tableError.message}`);
      } else {
        console.log(`   ✅ Table '${tableName}' exists`);
      }
    }
    console.log();
  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }

  // Check RLS policies
  console.log('🔒 Checking Row Level Security (RLS)...');
  try {
    const supabase = getSupabaseServiceClient();
    const requiredTables = ['profiles', 'sessions', 'resources', 'chats', 'messages', 'notifications'];
    
    for (const tableName of requiredTables) {
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          SELECT rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = '${tableName}';
        `,
      });

      // Direct test: Try to query as anon user
      const anonClient = getSupabaseClient();
      const { error: anonError } = await anonClient
        .from(tableName)
        .select('id')
        .limit(1);

      if (anonError && anonError.code === 'PGRST301') {
        console.log(`   ✅ RLS is enabled for '${tableName}'`);
      } else if (anonError) {
        console.log(`   ⚠️  RLS check for '${tableName}': ${anonError.message}`);
      } else {
        console.log(`   ⚠️  RLS may not be properly configured for '${tableName}'`);
      }
    }
    console.log();
  } catch (error) {
    console.error('❌ Error checking RLS:', error);
  }

  // Test authentication
  console.log('🔐 Testing Authentication...');
  try {
    const supabase = getSupabaseClient();
    
    // Test: Try to get current user (should fail without token, but connection should work)
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message.includes('JWT')) {
      console.log('   ✅ Auth connection working (JWT required as expected)');
    } else if (error) {
      console.log(`   ⚠️  Auth connection issue: ${error.message}`);
    } else {
      console.log('   ✅ Auth connection working');
    }
    console.log();
  } catch (error) {
    console.error('❌ Auth test error:', error);
  }

  console.log('✅ Supabase verification complete!\n');
  console.log('Next steps:');
  console.log('  1. Test signup endpoint: POST /api/auth/signup');
  console.log('  2. Test health endpoint: GET /health');
  console.log('  3. Start development server: npm run dev\n');
}

// Run verification
verifySupabase().catch((error) => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

