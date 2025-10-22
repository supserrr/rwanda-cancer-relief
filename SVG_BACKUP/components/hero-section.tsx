"use client";

import React from "react";

/**
 * Hero Section component for the landing page
 * 
 * This component displays the main hero content with title, description,
 * and call-to-action buttons. It's designed to be the first section
 * users see when visiting the site.
 * 
 * @returns {JSX.Element} The hero section component
 */
export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-transparent text-foreground px-6 lg:px-12 relative z-20">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-start justify-start gap-6 text-left">
          <h1 className="font-jakarta-sans text-5xl font-medium tracking-[-0.02em] lg:text-7xl text-foreground leading-tight">
            Compassionate Cancer Support, Wherever You Are
          </h1>
          <p className="font-jakarta-sans text-lg lg:text-xl font-normal text-muted-foreground leading-relaxed max-w-3xl">
            Living with cancer is not just a medical journey. It's an emotional one. Rwanda Cancer Relief offers counseling and culturally adapted resources to support patients and families through every step, accessible anytime, anywhere.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mt-4">
            <a 
              href="/get-help" 
              className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              Get Help
            </a>
            <a 
              href="/counselor" 
              className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary bg-background border-2 border-primary rounded-full hover:bg-primary/10 transition-all duration-200 whitespace-nowrap"
            >
              I'm a Counselor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
