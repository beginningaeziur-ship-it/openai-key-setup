import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Phone, UserPlus, Building, HeartHandshake, Heart, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

interface EmergencyContactSetupProps {
  onComplete: (contact: { nickname: string; phone: string } | null, alternative?: string) => void;
  onBack?: () => void;
}

type ContactOption = 'add' | 'none' | 'alternative';

export const EmergencyContactSetup: React.FC<EmergencyContactSetupProps> = ({
  onComplete,
}) => {
  const [option, setOption] = useState<ContactOption | null>(null);
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [alternative, setAlternative] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasSpokeIntro, setHasSpokeIntro] = useState(false);
  
  const { speak, stopSpeaking, isSpeaking, voiceEnabled, setVoiceEnabled } = useVoiceSettings();
  const { isMicEnabled, isListening, lastTranscript, enableMicrophone, clearTranscript } = useMicrophone();

  const introScript = "Now, choose your emergency contact. If you ever go silent or something feels wrong, I will reach out to check on you. You can add someone, use a hotline, or skip this for now.";

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(async () => {
      if (voiceEnabled && !hasSpokeIntro) {
        setHasSpokeIntro(true);
        await speak(introScript);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  // Handle voice input
  useEffect(() => {
    if (lastTranscript) {
      const lower = lastTranscript.toLowerCase();
      
      if (lower.includes('add') || lower.includes('someone') || lower.includes('contact')) {
        setOption('add');
        speak("Okay, tell me their nickname and phone number.");
      } else if (lower.includes('hotline') || lower.includes('shelter') || lower.includes('alternative')) {
        setOption('alternative');
        speak("Good choice. What hotline or service should I use?");
      } else if (lower.includes('none') || lower.includes('skip') || lower.includes("don't have")) {
        setOption('none');
        speak("That's okay. We can add one later when you're ready.");
      }
      
      clearTranscript();
    }
  }, [lastTranscript, clearTranscript, speak]);

  const handleOptionSelect = async (opt: ContactOption) => {
    setOption(opt);
    if (voiceEnabled) {
      if (opt === 'add') {
        await speak("Okay, enter their nickname and phone number.");
      } else if (opt === 'alternative') {
        await speak("Good choice. Enter the hotline or service name.");
      } else {
        await speak("That's okay. We can build your support network later, together.");
      }
    }
  };

  const handleContinue = async () => {
    if (option === 'add' && nickname.trim() && phone.trim()) {
      if (voiceEnabled) await speak("Got it. I'll remember them.");
      onComplete({ nickname: nickname.trim(), phone: phone.trim() });
    } else if (option === 'alternative' && alternative.trim()) {
      if (voiceEnabled) await speak("Saved. Moving on.");
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

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden",
        "transition-opacity duration-700",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${comfortOfficeBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/45" />

      {/* Top controls */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {voiceEnabled ? (
              <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
            ) : (
              <VolumeX className="w-5 h-5 text-white/50" />
            )}
          </button>
          <button
            onClick={!isMicEnabled ? enableMicrophone : undefined}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
          >
            {isMicEnabled ? (
              <Mic className={cn("w-5 h-5", isListening ? "text-emerald-400 animate-pulse" : "text-white/80")} />
            ) : (
              <MicOff className="w-5 h-5 text-white/50" />
            )}
          </button>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md border border-white/10 text-white/70">
          {isSpeaking ? "SAI speaking..." : isListening ? "Listening..." : "Ready"}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto py-4">
        {/* SAI Avatar */}
        <div className="relative mb-4 flex-shrink-0">
          <div 
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              isSpeaking ? "opacity-100 scale-150" : "opacity-40 scale-125"
            )}
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
              filter: 'blur(25px)',
            }}
          />
          <div className={cn(
            "relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/60 to-primary/30",
            "flex items-center justify-center border-2 border-primary/40",
            isSpeaking && "animate-pulse"
          )}>
            <Heart className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Options Card */}
        <div className="w-full max-w-xs bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-white text-sm font-medium">Emergency Contact</span>
          </div>

          {/* Add contact option */}
          <button
            onClick={() => handleOptionSelect('add')}
            className={cn(
              "w-full p-3 rounded-xl border transition-all text-left",
              option === 'add' 
                ? "border-primary bg-primary/20" 
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <UserPlus className="w-4 h-4 text-primary" />
              <span className="text-white text-sm">Add someone</span>
            </div>
          </button>

          {option === 'add' && (
            <div className="space-y-2 animate-fade-in">
              <Input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Their nickname"
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm"
                maxLength={20}
              />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm"
              />
            </div>
          )}

          {/* Alternative option */}
          <button
            onClick={() => handleOptionSelect('alternative')}
            className={cn(
              "w-full p-3 rounded-xl border transition-all text-left",
              option === 'alternative' 
                ? "border-primary bg-primary/20" 
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-amber-400" />
              <span className="text-white text-sm">Use a hotline instead</span>
            </div>
          </button>

          {option === 'alternative' && (
            <Input
              type="text"
              value={alternative}
              onChange={(e) => setAlternative(e.target.value)}
              placeholder="Hotline or service name"
              className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm animate-fade-in"
            />
          )}

          {/* No contact option */}
          <button
            onClick={() => handleOptionSelect('none')}
            className={cn(
              "w-full p-3 rounded-xl border transition-all text-left",
              option === 'none' 
                ? "border-primary bg-primary/20" 
                : "border-white/10 bg-white/5 hover:bg-white/10"
            )}
          >
            <div className="flex items-center gap-3">
              <HeartHandshake className="w-4 h-4 text-white/60" />
              <span className="text-white text-sm">Skip for now</span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom action */}
      <div className="relative z-10 p-4 pb-6">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full max-w-xs mx-auto h-12 rounded-xl shadow-lg shadow-primary/30 block"
          disabled={!isValid()}
        >
          Continue
        </Button>
        <p className="text-white/40 text-xs text-center mt-2">
          Stays on your device
        </p>
      </div>
    </div>
  );
};
