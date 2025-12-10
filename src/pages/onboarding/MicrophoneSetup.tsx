import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { cn } from '@/lib/utils';

export default function MicrophoneSetup() {
  const navigate = useNavigate();
  const { isMicEnabled, enableMicrophone } = useMicrophone();
  const [permissionState, setPermissionState] = useState<'idle' | 'granted' | 'denied'>(
    isMicEnabled ? 'granted' : 'idle'
  );

  const handleEnableMic = async () => {
    try {
      const granted = await enableMicrophone();
      setPermissionState(granted ? 'granted' : 'denied');
    } catch {
      setPermissionState('denied');
    }
  };

  const handleContinue = () => {
    navigate('/onboarding/privacy');
  };

  const narration = 
    "The microphone lets us have real conversations. You can speak to me, and I'll listen and respond. " +
    "You're always in control. You can mute at any time with one tap. " +
    "Your audio is processed safely and is not stored long-term. " +
    "If you're not ready, you can skip this and type instead.";

  return (
    <OnboardingScreen
      screenId="mic-setup"
      title="Voice Conversation"
      narration={narration}
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full space-y-8">
        {/* Icon */}
        <div className={cn(
          'w-24 h-24 rounded-full flex items-center justify-center transition-all',
          permissionState === 'granted' 
            ? 'bg-green-500/20' 
            : permissionState === 'denied'
            ? 'bg-destructive/20'
            : 'bg-primary/20'
        )}>
          {permissionState === 'granted' ? (
            <Mic className="w-12 h-12 text-green-500" />
          ) : permissionState === 'denied' ? (
            <MicOff className="w-12 h-12 text-destructive" />
          ) : (
            <Mic className="w-12 h-12 text-primary" />
          )}
        </div>

        {/* Explanation */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            {permissionState === 'granted' 
              ? 'Microphone Enabled!' 
              : permissionState === 'denied'
              ? 'Microphone Blocked'
              : 'Enable Voice?'}
          </h2>
          <p className="text-muted-foreground">
            {permissionState === 'granted' 
              ? "We can now have voice conversations. You can mute anytime."
              : permissionState === 'denied'
              ? "No problem. You can type to communicate instead, or enable it later in settings."
              : "Talk to SAI naturally. I'll listen and respond with voice."}
          </p>
        </div>

        {/* Privacy note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
          <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Your privacy matters.</strong> Audio is processed in real-time and not stored. 
            You can mute at any time with one tap.
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-3">
          {permissionState === 'idle' && (
            <>
              <Button 
                onClick={handleEnableMic}
                className="w-full h-12"
              >
                <Mic className="mr-2 h-5 w-5" />
                Enable Microphone
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleContinue}
                className="w-full text-muted-foreground"
              >
                Not now — I'll type instead
              </Button>
            </>
          )}

          {(permissionState === 'granted' || permissionState === 'denied') && (
            <Button 
              onClick={handleContinue}
              className="w-full h-12"
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </OnboardingScreen>
  );
}
