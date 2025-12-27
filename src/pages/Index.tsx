import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSAI } from "@/contexts/SAIContext";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { LogoSplash } from "@/components/onboarding/LogoSplash";
import { SAIAnchoredLayout } from "@/components/onboarding/SAIAnchoredLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Eye, EyeOff, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceSettings } from "@/contexts/VoiceSettingsContext";

/**
 * Onboarding Flow - HARD LOCKED ORDER (from UI Spec)
 * 
 * 1. Logo (alone) → then unmounts
 * 2. SAI appears and introduces self (SAI visible first, no overlap)
 * 3. Nickname, PIN, Emergency (SAI always visible, forms are overlays)
 * 4. → Navigate to WHO assessment
 * 
 * RULES:
 * - Logo NEVER shows with SAI
 * - SAI is ALWAYS visible when present
 * - Forms are overlays, not replacements
 */

type OnboardingPhase = 
  | 'splash' 
  | 'sai-intro'
  | 'nickname'
  | 'safety-pin'
  | 'emergency-contact'
  | 'complete';

const Index = () => {
  const navigate = useNavigate();
  const { onboarding, setUserProfile } = useSAI();
  const { enableMicrophone, isSupported } = useMicrophone();
  const { speak, voiceEnabled } = useVoiceSettings();
  
  const [phase, setPhase] = useState<OnboardingPhase>(() => {
    if (onboarding.completed) return 'complete';
    const introSeen = localStorage.getItem('sai_intro_seen');
    return introSeen ? 'nickname' : 'splash';
  });

  // Form states
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [pinError, setPinError] = useState('');
  const [emergencyNickname, setEmergencyNickname] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [skipEmergency, setSkipEmergency] = useState(false);

  // SAI messages for each phase - SAI speaks first, introduces what comes next
  const saiMessages: Record<OnboardingPhase, string> = {
    'splash': '',
    'sai-intro': "I'm SAI — your service dog companion. I'll walk with you through every step. We go at your pace. You lead, I walk beside you.",
    'nickname': "What should I call you? Pick a name you feel safe with.",
    'safety-pin': pinStep === 'enter' 
      ? "Let's protect your space. Choose 4 numbers so no one else can see what we're working on."
      : "Good. Enter those numbers again to confirm.",
    'emergency-contact': "If things ever get heavy, is there someone I should know about? This is completely optional.",
    'complete': '',
  };

  useEffect(() => {
    if (phase === 'complete' || onboarding.completed) {
      navigate("/onboarding/categories", { replace: true });
    }
  }, [phase, onboarding.completed, navigate]);

  // Speak SAI's message when phase changes (SAI speaks first)
  useEffect(() => {
    if (phase !== 'splash' && phase !== 'complete' && voiceEnabled && saiMessages[phase]) {
      speak(saiMessages[phase]);
    }
  }, [phase, voiceEnabled, pinStep]);

  const handleSplashComplete = async () => {
    // Logo is done, now SAI can appear
    if (isSupported) {
      await enableMicrophone();
    }
    localStorage.setItem('sai_intro_seen', 'true');
    setPhase('sai-intro');
  };

  const handleSaiIntroContinue = () => {
    setPhase('nickname');
  };

  const handleNicknameContinue = () => {
    if (nickname.trim().length < 1) return;
    setPhase('safety-pin');
  };

  const handlePinContinue = async () => {
    if (pinStep === 'enter') {
      if (pin.length !== 4) {
        setPinError('Enter 4 numbers');
        return;
      }
      setPinStep('confirm');
      setPinError('');
    } else {
      if (confirmPin !== pin) {
        setPinError("Those don't match. Try again.");
        setConfirmPin('');
        return;
      }
      localStorage.setItem('sai_safety_pin', pin);
      setPhase('emergency-contact');
    }
  };

  const handleEmergencyContinue = () => {
    setUserProfile({
      nickname: nickname.trim(),
      saiNickname: 'SAI',
      voicePreference: 'nova',
      voiceMode: 'on',
      emergencyContact: skipEmergency 
        ? { nickname: '', phone: '' }
        : { nickname: emergencyNickname.trim(), phone: emergencyPhone.trim() },
    });
    navigate('/onboarding/categories', { replace: true });
  };

  // SPLASH: Logo only, SAI NOT visible
  if (phase === 'splash') {
    return <LogoSplash onComplete={handleSplashComplete} />;
  }

  // SAI INTRO: SAI appears first, speaks, then button
  if (phase === 'sai-intro') {
    return (
      <SAIAnchoredLayout saiMessage={saiMessages[phase]} saiState="speaking" showOverlay={true}>
        <div className="flex-1 flex flex-col items-center justify-end pb-8">
          <Button
            onClick={handleSaiIntroContinue}
            size="lg"
            className="w-full max-w-xs h-12 rounded-xl shadow-lg shadow-primary/30"
          >
            I'm ready
          </Button>
          <p className="text-white/40 text-xs text-center mt-3">
            Say "ready" or tap the button
          </p>
        </div>
      </SAIAnchoredLayout>
    );
  }

  // NICKNAME: SAI visible + form overlay
  if (phase === 'nickname') {
    return (
      <SAIAnchoredLayout saiMessage={saiMessages[phase]} saiState="attentive" showOverlay={true}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <span className="text-white font-medium">Your Name</span>
            </div>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="What should I call you?"
              className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/40"
              autoFocus
            />
            <p className="text-white/50 text-xs mt-3">
              This can be a nickname, first name, or anything you'd like
            </p>
          </div>
        </div>
        <div className="pb-6">
          <Button
            onClick={handleNicknameContinue}
            size="lg"
            disabled={nickname.trim().length < 1}
            className="w-full h-12 rounded-xl shadow-lg shadow-primary/30"
          >
            Continue
          </Button>
        </div>
      </SAIAnchoredLayout>
    );
  }

  // SAFETY PIN: SAI visible + form overlay
  if (phase === 'safety-pin') {
    return (
      <SAIAnchoredLayout saiMessage={saiMessages[phase]} saiState="attentive" showOverlay={true}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-white font-medium">
                {pinStep === 'enter' ? 'Set PIN' : 'Confirm PIN'}
              </span>
            </div>
            <div className="relative mb-3">
              <Input
                type={showPin ? 'text' : 'password'}
                value={pinStep === 'enter' ? pin : confirmPin}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (pinStep === 'enter') setPin(cleaned);
                  else setConfirmPin(cleaned);
                  setPinError('');
                }}
                placeholder="• • • •"
                className={cn(
                  "h-14 text-center text-2xl tracking-[0.5em] font-mono",
                  "bg-white/10 border-white/20 text-white placeholder:text-white/30",
                  pinError && "border-red-500/50"
                )}
                maxLength={4}
                inputMode="numeric"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pinError && <p className="text-red-400 text-xs text-center mb-3">{pinError}</p>}
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    (pinStep === 'enter' ? pin : confirmPin).length > i ? "bg-primary" : "bg-white/20"
                  )}
                />
              ))}
            </div>
            <p className="text-white/50 text-xs text-center">
              Stored only on your device
            </p>
          </div>
        </div>
        <div className="pb-6">
          <Button
            onClick={handlePinContinue}
            size="lg"
            disabled={(pinStep === 'enter' ? pin : confirmPin).length !== 4}
            className="w-full h-12 rounded-xl shadow-lg shadow-primary/30"
          >
            {pinStep === 'enter' ? 'Continue' : 'Set PIN'}
          </Button>
        </div>
      </SAIAnchoredLayout>
    );
  }

  // EMERGENCY CONTACT: SAI visible + form overlay
  if (phase === 'emergency-contact') {
    return (
      <SAIAnchoredLayout saiMessage={saiMessages[phase]} saiState="attentive" showOverlay={true}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-white font-medium">Emergency Contact</span>
            </div>
            
            {!skipEmergency ? (
              <>
                <Input
                  value={emergencyNickname}
                  onChange={(e) => setEmergencyNickname(e.target.value)}
                  placeholder="Their name or nickname"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="Phone number"
                  type="tel"
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <button
                  onClick={() => setSkipEmergency(true)}
                  className="text-white/50 text-sm hover:text-white/70 underline"
                >
                  Skip for now
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-white/70 text-sm mb-3">
                  That's okay. You can add this later if you want.
                </p>
                <button
                  onClick={() => setSkipEmergency(false)}
                  className="text-primary text-sm hover:underline"
                >
                  Actually, I want to add someone
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="pb-6">
          <Button
            onClick={handleEmergencyContinue}
            size="lg"
            className="w-full h-12 rounded-xl shadow-lg shadow-primary/30"
          >
            Continue
          </Button>
        </div>
      </SAIAnchoredLayout>
    );
  }

  // Loading/redirect state (should not happen normally)
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
        <p className="text-muted-foreground">Loading SAI...</p>
      </div>
    </div>
  );
};

export default Index;
