'use client';

import { SignInPage, Testimonial } from "@workspace/ui/components/ui/sign-in";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    name: "Emma Thompson",
    handle: "@emmathompson",
    text: "Joining RCR was the best decision I made. The community support and resources have been invaluable during my recovery."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    name: "James Wilson",
    handle: "@jameswilson",
    text: "The educational programs and peer support groups have helped me understand my condition better and connect with others."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    name: "Maria Rodriguez",
    handle: "@mariarodriguez",
    text: "RCR's holistic approach to cancer care goes beyond medical treatment. They truly care about your emotional and mental well-being."
  },
];

/**
 * Sign Up page component for Rwanda Cancer Relief
 */
export default function SignUpPageDemo() {
  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign Up submitted:", data);
    alert(`Sign Up Submitted! Check the browser console for form data.`);
  };

  const handleGoogleSignUp = () => {
    console.log("Continue with Google clicked");
    alert("Continue with Google clicked");
  };
  
  const handleResetPassword = () => {
    alert("Reset Password clicked");
  }

  const handleSignIn = () => {
    alert("Sign In clicked");
  }

  return (
    <div className="bg-background text-foreground">
      <SignInPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            Join <span className="font-semibold text-primary">Rwanda Cancer Relief</span>
          </span>
        }
        description="Create your account and become part of our supportive community. Together, we can face any challenge."
        heroImageSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignUp}
        onGoogleSignIn={handleGoogleSignUp}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleSignIn}
      />
    </div>
  );
}
