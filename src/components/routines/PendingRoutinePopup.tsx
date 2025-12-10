// Pending Routine Popup - Shows self-start check-ins
import { useEffect, useState } from 'react';
import { useSelfStart } from '@/contexts/SelfStartContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, MessageCircle, Wind, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PendingRoutinePopup() {
  const { pendingRoutines, acknowledgePending, dismissPending } = useSelfStart();
  const { speak, voiceEnabled } = useVoiceSettings();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get first unacknowledged routine
  const unacknowledged = pendingRoutines.filter(p => !p.acknowledged);
  const current = unacknowledged[0];

  useEffect(() => {
    if (current) {
      setVisible(true);
      // Speak the message if voice is enabled
      if (voiceEnabled) {
        speak(current.routine.message);
      }
    } else {
      setVisible(false);
    }
  }, [current, voiceEnabled]);

  const handleAcknowledge = () => {
    if (current) {
      acknowledgePending(current.id);
    }
  };

  const handleDismiss = () => {
    if (current) {
      dismissPending(current.id);
    }
  };

  const handleGrounding = () => {
    if (current) {
      acknowledgePending(current.id);
      // Navigate to grounding or open grounding panel
      window.dispatchEvent(new CustomEvent('open-grounding'));
    }
  };

  if (!visible || !current) return null;

  const isGroundingRelated = ['micro-grounding', 'evening-grounding', 'distress-triggered'].includes(current.routine.type);

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <Card className={cn(
        "shadow-xl border-2",
        current.routine.priority === 'high' ? 'border-destructive/50' : 'border-primary/30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-full",
              current.routine.priority === 'high' ? 'bg-destructive/10' : 'bg-primary/10'
            )}>
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-3">
                {current.routine.message}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleAcknowledge}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  I'm okay
                </Button>
                
                {isGroundingRelated && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleGrounding}
                    className="flex-1"
                  >
                    <Wind className="w-4 h-4 mr-1" />
                    Ground me
                  </Button>
                )}
              </div>
            </div>
            
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 -mt-1 -mr-1 h-8 w-8"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {unacknowledged.length > 1 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              +{unacknowledged.length - 1} more pending
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
