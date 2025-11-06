/**
 * Environment variable validation schema
 * 
 * Uses @t3-oss/env-core to validate and type-check environment variables
 * at build time and runtime.
 */

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/**
 * Validated environment variables
 * 
 * This object contains all validated environment variables with proper
 * types and validation. Access this instead of process.env directly.
 */
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().regex(/^\d+$/).transform(Number).default("10000"),
    
    // Supabase Configuration
    SUPABASE_URL: z.string().url(),
    SUPABASE_KEY: z.string().min(1),
    SUPABASE_SERVICE_KEY: z.string().min(1),
    
    // Jitsi Meet Configuration
    JITSI_APP_ID: z.string().min(1).optional(),
    JITSI_APP_SECRET: z.string().min(1).optional(),
    JITSI_DOMAIN: z.string().default("8x8.vc"),
    
    // Frontend Configuration
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
    CORS_ORIGIN: z.string().url().optional(),
    
    // JWT Configuration
    JWT_SECRET: z.string().min(1).default("your-secret-key-change-in-production"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    
    // Email/Notifications (Optional)
    RESEND_API_KEY: z.string().min(1).optional(),
    
    // SMTP Configuration (Optional - alternative to Resend)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
    
    // Render Configuration (Automatically set by Render)
    RENDER_EXTERNAL_URL: z.string().url().optional(),
    RENDER_SERVICE_NAME: z.string().optional(),
    RENDER_GIT_BRANCH: z.string().optional(),
    RENDER_GIT_COMMIT: z.string().optional(),
    
    // Supabase OAuth (Optional)
    SUPABASE_CLIENT_ID: z.string().optional(),
    SUPABASE_CLIENT_SECRET: z.string().optional(),
  },
  
  /**
   * Runtime environment variables
   * 
   * This is where we specify which environment variables to use.
   * Using runtimeEnvStrict ensures we explicitly access all variables.
   */
  runtimeEnvStrict: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    JITSI_APP_ID: process.env.JITSI_APP_ID,
    JITSI_APP_SECRET: process.env.JITSI_APP_SECRET,
    JITSI_DOMAIN: process.env.JITSI_DOMAIN,
    FRONTEND_URL: process.env.FRONTEND_URL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
    RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
    RENDER_SERVICE_NAME: process.env.RENDER_SERVICE_NAME,
    RENDER_GIT_BRANCH: process.env.RENDER_GIT_BRANCH,
    RENDER_GIT_COMMIT: process.env.RENDER_GIT_COMMIT,
    SUPABASE_CLIENT_ID: process.env.SUPABASE_CLIENT_ID,
    SUPABASE_CLIENT_SECRET: process.env.SUPABASE_CLIENT_SECRET,
  },
  
  /**
   * Treat empty strings as undefined
   * 
   * This ensures that empty string values in .env files are treated
   * as undefined, allowing default values to be applied correctly.
   */
  emptyStringAsUndefined: true,
});

