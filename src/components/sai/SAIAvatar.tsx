import React from 'react';
import { cn } from '@/lib/utils';
import { useSAINarrator } from '@/contexts/SAINarratorContext';

interface SAIAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPulse?: boolean;
}

export function SAIAvatar({ size = 'md', className, showPulse }: SAIAvatarProps) {
  const { isNarrating, isListening } = useSAINarrator();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const isActive = isNarrating || isListening || showPulse;

  return (
    <div className={cn(
      'relative rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg',
      sizeClasses[size],
      isActive && 'sai-breathe',
      className
    )}>
      {/* Inner glow when active */}
      {isActive && (
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse" />
      )}
      
      {/* SAI Icon/Text */}
      <span className={cn(
        'font-semibold text-primary-foreground z-10',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
      )}>
        SAI
      </span>

      {/* Speaking indicator */}
      {isNarrating && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          <div className="w-1 h-1 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1 h-1 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1 h-1 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Listening indicator */}
      {isListening && !isNarrating && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      )}
    </div>
  );
}
