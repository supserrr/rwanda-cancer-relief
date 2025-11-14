"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@workspace/ui/lib/utils';
import { Smile } from 'lucide-react';

export interface ReactionPickerProps {
  /**
   * Current reactions on the message {emoji: [userId1, userId2, ...]}
   */
  reactions?: Record<string, string[]>;
  /**
   * Current user ID to check if they've reacted
   */
  currentUserId?: string;
  /**
   * Callback when a reaction is added or removed
   */
  onReaction?: (emoji: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Common emoji reactions
 */
const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/**
 * ReactionPicker component
 * 
 * Displays message reactions and allows users to add/remove reactions.
 * Shows a popover with emoji picker when clicking the reaction button.
 */
export function ReactionPicker({
  reactions = {},
  currentUserId,
  onReaction,
  className,
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReaction = (emoji: string) => {
    onReaction?.(emoji);
    setIsOpen(false);
  };

  // Get all unique emojis that have reactions
  const reactedEmojis = Object.keys(reactions).filter(
    (emoji) => reactions[emoji] && reactions[emoji].length > 0
  );

  // Check if current user has reacted with any emoji
  const userHasReacted = currentUserId
    ? reactedEmojis.some((emoji) => reactions[emoji]?.includes(currentUserId))
    : false;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Display existing reactions */}
      {reactedEmojis.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {reactedEmojis.map((emoji) => {
            const userIds = reactions[emoji] || [];
            const count = userIds.length;
            const hasUserReacted = currentUserId ? userIds.includes(currentUserId) : false;

            return (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                  "hover:bg-muted/80 border",
                  hasUserReacted
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-transparent text-muted-foreground"
                )}
                title={`${count} reaction${count !== 1 ? 's' : ''}`}
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-medium">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Add reaction button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 w-7 p-0 rounded-full",
              userHasReacted && "bg-primary/10 text-primary"
            )}
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex items-center gap-1">
            {COMMON_EMOJIS.map((emoji) => {
              const userIds = reactions[emoji] || [];
              const hasUserReacted = currentUserId ? userIds.includes(currentUserId) : false;

              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    "h-8 w-8 rounded-md text-lg transition-colors flex items-center justify-center",
                    "hover:bg-muted",
                    hasUserReacted && "bg-primary/10"
                  )}
                  title={hasUserReacted ? 'Remove reaction' : 'Add reaction'}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

