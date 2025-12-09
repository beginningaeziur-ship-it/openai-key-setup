import { cn } from '@/lib/utils';
import { Sparkles, Mic, MicOff } from 'lucide-react';
import { useSAI } from '@/contexts/SAIContext';

type SAIStatus = 'idle' | 'listening' | 'speaking' | 'thinking';

interface SAIPresenceProps {
  saiName: string;
  message?: string;
  isSpeaking?: boolean;
  className?: string;
  status?: SAIStatus;
  voiceOn?: boolean;
  onVoiceToggle?: (enabled: boolean) => void;
}

export function SAIPresence({ 
  saiName, 
  message, 
  isSpeaking, 
  className,
  status = 'idle',
  voiceOn = false,
  onVoiceToggle
}: SAIPresenceProps) {
  const { selectedCategories, selectedConditions, selectedSymptoms } = useSAI();

  // Auto-shift tone based on disability profile
  const getTone = () => {
    // Extract condition names from ConditionSelection objects
    const conditionNames = selectedConditions.flatMap(c => c.conditions);
    // Extract symptom names from SymptomMapping objects
    const symptomNames = selectedSymptoms.flatMap(s => s.symptoms);

    if (symptomNames.some(s => s.toLowerCase().includes('panic')) || symptomNames.some(s => s.toLowerCase().includes('anxiety'))) return 'calming';
    if (conditionNames.some(c => c.toLowerCase().includes('autism'))) return 'literal';
    if (conditionNames.some(c => c.toLowerCase().includes('cptsd') || c.toLowerCase().includes('ptsd'))) return 'gentle';
    if (conditionNames.some(c => c.toLowerCase().includes('adhd'))) return 'direct';

    return 'neutral';
  };

  const tone = getTone();

  const getStatusText = () => {
    switch (status) {
      case 'listening': return "I'm listening…";
      case 'speaking': return "Just a sec…";
      case 'thinking': return "Let me think…";
      default: return message || "I'm here.";
    }
  };

  const toneStyles: Record<string, string> = {
    neutral: 'text-foreground/80',
    gentle: 'text-foreground/70 italic',
    literal: 'text-foreground font-semibold',
    calming: 'text-foreground/60',
    direct: 'text-foreground/90 font-medium',
  };

  const currentStatus = isSpeaking ? 'speaking' : status;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* SAI Avatar */}
      <div className="relative">
        {/* Breathing glow */}
        <div className={cn(
          'absolute inset-0 rounded-full bg-primary/30 blur-xl transition-all duration-1000',
          currentStatus === 'speaking' ? 'scale-150 opacity-60' : 
          currentStatus === 'listening' ? 'scale-125 opacity-50 animate-pulse' :
          currentStatus === 'thinking' ? 'scale-110 opacity-40' :
          'scale-100 opacity-40 animate-breathe'
        )} />
        
        {/* Avatar circle */}
        <div className={cn(
          'relative w-24 h-24 rounded-full flex items-center justify-center',
          'bg-gradient-to-br from-primary/40 to-primary/20',
          'border-2 border-primary/50 shadow-lg shadow-primary/20',
          'transition-all duration-300',
          currentStatus === 'speaking' && 'border-primary scale-110',
          currentStatus === 'listening' && 'border-primary/70 scale-105'
        )}>
          <Sparkles className={cn(
            'w-10 h-10 text-primary transition-all duration-300',
            currentStatus === 'speaking' && 'animate-pulse',
            currentStatus === 'thinking' && 'animate-spin-slow'
          )} />
        </div>

        {/* Status indicator */}
        {currentStatus !== 'idle' && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full bg-primary',
                  currentStatus === 'speaking' && 'animate-bounce',
                  currentStatus === 'listening' && 'animate-pulse',
                  currentStatus === 'thinking' && 'animate-ping'
                )}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* SAI Name */}
      <span className="text-lg font-display font-semibold text-foreground">
        {saiName}
      </span>

      {/* Status/Message panel */}
      <div className="w-full max-w-sm p-4 bg-card/40 border border-border/30 rounded-xl shadow-inner backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className={cn('text-sm flex-1', toneStyles[tone])}>
            {getStatusText()}
          </p>

          {onVoiceToggle && (
            <button
              onClick={() => onVoiceToggle(!voiceOn)}
              className={cn(
                'p-2 rounded-lg border transition-all duration-200',
                voiceOn 
                  ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30' 
                  : 'bg-background/40 border-border/30 text-muted-foreground hover:bg-background/60'
              )}
              aria-label={voiceOn ? 'Turn off voice' : 'Turn on voice'}
            >
              {voiceOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
