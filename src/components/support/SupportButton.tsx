import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SupportButtonProps {
  onClick: () => void;
  className?: string;
  variant?: 'floating' | 'inline';
}

/**
 * The main Support button that opens the Resource Navigator.
 * Can be floating (fixed position) or inline.
 */
export function SupportButton({ onClick, className, variant = 'floating' }: SupportButtonProps) {
  if (variant === 'floating') {
    return (
      <Button
        onClick={onClick}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'h-14 px-6 rounded-full shadow-xl',
          'bg-primary hover:bg-primary/90 text-primary-foreground',
          'flex items-center gap-2',
          'transition-all hover:scale-105 active:scale-95',
          className
        )}
      >
        <Heart className="h-5 w-5" />
        <span className="font-medium">Support</span>
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="default"
      className={cn(
        'flex items-center gap-2',
        className
      )}
    >
      <Heart className="h-4 w-4" />
      <span>Support</span>
    </Button>
  );
}
