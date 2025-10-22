# Separated Landing Page Sections

## Overview

This directory contains individual, reusable components that were previously combined in the SVG Follow Scroll component. Each section is now independent and can be used, styled, and positioned separately.

## Components

### 1. HeroSection
**File:** `hero-section.tsx`

The main hero section with title, description, and call-to-action buttons.

**Features:**
- Responsive typography
- CTA buttons with hover effects
- Clean, centered layout

**Usage:**
```tsx
import { HeroSection } from '@/components/ui/hero-section';

export default function MyPage() {
  return <HeroSection />;
}
```

### 2. WhyMattersSection
**File:** `why-matters-section.tsx`

A section that explains why the platform matters to users.

**Features:**
- Centered text layout
- Responsive typography
- Background color support

**Usage:**
```tsx
import { WhyMattersSection } from '@/components/ui/why-matters-section';

export default function MyPage() {
  return <WhyMattersSection />;
}
```

### 3. FeatureSpotlightSection
**File:** `feature-spotlight-section.tsx`

Showcases the main feature with image and detailed description.

**Features:**
- Image and text layout
- Responsive design (stacked on mobile, side-by-side on desktop)
- CTA button integration

**Usage:**
```tsx
import { FeatureSpotlightSection } from '@/components/ui/feature-spotlight-section';

export default function MyPage() {
  return <FeatureSpotlightSection />;
}
```

### 4. HowItWorksSection
**File:** `how-it-works-section.tsx`

Step-by-step guide showing how the platform works.

**Features:**
- Three-step process
- Animated arrow indicators
- Responsive image and text layout
- Numbered step indicators

**Usage:**
```tsx
import { HowItWorksSection } from '@/components/ui/how-it-works-section';

export default function MyPage() {
  return <HowItWorksSection />;
}
```

### 5. StandaloneSvgAnimation
**File:** `standalone-svg-animation.tsx`

Independent SVG animation component that can be positioned anywhere.

**Features:**
- Scroll-linked animation
- Customizable positioning
- Responsive behavior (different positioning on mobile vs desktop)
- Customizable styling

**Props:**
- `className?: string` - Additional CSS classes for the container
- `svgClassName?: string` - Additional CSS classes for the SVG

**Usage:**
```tsx
import { StandaloneSvgAnimation } from '@/components/ui/standalone-svg-animation';

export default function MyPage() {
  return (
    <StandaloneSvgAnimation 
      className="bg-muted/30" 
      svgClassName="opacity-60"
    />
  );
}
```

## Demo Pages

### 1. Separated Landing Page
**URL:** `/separated-landing`

Shows all sections used independently with multiple SVG animations positioned throughout the page.

### 2. SVG with Sections Demo
**URL:** `/svg-with-sections-demo`

Demonstrates various ways to integrate the SVG animation with different sections, including overlay positioning and custom styling.

## Benefits of Separation

1. **Modularity**: Each section can be used independently
2. **Flexibility**: Sections can be reordered, styled, or positioned differently
3. **Reusability**: Components can be used across different pages
4. **Maintainability**: Easier to update individual sections
5. **Performance**: Only load the sections you need
6. **Customization**: Each section can have its own styling and behavior

## Integration Examples

### Basic Landing Page
```tsx
import { 
  HeroSection, 
  WhyMattersSection, 
  FeatureSpotlightSection, 
  HowItWorksSection 
} from '@/components/ui';

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <WhyMattersSection />
      <FeatureSpotlightSection />
      <HowItWorksSection />
    </div>
  );
}
```

### With SVG Animations
```tsx
import { 
  HeroSection, 
  StandaloneSvgAnimation,
  FeatureSpotlightSection 
} from '@/components/ui';

export default function AnimatedPage() {
  return (
    <div>
      <HeroSection />
      <StandaloneSvgAnimation className="bg-primary/5" />
      <FeatureSpotlightSection />
    </div>
  );
}
```

### Custom Layout
```tsx
import { 
  HeroSection, 
  HowItWorksSection,
  StandaloneSvgAnimation 
} from '@/components/ui';

export default function CustomPage() {
  return (
    <div className="custom-layout">
      <HeroSection />
      <div className="grid grid-cols-2 gap-8">
        <HowItWorksSection />
        <StandaloneSvgAnimation className="h-full" />
      </div>
    </div>
  );
}
```

## Styling

All components use Tailwind CSS classes and support the existing design system. You can customize them by:

1. **Adding custom classes** to component containers
2. **Using CSS variables** for consistent theming
3. **Overriding specific styles** with utility classes
4. **Creating wrapper components** for additional styling

## Dependencies

- **framer-motion**: For SVG animations
- **React**: For component structure
- **Tailwind CSS**: For styling
- **Plus Jakarta Sans**: For typography
