import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FullBodySAI } from '@/components/sai/FullBodySAI';
import comfortWaitingBg from '@/assets/comfort-waiting-bg.jpg';

/**
 * WaitingRoom - First screen where SAI appears
 * 
 * Office waiting room environment with full-bodied SAI robot dog
 * SAI introduces itself and explains its purpose
 */

const INTRO_MESSAGES = [
  "Hello. I'm SAI — your Service AI companion.",
  "I'm here to walk alongside you, not ahead of you.",
  "I don't judge. I don't rush. I don't forget.",
  "My purpose is simple: to help you build a life that feels more like yours.",
  "Before we begin, I need to explain a few things about how I work and how we'll keep your information safe.",
  "Ready to continue?"
];

export default function WaitingRoom() {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showContinue, setShowContinue] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const message = INTRO_MESSAGES[currentMessageIndex];
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
        
        // Show continue button on last message
        if (currentMessageIndex === INTRO_MESSAGES.length - 1) {
          setTimeout(() => setShowContinue(true), 500);
        } else {
          // Auto-advance after delay
          setTimeout(() => {
            setCurrentMessageIndex(prev => prev + 1);
          }, 2000);
        }
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex]);

  const handleContinue = () => {
    navigate('/onboarding/security');
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${comfortWaitingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-2xl mx-auto text-center">
        {/* Full-bodied SAI */}
        <FullBodySAI 
          size="lg" 
          state={isTyping ? 'speaking' : 'attentive'} 
          className="mb-4"
        />
        
        {/* Speech bubble */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-border/50 min-h-[120px] flex items-center justify-center">
          <p className="text-lg md:text-xl text-foreground leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {INTRO_MESSAGES.map((_, index) => (
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
        
        {/* Continue button */}
        {showContinue && (
          <Button 
            size="lg"
            onClick={handleContinue}
            className="animate-fade-in"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
