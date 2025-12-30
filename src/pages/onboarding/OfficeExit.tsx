import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { DoorOpen, Shield, Eye, Lock } from 'lucide-react';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * OfficeExit - Full-bodied SAI with exit door
 * 
 * SAI recaps security, reminds of everything discussed,
 * then leads user to their new safe home
 */

const EXIT_MESSAGES = [
  "We've covered a lot today. Let me remind you of what we discussed.",
  "Your information stays private. Nothing is permanently stored from our conversation.",
  "If you set up a Watcher, they'll only see your general wellbeing — never your private details.",
  "Your safety code will protect your space. Only you decide who enters.",
  "Now, let's head to your new safe home. I'll meet you there.",
  "Ready to go?"
];

const MESSAGE_ICONS = [
  null,
  Shield,
  Eye,
  Lock,
  null,
  DoorOpen,
];

export default function OfficeExit() {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const message = EXIT_MESSAGES[currentMessageIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedText('');

    const typeInterval = setInterval(() => {
      if (charIndex < message.length) {
        setDisplayedText(message.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        if (currentMessageIndex === EXIT_MESSAGES.length - 1) {
          setTimeout(() => setShowContinue(true), 500);
        } else {
          setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1);
          }, 2000);
        }
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex]);

  const handleExit = () => {
    navigate('/onboarding/home-entrance');
  };

  const CurrentIcon = MESSAGE_ICONS[currentMessageIndex];

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${comfortOfficeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-6 max-w-5xl mx-auto">
        {/* SAI on left */}
        <div className="flex-shrink-0">
          <FullBodySAI 
            size="xl" 
            state={isTyping ? 'speaking' : 'attentive'} 
          />
        </div>

        {/* Exit area */}
        <div className="flex-1 max-w-xl">
          {/* Speech bubble */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
            {CurrentIcon && (
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <CurrentIcon className="w-7 h-7 text-primary" />
                </div>
              </div>
            )}
            
            <p className="text-lg text-foreground leading-relaxed text-center min-h-[60px]">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mt-6">
            {EXIT_MESSAGES.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentMessageIndex 
                    ? "bg-primary w-6" 
                    : index < currentMessageIndex 
                      ? "bg-primary/60" 
                      : "bg-muted"
                )}
              />
            ))}
          </div>
          
          {showContinue && (
            <div className="flex justify-center mt-6">
              <Button 
                size="lg"
                onClick={handleExit}
                className="animate-fade-in gap-2"
              >
                <DoorOpen className="w-5 h-5" />
                Head to My Safe Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
