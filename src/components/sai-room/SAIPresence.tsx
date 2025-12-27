import React from "react";
import { Volume2, VolumeX, Wind, Target, Pause } from "lucide-react";
import { useSAI } from "@/contexts/SAIContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RobotDogAvatar } from "@/components/sai/RobotDogAvatar";
import { useServiceDog } from "@/contexts/ServiceDogContext";

export type SAIStatus = 'idle' | 'listening' | 'speaking' | 'thinking';

interface SAIPresenceProps {
  saiName: string;
  message?: string;
  isSpeaking?: boolean;
  className?: string;
  status?: SAIStatus;
  voiceOn?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;
  onQuickAction?: (action: 'grounding' | 'planning' | 'quiet') => void;
}

export function SAIPresence({ 
  saiName, 
  message, 
  isSpeaking = false, 
  className,
  status = 'idle',
  voiceOn = true,
  onVoiceToggle,
  onQuickAction
}: SAIPresenceProps) {
  const { selectedCategories, selectedConditions, selectedSymptoms } = useSAI();
  const { dogState, dogModeEnabled, getOverallEnergy } = useServiceDog();

  // Auto-shift tone based on disability profile
  const getTone = () => {
    const conditionNames = selectedConditions.flatMap(c => c.conditions);
    const symptomNames = selectedSymptoms.flatMap(s => s.symptoms);

    if (symptomNames.some(s => s.toLowerCase().includes('panic')) || 
        symptomNames.some(s => s.toLowerCase().includes('anxiety'))) return 'calming';
    if (conditionNames.some(c => c.toLowerCase().includes('autism'))) return 'literal';
    if (conditionNames.some(c => c.toLowerCase().includes('cptsd') || 
        c.toLowerCase().includes('ptsd'))) return 'gentle';
    if (conditionNames.some(c => c.toLowerCase().includes('adhd'))) return 'direct';

    return 'neutral';
  };

  const tone = getTone();
  const currentStatus = isSpeaking ? 'speaking' : status;

  const getStatusText = () => {
    switch (currentStatus) {
      case 'listening': return "Listening...";
      case 'speaking': return "Speaking...";
      case 'thinking': return "Thinking...";
      default: return message || "I'm here.";
    }
  };

  const toneStyles: Record<string, string> = {
    neutral: 'text-foreground/80',
    gentle: 'text-foreground/70',
    literal: 'text-foreground font-medium',
    calming: 'text-foreground/60',
    direct: 'text-foreground/90 font-medium',
  };

  // Map SAIStatus to RobotDogAvatar state
  const getDogState = () => {
    switch (currentStatus) {
      case 'listening': return 'listening';
      case 'speaking': return 'speaking';
      case 'thinking': return 'attentive';
      default: return 'resting';
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Robot Dog Avatar */}
      <RobotDogAvatar 
        size="xl" 
        state={getDogState()} 
        showBreathing={currentStatus === 'idle'}
        energyLevel={dogModeEnabled ? getOverallEnergy() : 'high'}
        needLevels={dogModeEnabled ? dogState.needLevels : undefined}
        showNeedIndicators={dogModeEnabled}
      />

      {/* SAI Name */}
      <div className="text-center">
        <h2 className="text-xl font-display font-semibold text-foreground">
          {saiName}
        </h2>
        <p className={cn('text-sm mt-1', toneStyles[tone])}>
          {getStatusText()}
        </p>
      </div>

      {/* Voice toggle */}
      {onVoiceToggle && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVoiceToggle(!voiceOn)}
            className={cn(
              'rounded-full h-9 px-4 gap-2',
              voiceOn ? 'border-primary/40 text-primary' : 'text-muted-foreground'
            )}
          >
            {voiceOn ? (
              <>
                <Volume2 className="h-4 w-4" />
                <span className="text-xs">Voice on</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                <span className="text-xs">Voice off</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Quick action buttons */}
      {onQuickAction && (
        <div className={cn(
          'flex gap-2 mt-2',
          'bg-card/40 border border-border/30 rounded-xl p-3',
          'backdrop-blur-sm'
        )}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction('grounding')}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <Wind className="h-4 w-4" />
            <span className="text-xs">Ground</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction('planning')}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <Target className="h-4 w-4" />
            <span className="text-xs">Plan</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onQuickAction('quiet')}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <Pause className="h-4 w-4" />
            <span className="text-xs">Quiet</span>
          </Button>
        </div>
      )}
    </div>
  );
}