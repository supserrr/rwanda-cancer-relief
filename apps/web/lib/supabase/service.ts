import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE ??
  null;

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_DEV_URL ??
  null;

let cachedClient: SupabaseClient | null = null;
let missingServiceWarningLogged = false;

/**
 * Create or return a cached Supabase service-role client.
 *
 * This MUST only be used on the server. The service role key grants
 * full access to the project and should never be exposed to browsers.
 */
export function getServiceClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    if (!missingServiceWarningLogged) {
      console.warn(
      '[supabase/service] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Account administration features will be unavailable.',
    );
      missingServiceWarningLogged = true;
    }
    return null;
  }

  cachedClient = createSupabaseClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

