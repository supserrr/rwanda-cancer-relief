"use client";

import { useEffect } from "react";

/**
 * Sets theme-color meta tag based on current DOM theme state
 * for seamless iOS Safari overscroll area blending
 */
export function ThemeColorMeta() {
  useEffect(() => {
    // Function to update theme-color based on current DOM state
    const updateThemeColor = () => {
      // Remove any existing theme-color meta tags
      const existingTags = document.querySelectorAll('meta[name="theme-color"]');
      existingTags.forEach(tag => tag.remove());

      // Check if dark class is present on html element
      const isDark = document.documentElement.classList.contains('dark');
      
      // Create theme-color meta tag based on current theme
      const themeColorTag = document.createElement('meta');
      themeColorTag.name = 'theme-color';
      themeColorTag.content = isDark ? '#0f0f0f' : '#fafaf9';
      
      // Add to head
      document.head.appendChild(themeColorTag);
    };

    // Initial update
    updateThemeColor();

    // Watch for class changes on html element
    const observer = new MutationObserver(() => {
      updateThemeColor();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Cleanup
    return () => {
      observer.disconnect();
      const existingTags = document.querySelectorAll('meta[name="theme-color"]');
      existingTags.forEach(tag => tag.remove());
    };
  }, []);

  return null;
}

