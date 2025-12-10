import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThreeChoicePrompt } from '@/components/sai/ThreeChoicePrompt';
import { useEmotionalState } from '@/contexts/EmotionalStateContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompanionCheckInProps {
  onNeedGrounding?: () => void;
  onRequestSlowDown?: () => void;
  className?: string;
}

const CHECK_IN_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'sai_last_companion_checkin';

// Routes where check-ins should be disabled
const DISABLED_ROUTES = [
  '/',
  '/onboarding',
];

export function CompanionCheckIn({ 
  onNeedGrounding, 
  onRequestSlowDown,
  className 
}: CompanionCheckInProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { 
    emotionalState, 
    recordCheckIn, 
    recordChoice, 
    recordSlowDownRequest,
    setNeedsGrounding 
  } = useEmotionalState();
  const { speak, voiceEnabled } = useVoiceSettings();
  const { userProfile, onboarding } = useSAI();

  const saiName = userProfile?.saiNickname || 'SAI';
  
  // Check if we're on a route where check-ins should be disabled
  const isOnDisabledRoute = DISABLED_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith('/onboarding')
  );
  
  // Also check if tour/tutorial is in progress
  const isTutorialActive = localStorage.getItem('sai_tutorial_completed') !== 'true';
  const isRoomTourActive = localStorage.getItem('sai_room_tour_completed') !== 'true';
  
  const shouldDisableCheckIns = isOnDisabledRoute || !onboarding.completed || isTutorialActive || isRoomTourActive;

  // Check if it's time for a check-in
  useEffect(() => {
    // Don't show check-ins during onboarding or tour
    if (shouldDisableCheckIns) {
      setIsVisible(false);
      return;
    }
    
    const checkInterval = () => {
      const lastCheckIn = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      
      if (!lastCheckIn || now - parseInt(lastCheckIn) > CHECK_IN_INTERVAL) {
        // Don't auto-show if dismissed recently
        if (!isDismissed) {
          setIsVisible(true);
        }
      }
    };

    // Check on mount
    const timer = setTimeout(checkInterval, 3000); // Small delay on mount

    // Check periodically
    const interval = setInterval(checkInterval, 60000); // Check every minute

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isDismissed, shouldDisableCheckIns]);

  const handleChoice = useCallback((choice: string) => {
    recordCheckIn();
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    
    if (choice === 'gentle') {
      // User wants to slow down or get more explanation
      recordChoice('gentle');
      recordSlowDownRequest();
      onRequestSlowDown?.();
      
      if (voiceEnabled) {
        speak("No problem. Let's take a moment. There's no rush here.");
      }
    } else if (choice === 'standard') {
      // User is okay
      recordChoice('standard');
    } else if (choice === 'challenge') {
      // User needs grounding/support
      recordChoice('gentle'); // This is actually a support need
      setNeedsGrounding(true);
      onNeedGrounding?.();
      
      if (voiceEnabled) {
        speak("I'm here with you. Let's do a quick grounding exercise together.");
      }
    }
    
    setIsVisible(false);
    setIsDismissed(true);
    
    // Reset dismissed state after a while
    setTimeout(() => setIsDismissed(false), CHECK_IN_INTERVAL);
  }, [recordCheckIn, recordChoice, recordSlowDownRequest, setNeedsGrounding, onNeedGrounding, onRequestSlowDown, voiceEnabled, speak]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    
    // Reset dismissed state after a while
    setTimeout(() => setIsDismissed(false), CHECK_IN_INTERVAL);
  }, []);

  // Speak the check-in when it appears
  useEffect(() => {
    if (isVisible && voiceEnabled) {
      speak("Just checking in. How are you doing?");
    }
  }, [isVisible, voiceEnabled, speak]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed top-20 right-4 z-40 w-72 animate-in slide-in-from-right-5 fade-in-0',
      className
    )}>
      <Card className="p-3 shadow-lg border-primary/20 bg-card/95 backdrop-blur-sm">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-3 w-3" />
        </Button>

        {/* Companion avatar */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sai-calm/30 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
            <Heart className="w-5 h-5 text-sai-calm-dark" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-foreground">{saiName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Just checking in — how are you doing?
            </p>
          </div>
        </div>

        {/* Three-choice response */}
        <ThreeChoicePrompt
          prompt=""
          options={[
            {
              id: 'gentle',
              label: 'Slow down',
              description: 'Take it easier',
            },
            {
              id: 'standard',
              label: "I'm okay",
              description: 'Keep going',
            },
            {
              id: 'challenge',
              label: 'Need support',
              description: 'Grounding help',
            },
          ]}
          onSelect={handleChoice}
          variant="compact"
        />
      </Card>
    </div>
  );
}

// Mini floating companion button that can trigger check-in
export function CompanionButton({ onClick }: { onClick?: () => void }) {
  const { emotionalState } = useEmotionalState();
  const { userProfile } = useSAI();

  const isDistressed = emotionalState.distressLevel === 'high';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        'fixed top-20 left-4 z-30 h-10 w-10 rounded-full shadow-lg',
        'bg-sai-calm/80 hover:bg-sai-calm border border-sai-calm-dark/30',
        isDistressed && 'animate-pulse'
      )}
      title={`${userProfile?.saiNickname || 'SAI'} is here`}
    >
      <Heart className={cn(
        'w-5 h-5',
        isDistressed ? 'text-destructive' : 'text-sai-calm-dark'
      )} />
    </Button>
  );
}
