import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Phone, Heart, Volume2, VolumeX } from 'lucide-react';
import { useSpeakThenListen } from '@/hooks/useSpeakThenListen';
import { cn } from '@/lib/utils';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * SafetyPlan - Notebook paper on desk
 * 
 * SAI voice narrates but is not visually present
 * No mic needed - user fills in form
 */

const SAI_NARRATION = [
  "Now let's create your safety plan. This is a simple checklist — not a contract, just a reference for difficult moments.",
  "Check what you already have in place, and fill in a few key details.",
];

export default function SafetyPlan() {
  const navigate = useNavigate();
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [narrationText, setNarrationText] = useState('');
  const [isNarrating, setIsNarrating] = useState(true);
  
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

  const {
    isSpeaking,
    voiceEnabled,
    speakOnly,
    stopSpeaking,
    setVoiceEnabled,
  } = useSpeakThenListen();

  useEffect(() => {
    const text = SAI_NARRATION[narrationIndex];
    if (!text) return;
    
    let charIndex = 0;
    setIsNarrating(true);
    setNarrationText('');
    
    // Speak the narration if voice enabled and not already spoken
    if (voiceEnabled && !hasSpokenRef.current.has(narrationIndex)) {
      hasSpokenRef.current.add(narrationIndex);
      speakOnly(text);
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
  }, [narrationIndex, speakOnly, voiceEnabled]);

  const handleContinue = () => {
    stopSpeaking();
    navigate('/onboarding/exit');
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-2 sm:p-4"
      style={{
        backgroundImage: `url(${comfortOfficeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Voice control */}
      <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
        <button
          onClick={toggleVoice}
          className={cn(
            "p-2 rounded-full transition-all",
            "bg-black/40 backdrop-blur-md border border-white/10",
            "hover:bg-black/60",
            isSpeaking && "ring-2 ring-primary/50"
          )}
        >
          {voiceEnabled ? (
            <Volume2 className={cn("w-4 h-4 sm:w-5 sm:h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
          )}
        </button>
      </div>
      
      <div className="relative z-10 w-full max-w-2xl flex flex-col max-h-[calc(100vh-1rem)]">
        {/* SAI narration */}
        <div className="bg-card/80 backdrop-blur-sm rounded-t-xl p-3 border-x border-t border-border/50 sm:p-4 flex-shrink-0">
          <p className="text-xs text-muted-foreground italic text-center sm:text-sm">
            {narrationText}
            {isSpeaking && <span className="animate-pulse">|</span>}
          </p>
        </div>

        {/* Paper */}
        <div 
          className="bg-amber-50 dark:bg-amber-100/90 rounded-b-xl p-4 shadow-2xl overflow-y-auto sm:p-6"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #91d1d3 28px)',
            backgroundPosition: '0 10px',
          }}
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 sm:text-xl sm:mb-6">
            <Heart className="w-5 h-5 text-rose-500" />
            My Safety Plan
          </h2>

          <div className="space-y-3 sm:space-y-5">
            {/* Checklist items */}
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasCalmedBefore}
                onCheckedChange={(checked) => setHasCalmedBefore(!!checked)}
                className="mt-0.5 border-gray-400"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-800 sm:text-base">I have something that helps me calm down</span>
                {hasCalmedBefore && (
                  <Input 
                    placeholder="What helps? (e.g., deep breathing, music)"
                    value={calmingActivity}
                    onChange={(e) => setCalmingActivity(e.target.value)}
                    className="mt-1.5 bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-500 text-sm sm:mt-2"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasDistraction}
                onCheckedChange={(checked) => setHasDistraction(!!checked)}
                className="mt-0.5 border-gray-400"
              />
              <span className="text-sm text-gray-800 sm:text-base">I have healthy distractions I can use</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasSafePlace}
                onCheckedChange={(checked) => setHasSafePlace(!!checked)}
                className="mt-0.5 border-gray-400"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-800 sm:text-base">I have a safe place I can go</span>
                {hasSafePlace && (
                  <Input 
                    placeholder="Where? (optional)"
                    value={safeLocation}
                    onChange={(e) => setSafeLocation(e.target.value)}
                    className="mt-1.5 bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-500 text-sm sm:mt-2"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasContact}
                onCheckedChange={(checked) => setHasContact(!!checked)}
                className="mt-0.5 border-gray-400"
              />
              <div className="flex-1">
                <span className="text-sm text-gray-800 sm:text-base">I have someone I can call for support</span>
                {hasContact && (
                  <Input 
                    placeholder="Name or phone (optional)"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="mt-1.5 bg-white/80 border-gray-300 text-gray-800 placeholder:text-gray-500 text-sm sm:mt-2"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox 
                checked={hasProfessional}
                onCheckedChange={(checked) => setHasProfessional(!!checked)}
                className="mt-0.5 border-gray-400"
              />
              <span className="text-sm text-gray-800 sm:text-base">I have access to professional help if needed</span>
            </label>
          </div>

          {/* Crisis resources */}
          <div className="mt-4 p-3 bg-white/60 rounded-lg sm:mt-8 sm:p-4">
            <div className="flex items-center gap-2 text-gray-700 text-xs font-medium mb-1.5 sm:text-sm sm:mb-2">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              24/7 Crisis Resources
            </div>
            <div className="text-xs text-gray-600 space-y-0.5 sm:space-y-1">
              <p><strong>988</strong> — Suicide & Crisis Lifeline</p>
              <p><strong>741741</strong> — Crisis Text Line (text HOME)</p>
              <p><strong>911</strong> — Emergency services</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 sm:pt-6">
            <Button 
              onClick={handleContinue} 
              disabled={isNarrating && narrationIndex < SAI_NARRATION.length - 1}
              className="h-10 text-sm sm:h-11 sm:text-base"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
