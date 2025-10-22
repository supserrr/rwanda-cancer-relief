'use client';

import { SignInPage, Testimonial } from "@workspace/ui/components/ui/sign-in";

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
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    alert(`Sign In Submitted! Check the browser console for form data.`);
  };

  const handleGoogleSignIn = () => {
    console.log("Continue with Google clicked");
    alert("Continue with Google clicked");
  };
  
  const handleResetPassword = () => {
    alert("Reset Password clicked");
  }

  const handleCreateAccount = () => {
    alert("Create Account clicked");
  }

  return (
    <div className="bg-background text-foreground">
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
    </div>
  );
}
