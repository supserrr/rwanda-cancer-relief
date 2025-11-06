/**
 * Environment variable validation schema
 * 
 * Uses @t3-oss/env-nextjs to validate and type-check environment variables
 * at build time and runtime.
 * 
 * Next.js uses NEXT_PUBLIC_ prefix for client-side environment variables.
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Validated environment variables
 * 
 * This object contains all validated environment variables with proper
 * types and validation. Access this instead of process.env directly.
 */
export const env = createEnv({
  /**
   * Server-side environment variables
   * 
   * These are only available on the server and will not be exposed to the client.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  
  /**
   * Client-side environment variables
   * 
   * Next.js requires the NEXT_PUBLIC_ prefix for client-side variables.
   * This is enforced both at type-level and at runtime.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },
  
  /**
   * Runtime environment variables
   * 
   * For Next.js >= 13.4.4, we can use experimental__runtimeEnv for server variables
   * which automatically handles all server-side variables.
   * 
   * Client variables must be explicitly destructured in runtimeEnv to ensure
   * they are included in the bundle.
   */
  experimental__runtimeEnv: process.env,
  
  runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  /**
   * Treat empty strings as undefined
   * 
   * This ensures that empty string values in .env files are treated
   * as undefined, allowing default values to be applied correctly.
   */
  emptyStringAsUndefined: true,
});

