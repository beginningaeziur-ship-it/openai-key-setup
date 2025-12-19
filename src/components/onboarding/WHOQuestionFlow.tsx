import { useState, useEffect, useCallback, useRef } from 'react';
import { PaperTestForm } from './PaperTestForm';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Check, X, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    // Reset state for new question
    setHasHeardQuestion(false);
    questionSpokenRef.current = false;
    
    // Speak the new question after a brief delay
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
      
      // Optional: SAI acknowledges
      if (voiceEnabled) {
        await speak("Got it.");
      }
    }

    // Move to next question or complete
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

  const handleMute = () => {
    stopSpeaking();
    setHasHeardQuestion(true);
  };

  // Determine what text to show
  const showQuestionText = !voiceEnabled || captionsEnabled || hasHeardQuestion;

  return (
    <PaperTestForm>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-stone-500 mb-1 font-mono">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-stone-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category label */}
      <div className="mb-4">
        <span className="text-xs font-mono uppercase tracking-widest text-stone-400 bg-stone-200 px-2 py-1 rounded">
          {currentQuestion?.category}
        </span>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-stone-600 rounded-full animate-pulse"
                style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <span className="text-stone-500 text-sm">SAI asking...</span>
          <button 
            onClick={handleMute}
            className="p-1.5 rounded-full hover:bg-stone-200 transition-colors"
            aria-label="Stop and show text"
          >
            <VolumeX className="w-4 h-4 text-stone-400" />
          </button>
        </div>
      )}

      {/* Question display */}
      <div className="min-h-[120px] flex items-center">
        {showQuestionText ? (
          <h2 
            className={cn(
              "text-xl md:text-2xl font-serif text-stone-800 leading-relaxed",
              isTransitioning && "opacity-50"
            )}
          >
            {currentQuestion?.spokenQuestion}
          </h2>
        ) : (
          <p className="text-stone-400 italic">Listening...</p>
        )}
      </div>

      {/* Answer buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => handleAnswer('yes')}
          disabled={!hasHeardQuestion || isTransitioning}
          className={cn(
            "flex-1 py-4 rounded-lg border-2 transition-all",
            "flex items-center justify-center gap-2 text-lg font-medium",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "border-green-600 text-green-700 hover:bg-green-50 active:bg-green-100",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          )}
        >
          <Check className="w-5 h-5" />
          Yes
        </button>
        
        <button
          onClick={() => handleAnswer('no')}
          disabled={!hasHeardQuestion || isTransitioning}
          className={cn(
            "flex-1 py-4 rounded-lg border-2 transition-all",
            "flex items-center justify-center gap-2 text-lg font-medium",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "border-stone-400 text-stone-600 hover:bg-stone-100 active:bg-stone-200",
            "focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
          )}
        >
          <X className="w-5 h-5" />
          No
        </button>
      </div>

      {/* Skip option */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSkip}
          className="text-stone-400 text-sm hover:text-stone-600 transition-colors inline-flex items-center gap-1"
        >
          <SkipForward className="w-3 h-3" />
          Skip this question
        </button>
      </div>

      {/* Selected count */}
      {selectedIds.length > 0 && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <p className="text-stone-500 text-sm text-center">
            {selectedIds.length} area{selectedIds.length !== 1 ? 's' : ''} identified so far
          </p>
        </div>
      )}
    </PaperTestForm>
  );
}
