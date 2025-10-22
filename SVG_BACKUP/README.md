# SVG Follow Scroll Component

## Overview

The SVG Follow Scroll component creates an animated SVG path that progressively draws as the user scrolls down the page. This creates a visually engaging scroll experience with smooth animations tied to scroll progress.

## Features

- **Scroll-linked Animation**: SVG path draws progressively based on scroll position
- **Framer Motion Integration**: Uses Framer Motion for smooth, performant animations
- **Responsive Design**: Adapts to different screen sizes
- **Customizable Styling**: Supports custom colors and styling through Tailwind CSS

## Usage

### Basic Usage

```tsx
import { Skiper19 } from '@/components/ui/svg-follow-scroll';

export default function MyPage() {
  return <Skiper19 />;
}
```

### Component Structure

The component consists of two main parts:

1. **Skiper19**: The main component that creates the scroll container and content
2. **LinePath**: The animated SVG path component that draws based on scroll progress

## Dependencies

- **framer-motion**: For scroll-linked animations
- **React**: For component structure
- **Tailwind CSS**: For styling
- **Plus Jakarta Sans**: For typography (configured in layout.tsx)

## Demo Pages

- `/svg-scroll-demo` - Updated demo using the local component
- `/svg-follow-scroll-demo` - Simple demo showcasing the original design
- `/enhanced-svg-demo` - Enhanced demo with separated sections added below the original SVG
- `/separated-landing` - All sections used independently
- `/svg-with-sections-demo` - Various SVG integration examples

## Customization

The component can be customized by modifying:

- **Colors**: Update the stroke color in the LinePath component
- **Path**: Modify the SVG path data for different shapes
- **Content**: Update the text and layout in the main component
- **Styling**: Use Tailwind classes for responsive design

## Technical Details

- Uses `useScroll` hook from Framer Motion to track scroll progress
- Implements `useTransform` to map scroll progress to path length
- Creates a 350vh height container for extended scroll experience
- SVG path animates from 50% to 100% path length based on scroll
