"use client";

import React from "react";

/**
 * Feature Spotlight section component
 * 
 * This component showcases the main feature of the platform - compassionate
 * and culturally attuned counselors. It includes an image and detailed
 * description with a call-to-action button.
 * 
 * @returns {JSX.Element} The feature spotlight section component
 */
export const FeatureSpotlightSection = () => {
  return (
    <section className="w-full py-20 px-6 lg:px-12 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          {/* Image on the left */}
          <div className="flex-1 w-full lg:w-auto">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format&q=80"
              alt="Compassionate counselor providing support"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* Text Content on the right */}
          <div className="flex flex-col items-start gap-6 text-left max-w-2xl">
            <h2 className="font-jakarta-sans text-3xl lg:text-5xl font-medium text-foreground leading-tight tracking-[-0.02em]">
              Compassionate and <span className="text-primary">Culturally Attuned</span> Counselors You Can Trust
            </h2>
            
            <p className="font-jakarta-sans text-base lg:text-lg text-muted-foreground leading-relaxed">
              Connect with dedicated Rwandan counselors who understand the emotional, cultural, and social challenges faced by cancer patients and their families. Our trained professionals offer compassionate guidance through every stage of your journey, providing the same quality of care as in-person counseling, but accessible anywhere, anytime.
            </p>
            
            <div className="flex flex-row gap-3 lg:gap-4">
              <a 
                href="/counselors" 
                className="inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 text-sm lg:text-base font-semibold text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-primary/20 whitespace-nowrap"
              >
                Find a Counselor
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
