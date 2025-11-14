"use client";

import React from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface TypingIndicatorProps {
  /**
   * Whether the typing indicator should be visible
   */
  isVisible?: boolean;
  /**
   * Name of the person typing (optional)
   */
  name?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TypingIndicator component
 * 
 * Displays an animated typing indicator with three dots
 * to show when someone is typing in a chat.
 */
export function TypingIndicator({ isVisible = false, name, className }: TypingIndicatorProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      <div className="flex items-center gap-1 px-3 py-2 bg-muted rounded-lg">
        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {name && (
        <span className="text-xs text-muted-foreground">{name} is typing...</span>
      )}
    </div>
  );
}

