"use client";

import { HeroSection } from "@/components/ui/hero-section";
import { StandaloneSvgAnimation } from "@/components/ui/standalone-svg-animation";
import { FeatureSpotlightSection } from "@/components/ui/feature-spotlight-section";

/**
 * SVG with Sections Demo
 * 
 * This page demonstrates how to use the standalone SVG animation
 * component with different sections, showing various positioning
 * and styling options.
 * 
 * @returns {JSX.Element} The SVG with sections demo page
 */
export default function SvgWithSectionsDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <HeroSection />
      
      {/* SVG Animation positioned between sections */}
      <StandaloneSvgAnimation 
        className="bg-gradient-to-b from-background to-muted/20" 
        svgClassName="opacity-70"
      />
      
      {/* Feature Spotlight with SVG overlay */}
      <div className="relative">
        <FeatureSpotlightSection />
        {/* SVG positioned as overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <StandaloneSvgAnimation 
            className="h-full" 
            svgClassName="opacity-20"
          />
        </div>
      </div>
      
      {/* Another section with different SVG styling */}
      <div className="py-20 px-6 bg-muted/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Custom SVG Integration</h2>
          <p className="text-lg text-muted-foreground mb-12">
            The SVG animation can be positioned anywhere and styled independently
          </p>
          
          {/* SVG with custom positioning */}
          <StandaloneSvgAnimation 
            className="h-96 bg-primary/5 rounded-2xl" 
            svgClassName="opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
