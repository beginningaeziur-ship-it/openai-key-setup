/**
 * Onboarding Resume Banner
 * 
 * Shows in Bedroom when onboarding was skipped.
 * Allows user to resume or dismiss (24h snooze).
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { persistence } from '@/lib/persistence';
import { cn } from '@/lib/utils';

export function OnboardingResumeBanner() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Only show if onboarding was skipped and not completed, and reminder not snoozed
    const skipped = persistence.getOnboardingSkipped();
    const completed = persistence.getHasCompletedOnboarding();
    const shouldShow = persistence.shouldShowSkipReminder();
    
    setVisible(skipped && !completed && shouldShow);
  }, []);
  
  const handleResume = () => {
    const checkpoint = persistence.getOnboardingCheckpoint();
    if (checkpoint) {
      navigate(`/onboarding/${checkpoint}`);
    } else {
      navigate('/onboarding/waiting-room');
    }
  };
  
  const handleDismiss = () => {
    persistence.setSkipReminderDismissedAt();
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className={cn(
      "fixed top-16 left-1/2 -translate-x-1/2 z-50",
      "bg-card border border-border rounded-lg shadow-lg",
      "px-4 py-3 max-w-sm w-[90vw]",
      "animate-in slide-in-from-top-2 duration-300"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-foreground">
            You can finish setup anytime. It helps me tailor goals safely.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleResume}
              className="text-xs"
            >
              Finish setup
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground"
            >
              Not now
            </Button>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDismiss}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
