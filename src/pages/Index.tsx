import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSAI } from "@/contexts/SAIContext";
import { LogoSplash } from "@/components/onboarding/LogoSplash";
import { SAIArrival } from "@/components/onboarding/SAIArrival";
import { OnboardingExplanation } from "@/components/onboarding/OnboardingExplanation";
import { SafetyPinSetup } from "@/components/onboarding/SafetyPinSetup";
import { NicknameSetup } from "@/components/onboarding/NicknameSetup";
import { EmergencyContactSetup } from "@/components/onboarding/EmergencyContactSetup";

type OnboardingPhase = 
  | 'splash' 
  | 'arrival' 
  | 'explanation' 
  | 'pin' 
  | 'nickname' 
  | 'emergency' 
  | 'complete';

const Index = () => {
  const navigate = useNavigate();
  const { onboarding, userProfile, setUserProfile, completeOnboarding } = useSAI();
  
  const [phase, setPhase] = useState<OnboardingPhase>(() => {
    // If already completed, skip to room
    if (onboarding.completed) return 'complete';
    // Check if intro was seen before
    const introSeen = localStorage.getItem('sai_intro_seen');
    return introSeen ? 'pin' : 'splash';
  });

  const [tempPin, setTempPin] = useState('');
  const [tempNickname, setTempNickname] = useState('');

  useEffect(() => {
    if (phase === 'complete' || onboarding.completed) {
      navigate("/sai-room", { replace: true });
    }
  }, [phase, onboarding.completed, navigate]);

  const handleSplashComplete = () => {
    setPhase('arrival');
  };

  const handleArrivalContinue = () => {
    localStorage.setItem('sai_intro_seen', 'true');
    setPhase('explanation');
  };

  const handleExplanationContinue = () => {
    setPhase('pin');
  };

  const handlePinComplete = (pin: string) => {
    setTempPin(pin);
    localStorage.setItem('sai_safety_pin', pin);
    setPhase('nickname');
  };

  const handleNicknameComplete = (nickname: string) => {
    setTempNickname(nickname);
    setPhase('emergency');
  };

  const handleEmergencyComplete = (
    contact: { nickname: string; phone: string } | null,
    alternative?: string
  ) => {
    // Save profile and continue to full onboarding
    setUserProfile({
      nickname: tempNickname,
      saiNickname: 'SAI',
      voicePreference: 'nova',
      voiceMode: 'on',
      emergencyContact: contact || { nickname: '', phone: '' },
    });
    
    // Navigate to rest of onboarding (categories, conditions, etc.)
    navigate('/onboarding/categories', { replace: true });
  };

  // Render based on phase
  if (phase === 'splash') {
    return <LogoSplash onComplete={handleSplashComplete} duration={3500} />;
  }

  if (phase === 'arrival') {
    return (
      <SAIArrival 
        saiName="SAI" 
        userName={tempNickname || 'friend'} 
        onContinue={handleArrivalContinue} 
      />
    );
  }

  if (phase === 'explanation') {
    return <OnboardingExplanation onContinue={handleExplanationContinue} />;
  }

  if (phase === 'pin') {
    return <SafetyPinSetup onComplete={handlePinComplete} />;
  }

  if (phase === 'nickname') {
    return <NicknameSetup onComplete={handleNicknameComplete} />;
  }

  if (phase === 'emergency') {
    return <EmergencyContactSetup onComplete={handleEmergencyComplete} />;
  }

  // Loading/redirect state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 sai-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full sai-gradient-calm sai-breathe" />
        <p className="text-muted-foreground text-lg">Loading SAI...</p>
      </div>
    </div>
  );
};

export default Index;
