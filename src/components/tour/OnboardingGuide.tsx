import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Heart, Volume2, VolumeX, ChevronRight, HelpCircle, RotateCcw } from 'lucide-react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface OnboardingGuideProps {
  stepId: string;
  title: string;
  content: string;
  voiceText: string;
  tip?: string;
  saiName?: string;
  showPersist?: boolean;
  position?: 'bottom' | 'top' | 'center' | 'side';
  onDismiss?: () => void;
  onRepeat?: () => void;
}

/**
 * Pervasive onboarding guide that appears on every page during onboarding.
 * SAI speaks, teaches, and guides through every step.
 */
export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  stepId,
  title,
  content,
  voiceText,
  tip,
  saiName = 'SAI',
  showPersist = true,
  position = 'bottom',
  onDismiss,
  onRepeat,
}) => {
  const { speak, stopSpeaking, voiceEnabled, setVoiceEnabled } = useVoiceSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [hasSpokeIntro, setHasSpokeIntro] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Speak the intro when component mounts (only once per step)
  useEffect(() => {
    if (voiceEnabled && !hasSpokeIntro && voiceText) {
      setHasSpokeIntro(true);
      setIsPlaying(true);
      speak(voiceText);
      
      // Estimate speaking duration (rough: 150 words per minute)
      const wordCount = voiceText.split(' ').length;
      const estimatedDuration = (wordCount / 150) * 60 * 1000;
      
      const timer = setTimeout(() => setIsPlaying(false), estimatedDuration);
      return () => clearTimeout(timer);
    }
  }, [voiceEnabled, voiceText, hasSpokeIntro, speak]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleRepeat = useCallback(() => {
    if (voiceText) {
      setIsPlaying(true);
      speak(voiceText);
      onRepeat?.();
      
      const wordCount = voiceText.split(' ').length;
      const estimatedDuration = (wordCount / 150) * 60 * 1000;
      setTimeout(() => setIsPlaying(false), estimatedDuration);
    }
  }, [voiceText, speak, onRepeat]);

  const toggleVoice = () => {
    if (voiceEnabled) {
      stopSpeaking();
      setIsPlaying(false);
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const positionClasses = {
    bottom: 'bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md',
    top: 'top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg mx-4',
    side: 'top-24 right-4 max-w-sm',
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={cn(
          'fixed z-40 p-3 rounded-full',
          'bg-primary/90 backdrop-blur-sm shadow-lg',
          'hover:bg-primary transition-all',
          'animate-gentle-glow',
          position === 'bottom' ? 'bottom-4 right-4' : 'top-4 right-4'
        )}
      >
        <Heart className={cn('w-6 h-6 text-primary-foreground', isPlaying && 'animate-pulse')} />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-40',
        positionClasses[position],
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      <div className={cn(
        'bg-card/95 backdrop-blur-xl rounded-2xl border border-border/60 shadow-2xl overflow-hidden',
        isPlaying && 'ring-2 ring-primary/30'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center',
              isPlaying && 'animate-pulse'
            )}>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-medium text-sm text-foreground">{saiName}</span>
              {isPlaying && (
                <span className="ml-2 text-xs text-primary animate-pulse">speaking...</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={toggleVoice}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-primary" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground text-xs"
              title="Minimize"
            >
              −
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>
          
          {tip && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <HelpCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/70">{tip}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {(onDismiss || showPersist) && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 bg-muted/30">
            <button
              onClick={handleRepeat}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Repeat
            </button>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="text-xs"
              >
                Got it
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Step configurations for each onboarding page
export const onboardingStepGuides = {
  'cy-name': {
    title: 'Let\'s Get To Know Each Other',
    content: 'First, give me a name. Something comfortable for you. Then choose how I\'ll sound when I speak to you. You can also enable your microphone so we can have real conversations.',
    voiceText: 'First, let\'s get to know each other. Give me a name. Something comfortable for you. Then choose how I\'ll sound when I speak to you. You can also enable your microphone so we can have real conversations.',
    tip: 'You can call me anything — SAI, Coach, Buddy, or something personal to you.',
  },
  'user-info': {
    title: 'A Little About You',
    content: 'Tell me what you\'d like to be called. This helps me personalize our conversations. Your emergency contact is someone I can reach if you ever need extra support in a crisis.',
    voiceText: 'Now tell me a little about you. What would you like me to call you? And if you\'re comfortable, share an emergency contact. This is someone I can reach if you ever need extra support.',
    tip: 'All of this is private. You can change it anytime in settings.',
  },
  'who-model': {
    title: 'How Life Affects You',
    content: 'The WHO Functional Model helps me understand how different areas of life impact you. There are no wrong answers — just honest reflections on what you experience.',
    voiceText: 'This is the World Health Organization Functional Model. It helps me understand how different areas of life affect you. There are no wrong answers here. Just honest reflections.',
    tip: 'Take your time. You can adjust these levels later.',
  },
  'categories': {
    title: 'What You Navigate',
    content: 'Select the categories that describe what you navigate in life. This helps me adapt my support to your specific experiences. You can select as many as apply.',
    voiceText: 'Now, select the categories that describe what you navigate in life. This helps me adapt my support specifically for you. Select as many as apply.',
    tip: 'This is about understanding, not labeling. Choose what feels relevant.',
  },
  'conditions': {
    title: 'Specific Conditions',
    content: 'Based on what you selected, here are more specific conditions. Choose the ones that apply to you. This helps me understand your experience more deeply.',
    voiceText: 'Based on what you selected, here are more specific conditions. Choose the ones that apply to you. This helps me understand your experience more deeply.',
    tip: 'You don\'t need a formal diagnosis. If you experience it, it counts.',
  },
  'symptoms': {
    title: 'What You Experience',
    content: 'These are common symptoms associated with your conditions. Knowing which ones you experience helps me provide targeted support and grounding techniques.',
    voiceText: 'These are common symptoms you might experience. Knowing which ones affect you helps me provide better support and the right grounding techniques.',
    tip: 'Select what you actually experience, not what you think you should.',
  },
  'preferences': {
    title: 'How I Should Work With You',
    content: 'Everyone learns and copes differently. These preferences help me adjust my pace, intensity, and approach to match what works best for you.',
    voiceText: 'Everyone is different. These preferences help me adjust my pace, my intensity, and my approach to match what works best for you.',
    tip: 'You can always ask me to slow down or speed up during our conversations.',
  },
  'scene': {
    title: 'Choose Your Peaceful Space',
    content: 'This will be your SAI Room — a calm, safe place to return to whenever you need support. Each scene has its own ambient sounds and atmosphere.',
    voiceText: 'Now choose your peaceful space. This will be your SAI Room. A calm, safe place to return to whenever you need support. Each scene has its own sounds and atmosphere.',
    tip: 'The scene you choose becomes your home base. You can change it later.',
  },
  'goals': {
    title: 'Starting Small',
    content: 'Goals here are not pressure — they\'re gentle steps forward. I suggest starting with tiny, achievable goals. We\'ll build from there together.',
    voiceText: 'Goals here are not pressure. They\'re gentle steps forward. I suggest starting with tiny, achievable goals. One breath. One glass of water. We\'ll build from there together.',
    tip: 'Micro-goals lead to lasting change. Start smaller than you think you need.',
  },
  'water-profile': {
    title: 'Your Water Profile',
    content: 'Based on everything you\'ve shared, I\'ve created your Water Profile. This helps me understand how your emotions flow and how I can best support you.',
    voiceText: 'Based on everything you\'ve shared, I\'ve created your Water Profile. This is how I understand your emotional patterns and how I can best support you.',
    tip: 'Your profile isn\'t fixed. As you grow, it will evolve with you.',
  },
};

export type OnboardingStepId = keyof typeof onboardingStepGuides;
