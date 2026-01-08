import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSAI } from "@/contexts/SAIContext";
import { LogoSplash } from "@/components/onboarding/LogoSplash";
import { persistence, getAppLaunchRoute } from "@/lib/persistence";

/**
 * Index - Entry point
 * 
 * AEZUIR RULES:
 * - Users must NOT restart onboarding every time they open the app
 * - Users must NOT lose progress between sessions
 * - Overwhelmed users must be able to skip onboarding and still access Safe House
 * 
 * Flow:
 * 1. Check persistent memory for resume point
 * 2. If first launch → Logo splash → Waiting Room
 * 3. If returning → Resume from checkpoint
 */

const Index = () => {
  const navigate = useNavigate();
  const { onboarding } = useSAI();
  
  const [showSplash, setShowSplash] = useState(() => {
    // Skip splash if already seen this session OR has any saved progress
    const splashSeen = sessionStorage.getItem('splash_seen');
    const hasProgress = persistence.getHasCompletedOnboarding() || 
                       persistence.getOnboardingSkipped() ||
                       persistence.getOnboardingCheckpoint() ||
                       persistence.getHasSetPIN();
    
    if (splashSeen || hasProgress) return false;
    return true;
  });

  // On mount, check if we should immediately redirect based on saved state
  useEffect(() => {
    if (!showSplash) {
      const route = getAppLaunchRoute();
      navigate(route, { replace: true });
    }
  }, [showSplash, navigate]);

  const handleSplashComplete = async () => {
    sessionStorage.setItem('splash_seen', 'true');
    
    // AEZUIR RULE: Voice/mic disabled by default during onboarding
    // Mic is NOT enabled until user explicitly enables it in Safe House
    
    // Save checkpoint
    persistence.setOnboardingCheckpoint('waiting-room');
    
    // Navigate to waiting room where SAI appears
    navigate('/onboarding/waiting-room', { replace: true });
  };

  // Show logo splash for first-time users
  if (showSplash) {
    return <LogoSplash onComplete={handleSplashComplete} />;
  }

  // Loading state while redirect happens
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 animate-pulse" />
      </div>
    </div>
  );
};

export default Index;
