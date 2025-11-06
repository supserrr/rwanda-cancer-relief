/**
 * Configuration loader for the application
 * 
 * Loads and validates environment variables using @t3-oss/env-core
 * and provides typed configuration
 */

import dotenv from 'dotenv';
import { env } from '../env';

// Load environment variables
dotenv.config();

/**
 * Application configuration interface
 */
export interface Config {
  port: number;
  nodeEnv: string;
  supabase: {
    url: string;
    key: string;
    serviceKey: string;
  };
  jitsi: {
    appId?: string;
    appSecret?: string;
    domain: string;
  };
  frontend: {
    url: string;
    corsOrigin: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  resend?: {
    apiKey?: string;
  };
  smtp?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    from?: string;
  };
}

/**
 * Get application configuration
 * 
 * Uses validated environment variables from @t3-oss/env-core
 * which ensures all required variables are present and properly typed.
 */
export function getConfig(): Config {
  return {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    supabase: {
      url: env.SUPABASE_URL,
      key: env.SUPABASE_KEY,
      serviceKey: env.SUPABASE_SERVICE_KEY,
    },
    jitsi: {
      appId: env.JITSI_APP_ID,
      appSecret: env.JITSI_APP_SECRET,
      domain: env.JITSI_DOMAIN,
    },
    frontend: {
      url: env.FRONTEND_URL,
      corsOrigin: env.CORS_ORIGIN || env.FRONTEND_URL,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    resend: env.RESEND_API_KEY
      ? {
          apiKey: env.RESEND_API_KEY,
        }
      : undefined,
    smtp:
      env.SMTP_HOST || env.SMTP_USER
        ? {
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
            from: env.SMTP_FROM,
          }
        : undefined,
  };
}

export const config = getConfig();

