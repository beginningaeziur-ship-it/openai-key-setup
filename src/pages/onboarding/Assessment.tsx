import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RobotDogAvatar } from '@/components/sai/RobotDogAvatar';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { useSAI } from '@/contexts/SAIContext';
import { Volume2, VolumeX, ChevronRight } from 'lucide-react';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';

/**
 * Assessment - Two-option first question, then verbal sub-lists
 * 
 * Flow:
 * 1. First question with two checkboxes
 * 2. If disabilities checked → verbal disability list
 * 3. If circumstances checked → verbal circumstances list
 * 4. Then proceed to safety plan
 * 
 * NO DATA STORAGE - just builds goals/path/logic
 */

type AssessmentPhase = 
  | 'first-question'
  | 'disabilities-list'
  | 'circumstances-list'
  | 'complete';

// Disability options for verbal list
const DISABILITY_OPTIONS = [
  { id: 'autism', label: 'Autism Spectrum' },
  { id: 'adhd', label: 'ADHD' },
  { id: 'ptsd', label: 'PTSD or Complex PTSD' },
  { id: 'anxiety', label: 'Anxiety Disorders' },
  { id: 'depression', label: 'Depression' },
  { id: 'bipolar', label: 'Bipolar Disorder' },
  { id: 'chronic_pain', label: 'Chronic Pain' },
  { id: 'sensory', label: 'Sensory Processing Issues' },
  { id: 'epilepsy', label: 'Epilepsy or Seizures' },
  { id: 'learning', label: 'Learning Disabilities' },
  { id: 'substance', label: 'Substance Recovery' },
  { id: 'eating', label: 'Eating Disorder Recovery' },
];

// Circumstances options for verbal list
const CIRCUMSTANCE_OPTIONS = [
  { id: 'homelessness', label: 'Homelessness or Housing Instability' },
  { id: 'probation', label: 'Probation or Parole' },
  { id: 'court', label: 'Court Involvement' },
  { id: 'custody', label: 'Custody Matters' },
  { id: 'dv', label: 'Domestic Violence Survivor' },
  { id: 'trafficking', label: 'Trafficking Survivor' },
  { id: 'reentry', label: 'Re-entry from Incarceration' },
  { id: 'financial', label: 'Financial Crisis' },
  { id: 'job_loss', label: 'Job Loss' },
  { id: 'cps', label: 'CPS Involvement' },
  { id: 'unsafe_living', label: 'Unsafe Living Situation' },
];

export default function Assessment() {
  const navigate = useNavigate();
  const { setOnboardingStep } = useSAI();
  const { speak, voiceEnabled, setVoiceEnabled, isSpeaking, stopSpeaking } = useVoiceSettings();
  
  const [phase, setPhase] = useState<AssessmentPhase>('first-question');
  const [hasDisabilities, setHasDisabilities] = useState(false);
  const [hasCircumstances, setHasCircumstances] = useState(false);
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([]);
  const [selectedCircumstances, setSelectedCircumstances] = useState<string[]>([]);
  const [currentSpeakingItem, setCurrentSpeakingItem] = useState<string | null>(null);
  const [hasHeardIntro, setHasHeardIntro] = useState(false);
  
  const speakingRef = useRef(false);

  // SAI messages for each phase
  const phaseMessages: Record<AssessmentPhase, string> = {
    'first-question': "To understand how I can best support you, I need to ask two questions. Check the boxes that apply to you.",
    'disabilities-list': "I'll read through some conditions. Tap any that apply to you. Take your time.",
    'circumstances-list': "Now I'll go through some life circumstances. Again, just tap what applies.",
    'complete': '',
  };

  // Speak intro when phase changes
  useEffect(() => {
    if (phase === 'first-question' && voiceEnabled && !hasHeardIntro) {
      const timer = setTimeout(() => {
        speak(phaseMessages['first-question']).then(() => {
          setHasHeardIntro(true);
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, voiceEnabled, hasHeardIntro]);

  // Speak options for sub-lists
  useEffect(() => {
    if (phase === 'disabilities-list' && voiceEnabled && !speakingRef.current) {
      speakingRef.current = true;
      speakOptions(DISABILITY_OPTIONS, phaseMessages['disabilities-list']);
    } else if (phase === 'circumstances-list' && voiceEnabled && !speakingRef.current) {
      speakingRef.current = true;
      speakOptions(CIRCUMSTANCE_OPTIONS, phaseMessages['circumstances-list']);
    }
  }, [phase, voiceEnabled]);

  const speakOptions = async (options: typeof DISABILITY_OPTIONS, intro: string) => {
    await speak(intro);
    await new Promise(resolve => setTimeout(resolve, 400));
    
    for (const option of options) {
      setCurrentSpeakingItem(option.id);
      await speak(option.label);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    setCurrentSpeakingItem(null);
    speakingRef.current = false;
  };

  const handleFirstQuestionContinue = () => {
    stopSpeaking();
    speakingRef.current = false;
    
    if (hasDisabilities) {
      setPhase('disabilities-list');
    } else if (hasCircumstances) {
      setPhase('circumstances-list');
    } else {
      // Neither selected, go to safety plan
      handleComplete();
    }
  };

  const handleDisabilitiesContinue = () => {
    stopSpeaking();
    speakingRef.current = false;
    
    if (hasCircumstances) {
      setPhase('circumstances-list');
    } else {
      handleComplete();
    }
  };

  const handleCircumstancesContinue = () => {
    stopSpeaking();
    handleComplete();
  };

  const handleComplete = () => {
    // Just proceed - no persistent storage of assessment data
    // SAI uses selections in-memory for goal logic only
    setOnboardingStep(4);
    navigate('/onboarding/safety-plan');
  };

  const toggleVoice = () => {
    if (voiceEnabled) stopSpeaking();
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleDisability = (id: string) => {
    setSelectedDisabilities(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleCircumstance = (id: string) => {
    setSelectedCircumstances(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden">
      {/* Office background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${comfortOfficeBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

      {/* Top controls */}
      <div className="relative z-20 flex items-center justify-between p-4">
        <button
          onClick={toggleVoice}
          className={cn(
            "p-2.5 rounded-full transition-all",
            "bg-black/40 backdrop-blur-md border border-white/10",
            "hover:bg-black/60",
            isSpeaking && "ring-2 ring-primary/50"
          )}
        >
          {voiceEnabled ? (
            <Volume2 className={cn("w-5 h-5", isSpeaking ? "text-primary animate-pulse" : "text-white/80")} />
          ) : (
            <VolumeX className="w-5 h-5 text-white/50" />
          )}
        </button>

        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium",
          "bg-black/40 backdrop-blur-md border border-white/10",
          isSpeaking ? "text-primary" : "text-white/70"
        )}>
          {isSpeaking ? "SAI speaking..." : "Ready"}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 pb-6 overflow-y-auto">
        {/* SAI */}
        <div className="flex flex-col items-center gap-3 py-4 shrink-0">
          <div className="relative">
            <div 
              className={cn(
                "absolute inset-0 rounded-full transition-all duration-500",
                isSpeaking ? "opacity-100 scale-[2]" : "opacity-40 scale-150"
              )}
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <RobotDogAvatar 
              size="lg" 
              state={isSpeaking ? 'speaking' : 'attentive'}
              energyLevel="high"
              showBreathing={!isSpeaking}
            />
          </div>
          
          <span className="text-white/80 text-sm font-medium tracking-wide">SAI</span>
          
          {/* Message bubble */}
          <div className="max-w-sm bg-black/50 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
            <p className="text-white/90 text-sm text-center leading-relaxed">
              {phaseMessages[phase]}
            </p>
          </div>
        </div>

        {/* Paper form overlay */}
        <div className="flex-1 w-full max-w-lg">
          <div className="relative">
            {/* Paper shadow */}
            <div 
              className="absolute inset-0 bg-black/30 rounded-sm blur-md"
              style={{ transform: 'translate(6px, 6px)' }}
            />
            
            {/* Paper */}
            <div 
              className={cn(
                "relative bg-amber-50 rounded-sm p-6",
                "shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
                "border border-amber-200/50"
              )}
              style={{
                backgroundImage: `
                  linear-gradient(transparent 0px, transparent 26px, #e5d5c0 26px, #e5d5c0 27px),
                  linear-gradient(90deg, #f5efe6 0px, #faf8f4 100%)
                `,
                backgroundSize: '100% 28px, 100% 100%',
              }}
            >
              {/* Red margin line */}
              <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-300/50" />
              
              {/* Hole punches */}
              <div className="absolute left-3 top-1/4 w-2.5 h-2.5 rounded-full bg-stone-700/70 shadow-inner" />
              <div className="absolute left-3 top-1/2 w-2.5 h-2.5 rounded-full bg-stone-700/70 shadow-inner" />
              <div className="absolute left-3 top-3/4 w-2.5 h-2.5 rounded-full bg-stone-700/70 shadow-inner" />
              
              {/* Content */}
              <div className="ml-6 space-y-4 text-stone-800">
                {/* FIRST QUESTION PHASE */}
                {phase === 'first-question' && (
                  <>
                    <h2 className="text-xl font-semibold text-stone-900 mb-6">
                      Check all that apply:
                    </h2>
                    
                    <div className="space-y-4">
                      {/* Disabilities checkbox */}
                      <label className={cn(
                        "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all",
                        "border-2",
                        hasDisabilities 
                          ? "bg-primary/10 border-primary" 
                          : "bg-stone-100 border-stone-200 hover:border-stone-300"
                      )}>
                        <Checkbox
                          checked={hasDisabilities}
                          onCheckedChange={(checked) => setHasDisabilities(checked === true)}
                          className="mt-1"
                        />
                        <div>
                          <span className="font-medium text-stone-900 block">
                            Medical or Mental Health Disabilities
                          </span>
                          <span className="text-sm text-stone-600">
                            Includes conditions, diagnoses, or recovery paths
                          </span>
                        </div>
                      </label>

                      {/* Circumstances checkbox */}
                      <label className={cn(
                        "flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-all",
                        "border-2",
                        hasCircumstances 
                          ? "bg-primary/10 border-primary" 
                          : "bg-stone-100 border-stone-200 hover:border-stone-300"
                      )}>
                        <Checkbox
                          checked={hasCircumstances}
                          onCheckedChange={(checked) => setHasCircumstances(checked === true)}
                          className="mt-1"
                        />
                        <div>
                          <span className="font-medium text-stone-900 block">
                            Criminal, Court, Housing, or Financial
                          </span>
                          <span className="text-sm text-stone-600">
                            Life circumstances that affect daily stability
                          </span>
                        </div>
                      </label>
                    </div>

                    <Button
                      onClick={handleFirstQuestionContinue}
                      className="w-full mt-6 h-12"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}

                {/* DISABILITIES LIST PHASE */}
                {phase === 'disabilities-list' && (
                  <>
                    <h2 className="text-lg font-semibold text-stone-900 mb-4">
                      Check all that apply:
                    </h2>
                    
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                      {DISABILITY_OPTIONS.map((option) => (
                        <label 
                          key={option.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                            "border",
                            selectedDisabilities.includes(option.id)
                              ? "bg-primary/10 border-primary"
                              : "bg-stone-100 border-stone-200 hover:border-stone-300",
                            currentSpeakingItem === option.id && "ring-2 ring-primary"
                          )}
                        >
                          <Checkbox
                            checked={selectedDisabilities.includes(option.id)}
                            onCheckedChange={() => toggleDisability(option.id)}
                          />
                          <span className="text-stone-800">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    <Button
                      onClick={handleDisabilitiesContinue}
                      className="w-full mt-4 h-12"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}

                {/* CIRCUMSTANCES LIST PHASE */}
                {phase === 'circumstances-list' && (
                  <>
                    <h2 className="text-lg font-semibold text-stone-900 mb-4">
                      Check all that apply:
                    </h2>
                    
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                      {CIRCUMSTANCE_OPTIONS.map((option) => (
                        <label 
                          key={option.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                            "border",
                            selectedCircumstances.includes(option.id)
                              ? "bg-primary/10 border-primary"
                              : "bg-stone-100 border-stone-200 hover:border-stone-300",
                            currentSpeakingItem === option.id && "ring-2 ring-primary"
                          )}
                        >
                          <Checkbox
                            checked={selectedCircumstances.includes(option.id)}
                            onCheckedChange={() => toggleCircumstance(option.id)}
                          />
                          <span className="text-stone-800">{option.label}</span>
                        </label>
                      ))}
                    </div>

                    <Button
                      onClick={handleCircumstancesContinue}
                      className="w-full mt-4 h-12"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
