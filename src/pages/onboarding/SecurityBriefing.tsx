import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import { Shield, Eye, Lock, UserCheck } from 'lucide-react';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * SecurityBriefing - Office with desk
 * 
 * SAI explains security warnings and the Watcher app
 */

const SECURITY_MESSAGES = [
  {
    text: "Before we go further, I want you to understand how your privacy works here.",
    icon: null,
  },
  {
    text: "Nothing you share with me is stored permanently. Your answers help me understand your path — but they stay in this session only.",
    icon: Shield,
  },
  {
    text: "There's also something called the Watcher app. It's a separate view that a trusted person can access if you choose to set it up.",
    icon: Eye,
  },
  {
    text: "The Watcher can see your general wellbeing status — never your private conversations or details. You control who, if anyone, has access.",
    icon: UserCheck,
  },
  {
    text: "Your safety code protects everything. No one enters without your permission.",
    icon: Lock,
  },
  {
    text: "Now, let's get to know each other a bit so I can support you properly.",
    icon: null,
  },
];

export default function SecurityBriefing() {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const message = SECURITY_MESSAGES[currentMessageIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedText('');

    const typeInterval = setInterval(() => {
      if (charIndex < message.text.length) {
        setDisplayedText(message.text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        if (currentMessageIndex === SECURITY_MESSAGES.length - 1) {
          setTimeout(() => setShowContinue(true), 500);
        } else {
          setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1);
          }, 2500);
        }
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex]);

  const handleContinue = () => {
    navigate('/onboarding/assessment');
  };

  const CurrentIcon = SECURITY_MESSAGES[currentMessageIndex].icon;

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
            size="lg" 
            state={isTyping ? 'speaking' : 'attentive'} 
          />
        </div>

        {/* Desk area on right */}
        <div className="flex-1 max-w-xl">
          {/* Speech bubble with icon */}
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50">
            {CurrentIcon && (
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CurrentIcon className="w-6 h-6 text-primary" />
                </div>
              </div>
            )}
            
            <p className="text-lg text-foreground leading-relaxed text-center min-h-[80px]">
              {displayedText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center gap-2 mt-6">
            {SECURITY_MESSAGES.map((_, index) => (
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
                onClick={handleContinue}
                className="animate-fade-in"
              >
                Continue to Assessment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
