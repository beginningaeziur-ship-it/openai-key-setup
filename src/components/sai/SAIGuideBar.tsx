import React from 'react';
import { SAIAvatar } from './SAIAvatar';
import { SAINarratorControls } from './SAINarratorControls';
import { cn } from '@/lib/utils';

interface SAIGuideBarProps {
  message?: string;
  className?: string;
  showControls?: boolean;
  compact?: boolean;
}

/**
 * A floating bar that shows SAI avatar, current message, and narrator controls.
 * Use this at the top or bottom of screens for consistent SAI presence.
 */
export function SAIGuideBar({ 
  message, 
  className,
  showControls = true,
  compact = false,
}: SAIGuideBarProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg',
      compact && 'p-2 gap-2',
      className
    )}>
      <SAIAvatar size={compact ? 'sm' : 'md'} />
      
      {message && (
        <p className={cn(
          'flex-1 text-foreground/90',
          compact ? 'text-sm' : 'text-base',
        )}>
          {message}
        </p>
      )}
      
      {showControls && (
        <SAINarratorControls compact={compact} />
      )}
    </div>
  );
}
