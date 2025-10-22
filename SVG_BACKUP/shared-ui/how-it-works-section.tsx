"use client";

import React from "react";

/**
 * How It Works section component
 * 
 * This component displays a step-by-step guide showing users how the platform works.
 * It includes three main steps with images and descriptions, along with arrow
 * indicators between steps.
 * 
 * @returns {JSX.Element} The how it works section component
 */
export const HowItWorksSection = () => {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-20">
          <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-8">
            How It Works
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Getting the support you need is simple and straightforward. Follow these three easy steps to connect with a counselor who understands your journey.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-16">
          {/* Step 1 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
                Get Connected with the Right Counselor
              </h3>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                Answer a few short questions to be matched with a trained Rwandan counselor who understands your unique needs and background. Our platform connects you with professionals experienced in supporting cancer patients and their families.
              </p>
            </div>
            <div className="flex-1 w-full lg:w-auto">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&h=600&fit=crop&auto=format&q=80"
                alt="Counselor matching process"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex justify-center py-4">
            <svg className="w-8 h-8 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
                Choose How You Communicate
              </h3>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                Speak with your counselor in the way that feels most comfortable, through secure chat, audio, or video sessions. Every interaction is confidential and guided by compassion and professionalism.
              </p>
            </div>
            <div className="flex-1 w-full lg:w-auto">
              <img
                src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&h=600&fit=crop&auto=format&q=80"
                alt="Communication options - chat, audio, video"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className="flex justify-center py-4">
            <svg className="w-8 h-8 text-primary animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
                Support When You Need It Most
              </h3>
              <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                Access counseling and emotional support anytime, anywhere. You can message your counselor between sessions or schedule live appointments at times that work best for you, all from your phone or computer.
              </p>
            </div>
            <div className="flex-1 w-full lg:w-auto">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&auto=format&q=80"
                alt="24/7 support accessibility"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
