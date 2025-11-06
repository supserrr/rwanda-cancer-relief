/**
 * Supabase Client for Client-Side Usage
 * 
 * Use this client for client-side components and browser interactions.
 * This client uses the anon key and respects RLS policies.
 * 
 * This module implements a singleton pattern to ensure only one
 * Supabase client instance is created per browser context, preventing
 * the "Multiple GoTrueClient instances detected" warning.
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw error in production or if explicitly required
// In development, we'll allow undefined values to prevent build errors
if (process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

/**
 * Singleton Supabase client instance
 * This ensures only one client is created per browser context
 */
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Create or get the singleton Supabase client for client-side usage
 * 
 * This function implements a singleton pattern to prevent multiple
 * GoTrueClient instances from being created in the same browser context.
 * 
 * @returns The singleton Supabase client instance
 */
export function createClient(): SupabaseClient {
  // Return existing instance if it exists
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Provide fallback values if not set (for development)
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || 'placeholder-key';
  
  // Create and cache the client instance
  supabaseClientInstance = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClientInstance;
}

