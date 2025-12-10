import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface RoomHotspotProps {
  id: string;
  label: string;
  onClick: () => void;
  isHighlighted?: boolean;
  isActive?: boolean;
  className?: string;
  ariaLabel: string;
}

export const RoomHotspot: React.FC<RoomHotspotProps> = ({
  id,
  label,
  onClick,
  isHighlighted = false,
  isActive = false,
  className,
  ariaLabel,
}) => {
  const [isTapped, setIsTapped] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  const handleClick = useCallback(() => {
    setIsTapped(true);
    onClick();
    setTimeout(() => setIsTapped(false), 200);
  }, [onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onFocus={() => setShowLabel(true)}
      onBlur={() => setShowLabel(false)}
      aria-label={ariaLabel}
      className={cn(
        // Base styles
        'relative z-30 w-10 h-10 rounded-full cursor-pointer',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        
        // Default appearance - subtle indicator
        'bg-primary/20 border-2 border-primary/40 backdrop-blur-sm',
        
        // Hover state
        'hover:bg-primary/40 hover:border-primary/60 hover:scale-110',
        'hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]',
        
        // Active/pressed state
        isTapped && 'scale-95',
        
        // Highlighted state (during tour)
        isHighlighted && [
          'animate-pulse bg-primary/50 border-primary/80',
          'shadow-[0_0_30px_hsl(var(--primary)/0.6)]',
          'scale-125',
        ],
        
        // Selected/active state
        isActive && [
          'bg-primary/60 border-primary',
          'shadow-[0_0_25px_hsl(var(--primary)/0.5)]',
        ],
        
        className
      )}
    >
      {/* Inner glow dot */}
      <div className={cn(
        'absolute inset-2 rounded-full',
        'bg-primary/60',
        isHighlighted && 'animate-ping',
      )} />
      
      {/* Tooltip label */}
      <div className={cn(
        'absolute left-1/2 -translate-x-1/2 -top-10 px-3 py-1.5',
        'bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-lg',
        'text-xs font-medium text-foreground whitespace-nowrap',
        'transition-all duration-200',
        'pointer-events-none',
        showLabel || isHighlighted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      )}>
        {label}
        {/* Arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-card/95 border-r border-b border-border/50 rotate-45" />
      </div>
    </button>
  );
};
