import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Phone, Heart } from 'lucide-react';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * SafetyPlan - Notebook paper on desk
 * 
 * Simple checklist with minimal fill-ins
 * SAI voice narrates but is not visually present
 */

const SAI_NARRATION = [
  "Now let's create your safety plan. This is a simple checklist — not a contract, just a reference for difficult moments.",
  "Check what you already have in place, and fill in a few key details.",
];

export default function SafetyPlan() {
  const navigate = useNavigate();
  const { speak, voiceEnabled } = useVoiceSettings();
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [narrationText, setNarrationText] = useState('');
  const [isNarrating, setIsNarrating] = useState(true);
  
  // Track which narrations we've already spoken
  const hasSpokenRef = useRef<Set<number>>(new Set());
  
  // Checklist items
  const [hasCalmedBefore, setHasCalmedBefore] = useState(false);
  const [hasDistraction, setHasDistraction] = useState(false);
  const [hasSafePlace, setHasSafePlace] = useState(false);
  const [hasContact, setHasContact] = useState(false);
  const [hasProfessional, setHasProfessional] = useState(false);
  
  // Fill-ins
  const [calmingActivity, setCalmingActivity] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [safeLocation, setSafeLocation] = useState('');

  useEffect(() => {
    const text = SAI_NARRATION[narrationIndex];
    if (!text) return;
    
    let charIndex = 0;
    setIsNarrating(true);
    setNarrationText('');
    
    // Speak the narration if voice enabled and not already spoken
    if (voiceEnabled && !hasSpokenRef.current.has(narrationIndex)) {
      hasSpokenRef.current.add(narrationIndex);
      speak(text);
    }

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setNarrationText(text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsNarrating(false);
        
        if (narrationIndex < SAI_NARRATION.length - 1) {
          setTimeout(() => setNarrationIndex(prev => prev + 1), 1500);
        }
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [narrationIndex, speak, voiceEnabled]);

  const handleContinue = () => {
    navigate('/onboarding/exit');
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${comfortOfficeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="relative z-10 w-full max-w-2xl">
        {/* SAI narration */}
        <div className="bg-card/80 backdrop-blur-sm rounded-t-xl p-4 border-x border-t border-border/50">
          <p className="text-sm text-muted-foreground italic text-center min-h-[40px]">
            {narrationText}
            {isNarrating && <span className="animate-pulse">|</span>}
          </p>
        </div>

        {/* Paper */}
        <div 
          className="bg-amber-50 dark:bg-amber-100/90 rounded-b-xl p-6 shadow-2xl"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #91d1d3 28px)',
            backgroundPosition: '0 10px',
          }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            My Safety Plan
          </h2>

          <div className="space-y-5">
            {/* Checklist items */}
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasCalmedBefore}
                onCheckedChange={(checked) => setHasCalmedBefore(!!checked)}
                className="mt-1 border-gray-400"
              />
              <div className="flex-1">
                <span className="text-gray-800">I have something that helps me calm down</span>
                {hasCalmedBefore && (
                  <Input 
                    placeholder="What helps? (e.g., deep breathing, music)"
                    value={calmingActivity}
                    onChange={(e) => setCalmingActivity(e.target.value)}
                    className="mt-2 bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-500"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasDistraction}
                onCheckedChange={(checked) => setHasDistraction(!!checked)}
                className="mt-1 border-gray-400"
              />
              <span className="text-gray-800">I have healthy distractions I can use</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasSafePlace}
                onCheckedChange={(checked) => setHasSafePlace(!!checked)}
                className="mt-1 border-gray-400"
              />
              <div className="flex-1">
                <span className="text-gray-800">I have a safe place I can go</span>
                {hasSafePlace && (
                  <Input 
                    placeholder="Where? (optional)"
                    value={safeLocation}
                    onChange={(e) => setSafeLocation(e.target.value)}
                    className="mt-2 bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-500"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasContact}
                onCheckedChange={(checked) => setHasContact(!!checked)}
                className="mt-1 border-gray-400"
              />
              <div className="flex-1">
                <span className="text-gray-800">I have someone I can call for support</span>
                {hasContact && (
                  <Input 
                    placeholder="Name or phone (optional)"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="mt-2 bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-500"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasProfessional}
                onCheckedChange={(checked) => setHasProfessional(!!checked)}
                className="mt-1 border-gray-400"
              />
              <span className="text-gray-800">I have access to professional help if needed</span>
            </label>
          </div>

          {/* Crisis resources */}
          <div className="mt-8 p-4 bg-white/60 rounded-lg">
            <div className="flex items-center gap-2 text-gray-700 text-sm font-medium mb-2">
              <Phone className="w-4 h-4" />
              24/7 Crisis Resources
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>988</strong> — Suicide & Crisis Lifeline</p>
              <p><strong>741741</strong> — Crisis Text Line (text HOME)</p>
              <p><strong>911</strong> — Emergency services</p>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleContinue} disabled={isNarrating && narrationIndex < SAI_NARRATION.length - 1}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
