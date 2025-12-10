import React, { useEffect } from 'react';
import { SAIAvatar } from '@/components/sai/SAIAvatar';
import { SAINarratorControls } from '@/components/sai/SAINarratorControls';
import { useSAINarrator } from '@/contexts/SAINarratorContext';
import { cn } from '@/lib/utils';

interface OnboardingScreenProps {
  screenId: string;
  title: string;
  narration: string;
  children: React.ReactNode;
  className?: string;
  askQuestions?: boolean;
  onNarrationComplete?: () => void;
}

/**
 * Wrapper component for onboarding screens that handles SAI narration.
 * Each screen has its unique narration that plays once.
 */
export function OnboardingScreen({
  screenId,
  title,
  narration,
  children,
  className,
  askQuestions = true,
  onNarrationComplete,
}: OnboardingScreenProps) {
  const { narrateScreen, hasNarratedScreen, isNarrating, isMuted } = useSAINarrator();

  useEffect(() => {
    // Only narrate if we haven't already
    if (!hasNarratedScreen(screenId)) {
      narrateScreen(screenId, narration, askQuestions).then(() => {
        onNarrationComplete?.();
      });
    }
  }, [screenId, narration, askQuestions, narrateScreen, hasNarratedScreen, onNarrationComplete]);

  return (
    <div className={cn(
      'min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-background/95',
      'p-6 pb-24',
      className
    )}>
      {/* SAI Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SAIAvatar size="md" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {isNarrating && !isMuted && (
              <p className="text-sm text-muted-foreground">SAI is speaking...</p>
            )}
          </div>
        </div>
        <SAINarratorControls compact />
      </div>

      {/* Muted text display */}
      {isMuted && (
        <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-sm text-foreground/80">{narration}</p>
        </div>
      )}

      {/* Screen content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
