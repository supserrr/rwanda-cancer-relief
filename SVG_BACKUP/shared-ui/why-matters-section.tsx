"use client";

import React from "react";

/**
 * Why This Platform Matters section component
 * 
 * This component displays a section title that introduces the next
 * content area, explaining why the platform is important for users.
 * 
 * @returns {JSX.Element} The why matters section component
 */
export const WhyMattersSection = () => {
  return (
    <section className="w-full py-20 text-center px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-jakarta-sans text-4xl lg:text-5xl font-semibold text-foreground mb-8">
          Why This Platform Matters
        </h2>
        <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Cancer affects not just the body, but the heart and soul. Our platform bridges the gap between medical treatment and emotional healing, providing culturally sensitive support that understands the unique challenges faced by Rwandan families.
        </p>
      </div>
    </section>
  );
};
