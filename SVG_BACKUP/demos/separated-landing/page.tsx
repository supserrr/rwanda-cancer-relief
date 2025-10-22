"use client";

import { HeroSection } from "@/components/ui/hero-section";
import { WhyMattersSection } from "@/components/ui/why-matters-section";
import { FeatureSpotlightSection } from "@/components/ui/feature-spotlight-section";
import { HowItWorksSection } from "@/components/ui/how-it-works-section";
import { StandaloneSvgAnimation } from "@/components/ui/standalone-svg-animation";

/**
 * Separated Landing Page
 * 
 * This page demonstrates the landing page with all sections separated
 * from the SVG animation. Each section is now an independent component
 * that can be used, styled, and positioned separately.
 * 
 * @returns {JSX.Element} The separated landing page
 */
export default function SeparatedLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <HeroSection />
      
      {/* SVG Animation Section - Can be positioned anywhere */}
      <StandaloneSvgAnimation 
        className="bg-muted/30" 
        svgClassName="opacity-60"
      />
      
      {/* Why This Platform Matters Section */}
      <WhyMattersSection />
      
      {/* Feature Spotlight Section */}
      <FeatureSpotlightSection />
      
      {/* How It Works Section */}
      <HowItWorksSection />
      
      {/* Additional SVG Animation Section - Example of multiple SVG sections */}
      <StandaloneSvgAnimation 
        className="bg-primary/5" 
        svgClassName="opacity-40"
      />
    </div>
  );
}
