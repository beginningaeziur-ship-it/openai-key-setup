import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Phone, UserPlus, AlertCircle, Building, HeartHandshake, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';

interface EmergencyContactSetupProps {
  onComplete: (contact: { nickname: string; phone: string } | null, alternative?: string) => void;
  onBack?: () => void;
}

type ContactOption = 'add' | 'none' | 'alternative';

export const EmergencyContactSetup: React.FC<EmergencyContactSetupProps> = ({
  onComplete,
  onBack,
}) => {
  const [option, setOption] = useState<ContactOption | null>(null);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [alternative, setAlternative] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();

  const explanation = "Next, choose your emergency contact. Just a nickname and a number. If you ever go silent, or something feels wrong, I will reach out and ask them to check on you.";

  useEffect(() => {
    setIsVisible(true);
    if (voiceEnabled) {
      speak(explanation);
    }
  }, []);

  const handleContinue = () => {
    if (option === 'add' && nickname.trim() && phone.trim()) {
      onComplete({ nickname: nickname.trim(), phone: phone.trim() });
    } else if (option === 'alternative' && alternative.trim()) {
      onComplete(null, alternative.trim());
    } else if (option === 'none') {
      onComplete(null);
    }
  };

  const isValid = () => {
    if (option === 'add') return nickname.trim() && phone.trim();
    if (option === 'alternative') return alternative.trim();
    if (option === 'none') return true;
    return false;
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8",
        "bg-gradient-to-b from-[#0d0d1a] via-[#1a1a2e] to-[#0f0f1f]",
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col items-center gap-6 max-w-md mx-4 w-full">
        {/* Icon */}
        <div className={cn(
          "w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center",
          "border border-primary/30 shadow-lg shadow-primary/10",
          isSpeaking && "animate-pulse"
        )}>
          <Phone className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Emergency Contact</h2>
          <p className="text-foreground/70 text-sm max-w-xs leading-relaxed">
            If you ever go silent or something feels wrong, I can reach out to check on you.
          </p>
        </div>

        {/* Options */}
        <div className="w-full max-w-xs space-y-3">
          {/* Add contact option */}
          <button
            onClick={() => setOption('add')}
            className={cn(
              "w-full p-4 rounded-xl border transition-all text-left",
              "bg-card/40 backdrop-blur-sm",
              option === 'add' 
                ? "border-primary bg-primary/10" 
                : "border-border/40 hover:border-border/60"
            )}
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Add a contact</p>
                <p className="text-xs text-muted-foreground">Someone I can reach if needed</p>
              </div>
            </div>
          </button>

          {/* Add contact form */}
          {option === 'add' && (
            <div className="space-y-3 p-4 bg-card/30 rounded-xl border border-border/30 animate-fade-in">
              <Input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Their nickname (e.g., Mom, Friend)"
                className="h-12 bg-background/50 border-border/40 rounded-lg"
                maxLength={20}
              />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="h-12 bg-background/50 border-border/40 rounded-lg"
              />
            </div>
          )}

          {/* Alternative option */}
          <button
            onClick={() => setOption('alternative')}
            className={cn(
              "w-full p-4 rounded-xl border transition-all text-left",
              "bg-card/40 backdrop-blur-sm",
              option === 'alternative' 
                ? "border-primary bg-primary/10" 
                : "border-border/40 hover:border-border/60"
            )}
          >
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Use an alternative</p>
                <p className="text-xs text-muted-foreground">Hotline, shelter, or caseworker</p>
              </div>
            </div>
          </button>

          {/* Alternative form */}
          {option === 'alternative' && (
            <div className="p-4 bg-card/30 rounded-xl border border-border/30 animate-fade-in">
              <Input
                type="text"
                value={alternative}
                onChange={(e) => setAlternative(e.target.value)}
                placeholder="Name or number (e.g., Crisis Line)"
                className="h-12 bg-background/50 border-border/40 rounded-lg"
              />
            </div>
          )}

          {/* No contact option */}
          <button
            onClick={() => setOption('none')}
            className={cn(
              "w-full p-4 rounded-xl border transition-all text-left",
              "bg-card/40 backdrop-blur-sm",
              option === 'none' 
                ? "border-primary bg-primary/10" 
                : "border-border/40 hover:border-border/60"
            )}
          >
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">I don't have one</p>
                <p className="text-xs text-muted-foreground">That's okay — we can add one later</p>
              </div>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button
            onClick={handleContinue}
            size="lg"
            className="w-full h-14 rounded-xl text-lg"
            disabled={!isValid()}
          >
            Continue
          </Button>

          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Go back
            </button>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-xs text-muted-foreground/60 text-center max-w-xs">
          This information stays on your device. I only use it in emergencies.
        </p>
      </div>
    </div>
  );
};
