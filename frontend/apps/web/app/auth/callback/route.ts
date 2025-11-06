/**
 * OAuth Callback Route Handler
 * 
 * Handles OAuth callbacks from providers (e.g., Google) and exchanges
 * the authorization code for a session.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback handler
 * 
 * Processes OAuth callbacks from providers and exchanges authorization codes
 * for user sessions. Handles errors gracefully and provides feedback to users.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Check if OAuth provider returned an error
  if (error) {
    console.error('OAuth provider error:', {
      error,
      errorDescription,
      url: request.url,
    });
    
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
    );
  }

  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase not configured:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('OAuth is not configured. Please contact support.')}`
    );
  }

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/';

  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/';
  }

  // Check if authorization code is present
  if (!code) {
    console.error('Missing authorization code in callback:', {
      url: request.url,
      searchParams: Object.fromEntries(searchParams.entries()),
    });
    
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent('Missing authorization code. Please try signing in again.')}`
    );
  }

  try {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Failed to exchange code for session:', {
        error: exchangeError.message,
        status: exchangeError.status,
        code: code.substring(0, 10) + '...', // Log partial code for debugging
      });
      
      const errorMessage = exchangeError.message || 'Failed to complete authentication. Please try again.';
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
      );
    }

    if (!data.session) {
      console.error('No session returned from code exchange:', {
        hasData: !!data,
        hasSession: !!data?.session,
      });
      
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent('Authentication session not created. Please try again.')}`
      );
    }

    // Successfully authenticated, redirect to the intended destination
    const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
      // In development, use the origin directly
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
      // In production with load balancer, use the forwarded host
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
      // Fallback to origin
        return NextResponse.redirect(`${origin}${next}`);
      }
  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in OAuth callback:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred during authentication.';
    
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(errorMessage)}`
    );
  }
}

