import React from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccessibilityPanel } from './AccessibilityPanel';
import { cn } from '@/lib/utils';

interface AccessibilityButtonProps {
  className?: string;
  variant?: 'default' | 'floating';
}

export function AccessibilityButton({ className, variant = 'default' }: AccessibilityButtonProps) {
  if (variant === 'floating') {
    return (
      <div className={cn('fixed top-4 right-4 z-50', className)}>
        <AccessibilityPanel
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/40 hover:bg-black/60 text-white border border-white/20 gap-2 backdrop-blur-sm"
            >
              <Settings2 className="h-4 w-4" />
              <span className="text-xs sr-only sm:not-sr-only">Accessibility</span>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <AccessibilityPanel
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2', className)}
        >
          <Settings2 className="h-4 w-4" />
          <span className="text-xs">Accessibility</span>
        </Button>
      }
    />
  );
}
