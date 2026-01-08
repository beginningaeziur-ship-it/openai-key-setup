/**
 * Skip Onboarding Button
 * 
 * AEZUIR RULE: Overwhelmed users must be able to skip onboarding 
 * and still access Safe House.
 * 
 * Behavior:
 * - Immediately route user to Safe House (Bedroom)
 * - Do NOT block access to SAI
 * - Save progress: onboardingSkipped = true, onboardingCheckpoint = currentScreenId
 * - Onboarding can be resumed later from checkpoint
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { persistence } from '@/lib/persistence';
import { cn } from '@/lib/utils';

interface SkipOnboardingButtonProps {
  currentScreenId: string;
  className?: string;
}

export function SkipOnboardingButton({ currentScreenId, className }: SkipOnboardingButtonProps) {
  const navigate = useNavigate();
  
  const handleSkip = () => {
    // Save progress
    persistence.setOnboardingSkipped(true);
    persistence.setOnboardingCheckpoint(currentScreenId);
    
    // Mark playroom and PIN as not completed (user can still access)
    // But immediately unlock safe house for emergency access
    persistence.setIsSafeHouseUnlocked(true);
    
    // Go directly to Safe House (Bedroom)
    navigate('/sai-home', { replace: true });
  };
  
  return (
    <Button
      variant="ghost"
      onClick={handleSkip}
      className={cn(
        "text-muted-foreground hover:text-foreground text-sm",
        className
      )}
    >
      Skip for now (I'm overwhelmed)
    </Button>
  );
}
