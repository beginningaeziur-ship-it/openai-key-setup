import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { Lock, Delete, Eye, EyeOff } from 'lucide-react';
import cozyBedroomBg from '@/assets/cozy-bedroom-bg.jpg';

/**
 * BedroomHome - PIN-protected main home-base
 * 
 * User must enter PIN to access bedroom every time
 * After PIN entry, SAI explains the bedroom as home-base
 */

export default function BedroomHome() {
  const navigate = useNavigate();
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();
  const { userProfile } = useSAI();
  
  const saiName = userProfile?.saiNickname || 'SAI';
  const storedPin = localStorage.getItem('sai_security_pin') || '';
  
  const [phase, setPhase] = useState<'pin' | 'welcome' | 'room'>('pin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const hasSpokenRef = useRef<Set<string>>(new Set());

  const handleDigitPress = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  // Check PIN when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === storedPin) {
        // Success
        setPhase('welcome');
      } else {
        // Wrong PIN
        setAttempts(prev => prev + 1);
        setError("That's not quite right. Take your time.");
        if (voiceEnabled) {
          speak("That's not quite right. Take your time.");
        }
        setPin('');
      }
    }
  }, [pin, storedPin, voiceEnabled, speak]);

  // Welcome message after PIN success
  useEffect(() => {
    if (phase === 'welcome' && !hasSpokenRef.current.has('welcome')) {
      hasSpokenRef.current.add('welcome');
      const message = `Welcome home. This is your bedroom — your main safe space. I'll be right here with you.`;
      if (voiceEnabled) {
        speak(message);
      }
      setTimeout(() => setPhase('room'), 3000);
    }
  }, [phase, voiceEnabled, speak, saiName]);

  // Navigate to SAI room when ready
  useEffect(() => {
    if (phase === 'room') {
      navigate('/sai-room');
    }
  }, [phase, navigate]);

  const saiState = isSpeaking ? 'speaking' : 'attentive';

  if (phase === 'welcome') {
    return (
      <div 
        className="min-h-screen relative flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${cozyBedroomBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative z-10 flex flex-col items-center">
          <FullBodySAI size="xl" state={saiState} />
          
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 mt-6 border border-border/50 max-w-md">
            <p className="text-foreground text-lg text-center">
              Welcome home. This is your bedroom — your main safe space.
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${cozyBedroomBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 max-w-4xl mx-auto">
        {/* SAI waiting */}
        <div className="flex-shrink-0">
          <FullBodySAI size="lg" state={saiState} />
        </div>

        {/* PIN entry */}
        <div className="flex-1 max-w-md">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl p-4 mb-6 border border-border/50">
            <p className="text-center text-foreground">
              {attempts > 2 
                ? "No pressure. Take all the time you need."
                : "Enter your code to come home."}
              {isSpeaking && <span className="animate-pulse ml-1">|</span>}
            </p>
          </div>

          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
            {/* Lock icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Pin display */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(index => (
                <div 
                  key={index}
                  className={cn(
                    "w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold transition-all",
                    pin.length > index 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-muted bg-muted/20"
                  )}
                >
                  {pin.length > index ? (showPin ? pin[index] : "•") : ""}
                </div>
              ))}
            </div>

            {/* Show/hide toggle */}
            <button
              onClick={() => setShowPin(!showPin)}
              className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPin ? 'Hide' : 'Show'}
            </button>

            {/* Error message */}
            {error && (
              <p className="text-amber-400 text-sm text-center mb-4">{error}</p>
            )}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                <Button
                  key={digit}
                  variant="outline"
                  size="lg"
                  className="h-14 text-xl font-semibold"
                  onClick={() => handleDigitPress(digit)}
                >
                  {digit}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="lg"
                className="h-14 text-sm"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 text-xl font-semibold"
                onClick={() => handleDigitPress('0')}
              >
                0
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="h-14"
                onClick={handleDelete}
              >
                <Delete className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
