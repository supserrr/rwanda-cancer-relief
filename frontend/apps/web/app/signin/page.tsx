'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPage, Testimonial } from "@workspace/ui/components/ui/sign-in";
import { AuthService } from '@/lib/auth';
import { validateSignInForm } from '@/lib/validations';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Rwanda Cancer Relief has been a lifeline for my family. The support and care we received during my mother's treatment was exceptional."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "The counseling services provided by RCR helped me navigate through the most difficult time of my life. I'm forever grateful."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "This organization truly understands what families go through. Their comprehensive support made all the difference in our journey."
  },
];

/**
 * Sign In page component for Rwanda Cancer Relief
 */
export default function SignInPageDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        rememberMe: formData.get('rememberMe') === 'on'
      };

      // Validate form data
      const validation = validateSignInForm(data);
      if (!validation.isValid) {
        setError(Object.values(validation.errors)[0] || 'Please check your input');
        return;
      }

      // Authenticate user
      const result = await AuthService.signIn(data);
      
      // Store auth data in localStorage (in a real app, this would be handled by the auth context)
      localStorage.setItem('auth-token', result.token);
      localStorage.setItem('user-data', JSON.stringify(result.user));
      localStorage.setItem('user-role', result.user.role);

      // Redirect to appropriate onboarding
      const onboardingRoute = result.user.role === 'counselor' 
        ? '/onboarding/counselor' 
        : '/onboarding/patient';
      
      router.push(onboardingRoute);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // For now, just show a message - Google OAuth would be implemented here
    alert("Google Sign-In will be implemented with OAuth integration");
  };
  
  const handleResetPassword = () => {
    // For now, just show a message - password reset would be implemented here
    alert("Password reset functionality will be implemented");
  }

  const handleCreateAccount = () => {
    router.push('/signup/patient');
  }

  return (
    <div className="bg-background text-foreground">
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      <SignInPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            Welcome Back to <span className="font-semibold text-primary">Rwanda Cancer Relief</span>
          </span>
        }
        description="Access your account and continue your healing journey with us. Whether you're seeking support or offering it, we're here every step of the way."
        heroImageSrc="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=2160&q=80"
        testimonials={[]}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Signing you in...</p>
          </div>
        </div>
      )}
    </div>
  );
}
