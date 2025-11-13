'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    // Handle Supabase password reset flow
    let subscription: { unsubscribe: () => void } | null = null;

    const handlePasswordReset = async () => {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase is not configured');
        setIsCheckingSession(false);
        return;
      }

      // Check for hash fragments in URL (Supabase password reset includes these)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      // Set up auth state listener to catch when Supabase processes the hash
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          // Supabase has processed the recovery token and created a session
          setIsValidSession(true);
          setIsCheckingSession(false);
          // Clear the hash from URL for cleaner UX
          window.history.replaceState(null, '', window.location.pathname);
        }
      });

      subscription = authSubscription;

      try {
        // If we have hash fragments, Supabase client will automatically process them
        // The onAuthStateChange listener above will catch when the session is created
        if (accessToken && type === 'recovery') {
          // Wait a bit for Supabase to process the hash fragments
          // The auth state change listener will handle the session creation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Double-check if we have a session (in case the listener didn't fire)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session && !sessionError) {
            setIsValidSession(true);
            setIsCheckingSession(false);
            window.history.replaceState(null, '', window.location.pathname);
          } else if (!isValidSession) {
            setError('Invalid or expired reset link. Please request a new password reset.');
            setIsCheckingSession(false);
          }
        } else {
          // No hash fragments, check if we already have a session
          // This handles the case where the user navigated directly or the hash was already processed
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session && !sessionError) {
            // For password reset, any valid session from a reset link should work
            // Supabase creates a temporary session for password reset
            setIsValidSession(true);
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
          setIsCheckingSession(false);
        }
      } catch (err) {
        console.error('Error checking password reset session:', err);
        setError('Failed to verify reset link. Please try again.');
        setIsCheckingSession(false);
      }
    };

    handlePasswordReset();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }

      // Update password using the current session
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success('Password reset successfully! Redirecting to sign in...');
      
      // Sign out to clear the temporary session
      await supabase.auth.signOut();
      
      // Redirect to sign in after a short delay
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCheckingSession ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Verifying reset link...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              {isValidSession ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {error || 'Please check your email for the password reset link.'}
              </p>
              <Button
                onClick={() => router.push('/signin')}
                variant="outline"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

