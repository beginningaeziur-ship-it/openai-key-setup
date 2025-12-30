import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSAI } from "@/contexts/SAIContext";
import { useMicrophone } from "@/contexts/MicrophoneContext";
import { LogoSplash } from "@/components/onboarding/LogoSplash";

/**
 * Index - Entry point
 * 
 * Flow:
 * 1. Logo splash (30 seconds with cinematic music)
 * 2. → Waiting Room (SAI appears for first time)
 * 
 * RULES:
 * - Logo NEVER shows with SAI
 * - SAI appears only after logo unmounts
 * - No SAI service dog visibility until Waiting Room screen
 */

const Index = () => {
  const navigate = useNavigate();
  const { onboarding } = useSAI();
  const { enableMicrophone, isSupported } = useMicrophone();
  
  const [showSplash, setShowSplash] = useState(() => {
    // Skip splash if already seen this session or onboarding complete
    const splashSeen = sessionStorage.getItem('splash_seen');
    if (splashSeen || onboarding.completed) return false;
    return true;
  });

  useEffect(() => {
    // If onboarding is complete, go to main app
    if (onboarding.completed) {
      navigate("/sai-home", { replace: true });
    }
  }, [onboarding.completed, navigate]);

  const handleSplashComplete = async () => {
    sessionStorage.setItem('splash_seen', 'true');
    
    // Enable microphone before proceeding
    if (isSupported) {
      await enableMicrophone();
    }
    
    // Navigate to waiting room where SAI appears
    navigate('/onboarding/waiting-room', { replace: true });
  };

  // Show logo splash
  if (showSplash) {
    return <LogoSplash onComplete={handleSplashComplete} />;
  }

  // If splash already seen, redirect to waiting room
  useEffect(() => {
    if (!showSplash && !onboarding.completed) {
      navigate('/onboarding/waiting-room', { replace: true });
    }
  }, [showSplash, onboarding.completed, navigate]);

  // Loading state
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
      </div>
    </div>
  );
};

export default Index;
