"use client";

import { useEffect } from "react";

/**
 * Sets theme-color meta tag based on current color scheme
 * for seamless iOS Safari overscroll area blending
 */
export function ThemeColorMeta() {
  useEffect(() => {
    // Remove any existing theme-color meta tags
    const existingTags = document.querySelectorAll('meta[name="theme-color"]');
    existingTags.forEach(tag => tag.remove());

    // Create new meta tags for light and dark modes
    const lightTag = document.createElement('meta');
    lightTag.name = 'theme-color';
    lightTag.content = '#fafaf9';
    lightTag.setAttribute('media', '(prefers-color-scheme: light)');
    
    const darkTag = document.createElement('meta');
    darkTag.name = 'theme-color';
    darkTag.content = '#0f0f0f';
    darkTag.setAttribute('media', '(prefers-color-scheme: dark)');

    // Add to head
    document.head.appendChild(lightTag);
    document.head.appendChild(darkTag);

    // Cleanup function
    return () => {
      lightTag.remove();
      darkTag.remove();
    };
  }, []);

  return null;
}

