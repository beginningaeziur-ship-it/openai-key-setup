import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Check, X, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SAIAnchoredLayout } from './SAIAnchoredLayout';
import { Button } from '@/components/ui/button';

interface WHOQuestion {
  id: string;
  category: string;
  label: string;
  spokenQuestion: string;
}

interface WHOQuestionFlowProps {
  questions: WHOQuestion[];
  onComplete: (selectedIds: string[]) => void;
  onBack: () => void;
}

export function WHOQuestionFlow({ questions, onComplete, onBack }: WHOQuestionFlowProps) {
  const { captionsEnabled } = useAccessibility();
  const { speak, stopSpeaking, isSpeaking, voiceEnabled } = useVoiceSettings();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hasHeardQuestion, setHasHeardQuestion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const questionSpokenRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const speakQuestion = useCallback(async () => {
    if (!currentQuestion) return;
    
    if (voiceEnabled) {
      questionSpokenRef.current = true;
      await speak(currentQuestion.spokenQuestion);
      setHasHeardQuestion(true);
    } else {
      setHasHeardQuestion(true);
    }
  }, [currentQuestion, voiceEnabled, speak]);

  useEffect(() => {
    setHasHeardQuestion(false);
    questionSpokenRef.current = false;
    
    const timer = setTimeout(() => {
      if (!questionSpokenRef.current) {
        speakQuestion();
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [currentIndex]);

  const handleAnswer = async (answer: 'yes' | 'no') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    stopSpeaking();

    if (answer === 'yes') {
      setSelectedIds(prev => [...prev, currentQuestion.id]);
      if (voiceEnabled) {
        await speak("Got it.");
      }
    }

    setTimeout(() => {
      if (isLastQuestion) {
        const finalSelections = answer === 'yes' 
          ? [...selectedIds, currentQuestion.id] 
          : selectedIds;
        onComplete(finalSelections);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleSkip = () => {
    stopSpeaking();
    if (isLastQuestion) {
      onComplete(selectedIds);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <SAIAnchoredLayout 
      saiMessage={currentQuestion?.spokenQuestion || ''}
      saiState={isSpeaking ? 'speaking' : 'attentive'}
      showOverlay={true}
      overlayStyle="glass"
    >
      <div className="flex-1 flex flex-col">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/50 mb-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{currentQuestion?.category}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Answer buttons - centered */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Button
            onClick={() => handleAnswer('yes')}
            disabled={!hasHeardQuestion || isTransitioning}
            size="lg"
            className={cn(
              "w-full max-w-xs h-14 rounded-xl text-lg gap-2",
              "bg-emerald-600 hover:bg-emerald-500"
            )}
          >
            <Check className="w-5 h-5" />
            Yes
          </Button>
          
          <Button
            onClick={() => handleAnswer('no')}
            disabled={!hasHeardQuestion || isTransitioning}
            variant="outline"
            size="lg"
            className="w-full max-w-xs h-14 rounded-xl text-lg gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
            No
          </Button>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="text-white/40 text-sm hover:text-white/60 transition-colors inline-flex items-center gap-1 mt-2"
          >
            <SkipForward className="w-3 h-3" />
            Skip
          </button>
        </div>

        {/* Selected count */}
        {selectedIds.length > 0 && (
          <div className="text-center text-white/50 text-xs pt-4">
            {selectedIds.length} area{selectedIds.length !== 1 ? 's' : ''} identified
          </div>
        )}
      </div>
    </SAIAnchoredLayout>
  );
}
