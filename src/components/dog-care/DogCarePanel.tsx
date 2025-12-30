import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useServiceDog, NeedLevels } from '@/contexts/ServiceDogContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { 
  UtensilsCrossed, 
  Droplets, 
  TreePine, 
  Moon,
  Heart,
  Sparkles
} from 'lucide-react';
import { SaiNeed } from '@/lib/saiPersonalitySpec';

interface DogCarePanelProps {
  open: boolean;
  onClose: () => void;
}

interface CareAction {
  need: SaiNeed;
  label: string;
  icon: typeof UtensilsCrossed;
  praise: string;
  selfCareReminder: string;
}

const CARE_ACTIONS: CareAction[] = [
  {
    need: 'food',
    label: 'Feed',
    icon: UtensilsCrossed,
    praise: "Mmm, thank you. That hits the spot.",
    selfCareReminder: "Have you eaten something nourishing today?"
  },
  {
    need: 'water',
    label: 'Water',
    icon: Droplets,
    praise: "Ahh, refreshing. Thank you.",
    selfCareReminder: "Remember to hydrate yourself too."
  },
  {
    need: 'movement',
    label: 'Outside',
    icon: TreePine,
    praise: "That fresh air felt wonderful.",
    selfCareReminder: "Could you use some fresh air today?"
  },
  {
    need: 'rest',
    label: 'Rest',
    icon: Moon,
    praise: "A little rest goes a long way.",
    selfCareReminder: "Are you giving yourself permission to rest?"
  },
  {
    need: 'attention',
    label: 'Pet',
    icon: Heart,
    praise: "*happy tail wag* That felt so good.",
    selfCareReminder: "You deserve gentle care too."
  }
];

export function DogCarePanel({ open, onClose }: DogCarePanelProps) {
  const { dogState, fulfillNeed, getNeedPrompt } = useServiceDog();
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();
  const { userProfile } = useSAI();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  const [lastAction, setLastAction] = useState<string | null>(null);

  const getNeedLevel = (need: SaiNeed): number => {
    return dogState.needLevels[need] || 70;
  };

  const getNeedColor = (level: number): string => {
    if (level >= 70) return 'bg-emerald-500';
    if (level >= 40) return 'bg-amber-500';
    return 'bg-rose-400';
  };

  const handleCareAction = useCallback(async (action: CareAction) => {
    fulfillNeed(action.need);
    setLastAction(action.need);
    
    if (voiceEnabled) {
      await speak(action.praise);
      // Wait a moment, then give self-care reminder
      setTimeout(async () => {
        await speak(action.selfCareReminder);
      }, 1500);
    }
  }, [fulfillNeed, voiceEnabled, speak]);

  // Find lowest need for gentle suggestion
  const lowestNeed = Object.entries(dogState.needLevels).reduce<{ need: SaiNeed; level: number } | null>(
    (lowest, [need, level]) => {
      if (!lowest || level < lowest.level) {
        return { need: need as SaiNeed, level };
      }
      return lowest;
    },
    null
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Care for {saiName}
          </SheetTitle>
        </SheetHeader>

        {/* Gentle suggestion if a need is low */}
        {lowestNeed && lowestNeed.level < 40 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-foreground">
              {getNeedPrompt(lowestNeed.need)}
            </p>
          </div>
        )}

        {/* Care action buttons */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {CARE_ACTIONS.map((action) => {
            const Icon = action.icon;
            const level = getNeedLevel(action.need);
            const isRecent = lastAction === action.need;
            
            return (
              <button
                key={action.need}
                onClick={() => handleCareAction(action)}
                disabled={isSpeaking}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                  "hover:bg-muted/50 active:scale-95",
                  isRecent && "ring-2 ring-primary"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6",
                  level < 40 ? "text-amber-500" : "text-foreground/70"
                )} />
                <span className="text-xs font-medium">{action.label}</span>
                
                {/* Need level bar */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", getNeedColor(level))}
                    style={{ width: `${level}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Praise message */}
        {lastAction && (
          <div className="text-center text-sm text-muted-foreground mb-4 animate-fade-in">
            {CARE_ACTIONS.find(a => a.need === lastAction)?.praise}
          </div>
        )}

        {/* Reassurance */}
        <p className="text-center text-xs text-muted-foreground">
          No pressure. {saiName} understands if you forget sometimes. 
          What matters is that you're here now.
        </p>
      </SheetContent>
    </Sheet>
  );
}
