import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import comfortOfficeBg from '@/assets/comfort-office-bg.jpg';
/**
 * Assessment - Notebook paper on desk (no dog visible)
 * 
 * Flow:
 * 1. Initial question with two checkboxes
 * 2. If disabilities checked → show disabilities list
 * 3. Then symptoms for those disabilities
 * 4. If circumstances checked → show circumstances list
 * 5. More detailed options for what they chose
 * 
 * SAI voice narrates but is not visually present
 * NO DATA STORAGE - just builds goals/path
 */

type AssessmentPhase = 
  | 'initial' 
  | 'disabilities' 
  | 'symptoms' 
  | 'circumstances' 
  | 'circumstance-details';

const DISABILITY_OPTIONS = [
  { id: 'anxiety', label: 'Anxiety', description: 'Persistent worry, panic, or fear that affects daily life' },
  { id: 'depression', label: 'Depression', description: 'Ongoing sadness, low energy, or loss of interest' },
  { id: 'ptsd', label: 'PTSD / Trauma', description: 'Responses to past difficult or traumatic experiences' },
  { id: 'adhd', label: 'ADHD', description: 'Difficulty with focus, organization, or impulse control' },
  { id: 'bipolar', label: 'Bipolar Disorder', description: 'Cycles of high and low mood states' },
  { id: 'autism', label: 'Autism Spectrum', description: 'Different ways of processing social and sensory information' },
  { id: 'ocd', label: 'OCD', description: 'Intrusive thoughts and repetitive behaviors' },
  { id: 'chronic-pain', label: 'Chronic Pain', description: 'Ongoing physical pain that affects daily function' },
  { id: 'chronic-illness', label: 'Chronic Illness', description: 'Long-term health conditions requiring ongoing management' },
  { id: 'physical-disability', label: 'Physical Disability', description: 'Mobility or physical function differences' },
];

const SYMPTOM_MAP: Record<string, string[]> = {
  anxiety: ['Racing thoughts', 'Difficulty sleeping', 'Avoidance behaviors', 'Physical tension', 'Panic attacks'],
  depression: ['Low motivation', 'Sleep changes', 'Appetite changes', 'Difficulty concentrating', 'Feelings of worthlessness'],
  ptsd: ['Flashbacks', 'Nightmares', 'Hypervigilance', 'Avoidance', 'Emotional numbness'],
  adhd: ['Difficulty focusing', 'Forgetfulness', 'Impulsivity', 'Restlessness', 'Time blindness'],
  bipolar: ['Mood swings', 'Racing thoughts', 'Impulsive decisions', 'Energy fluctuations', 'Sleep disruption'],
  autism: ['Sensory sensitivities', 'Social exhaustion', 'Need for routine', 'Special interests', 'Communication differences'],
  ocd: ['Intrusive thoughts', 'Compulsive behaviors', 'Need for certainty', 'Checking behaviors', 'Mental rituals'],
  'chronic-pain': ['Daily pain management', 'Energy limitations', 'Sleep disruption', 'Mobility challenges', 'Flare-ups'],
  'chronic-illness': ['Symptom management', 'Medical appointments', 'Energy pacing', 'Medication routines', 'Unpredictable days'],
  'physical-disability': ['Accessibility needs', 'Energy management', 'Adaptive strategies', 'Medical care', 'Independence support'],
};

const CIRCUMSTANCE_OPTIONS = [
  { id: 'housing', label: 'Housing Instability', description: 'Uncertain living situation or risk of homelessness' },
  { id: 'financial', label: 'Financial Hardship', description: 'Difficulty meeting basic financial needs' },
  { id: 'legal', label: 'Legal / Court Issues', description: 'Involvement with legal system or court requirements' },
  { id: 'addiction', label: 'Addiction / Recovery', description: 'Substance use or recovery journey' },
  { id: 'criminal', label: 'Criminal Justice', description: 'Probation, parole, or reentry challenges' },
  { id: 'family', label: 'Family Conflict', description: 'Difficult family relationships or dynamics' },
  { id: 'isolation', label: 'Social Isolation', description: 'Limited social support or connections' },
  { id: 'employment', label: 'Employment Challenges', description: 'Job loss, underemployment, or work difficulties' },
];

const CIRCUMSTANCE_DETAILS: Record<string, string[]> = {
  housing: ['Currently homeless', 'Couch surfing', 'Behind on rent', 'Eviction risk', 'Unsafe living situation'],
  financial: ['Unable to pay bills', 'No savings', 'Debt stress', 'Food insecurity', 'No healthcare access'],
  legal: ['Court dates pending', 'Probation requirements', 'Custody issues', 'Civil matters', 'Immigration status'],
  addiction: ['Active use', 'Early recovery', 'Long-term recovery', 'Harm reduction', 'Family member addiction'],
  criminal: ['Currently incarcerated', 'Recently released', 'On probation', 'On parole', 'Record barriers'],
  family: ['Estrangement', 'Caregiver stress', 'Domestic conflict', 'Parenting challenges', 'Generational trauma'],
  isolation: ['No close friends', 'Far from family', 'Social anxiety', 'Trust difficulties', 'Recent move'],
  employment: ['Unemployed', 'Underemployed', 'Workplace stress', 'Job searching', 'Unable to work'],
};

const SAI_NARRATION = {
  initial: "Let's start with a simple question. Check what applies to you — there's no judgment here.",
  disabilities: "Tell me more about what you're living with. Check all that apply.",
  symptoms: "Based on what you shared, here are some common experiences. Mark any that feel familiar.",
  circumstances: "Life circumstances can be just as important as health. Check what applies.",
  'circumstance-details': "Can you tell me a bit more about your situation?",
};

export default function Assessment() {
  const navigate = useNavigate();
  const { speak, isSpeaking, voiceEnabled } = useVoiceSettings();
  const [phase, setPhase] = useState<AssessmentPhase>('initial');
  const [narrationText, setNarrationText] = useState('');
  const [isNarrating, setIsNarrating] = useState(true);
  
  // Track which phases we've already spoken
  const hasSpokenRef = useRef<Set<string>>(new Set());
  
  // Selections (in-memory only, not stored)
  const [hasDisabilities, setHasDisabilities] = useState(false);
  const [hasCircumstances, setHasCircumstances] = useState(false);
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedCircumstances, setSelectedCircumstances] = useState<string[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<string[]>([]);

  // Typewriter for SAI narration + voice
  useEffect(() => {
    const text = SAI_NARRATION[phase];
    if (!text) return;
    
    let charIndex = 0;
    setIsNarrating(true);
    setNarrationText('');
    
    // Speak the narration if voice enabled and not already spoken
    if (voiceEnabled && !hasSpokenRef.current.has(phase)) {
      hasSpokenRef.current.add(phase);
      speak(text);
    }

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        setNarrationText(text.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsNarrating(false);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [phase, speak, voiceEnabled]);

  const handleInitialContinue = () => {
    if (hasDisabilities) {
      setPhase('disabilities');
    } else if (hasCircumstances) {
      setPhase('circumstances');
    } else {
      navigate('/onboarding/safety-plan');
    }
  };

  const handleDisabilitiesContinue = () => {
    if (selectedDisabilities.length > 0) {
      setPhase('symptoms');
    } else if (hasCircumstances) {
      setPhase('circumstances');
    } else {
      navigate('/onboarding/safety-plan');
    }
  };

  const handleSymptomsContinue = () => {
    if (hasCircumstances) {
      setPhase('circumstances');
    } else {
      navigate('/onboarding/safety-plan');
    }
  };

  const handleCircumstancesContinue = () => {
    if (selectedCircumstances.length > 0) {
      setPhase('circumstance-details');
    } else {
      navigate('/onboarding/safety-plan');
    }
  };

  const handleDetailsContinue = () => {
    navigate('/onboarding/safety-plan');
  };

  const toggleSelection = (id: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter(item => item !== id));
    } else {
      setter([...list, id]);
    }
  };

  // Get symptoms for selected disabilities
  const availableSymptoms = selectedDisabilities.flatMap(d => 
    (SYMPTOM_MAP[d] || []).map(s => ({ symptom: s, from: d }))
  );

  // Get details for selected circumstances
  const availableDetails = selectedCircumstances.flatMap(c => 
    (CIRCUMSTANCE_DETAILS[c] || []).map(d => ({ detail: d, from: c }))
  );

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
      
      {/* Notebook paper on desk */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* SAI narration at top */}
        <div className="bg-card/80 backdrop-blur-sm rounded-t-xl p-4 border-x border-t border-border/50">
          <p className="text-sm text-muted-foreground italic text-center min-h-[40px]">
            {narrationText}
            {isNarrating && <span className="animate-pulse">|</span>}
          </p>
        </div>

        {/* Paper texture */}
        <div 
          className="bg-amber-50 dark:bg-amber-100/90 rounded-b-xl p-6 shadow-2xl min-h-[400px]"
          style={{
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, #91d1d3 28px)',
            backgroundPosition: '0 10px',
          }}
        >
          {/* Initial question */}
          {phase === 'initial' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                What brings you here today?
              </h2>
              
              <label className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={hasDisabilities}
                  onCheckedChange={(checked) => setHasDisabilities(!!checked)}
                  className="mt-1 border-gray-400"
                />
                <div>
                  <span className="text-gray-800 font-medium">Medical or Mental Health Disabilities</span>
                  <p className="text-sm text-gray-600 mt-1">Physical health, mental health, or neurodevelopmental conditions</p>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/50 cursor-pointer transition-colors">
                <Checkbox 
                  checked={hasCircumstances}
                  onCheckedChange={(checked) => setHasCircumstances(!!checked)}
                  className="mt-1 border-gray-400"
                />
                <div>
                  <span className="text-gray-800 font-medium">Life Circumstances</span>
                  <p className="text-sm text-gray-600 mt-1">Housing, financial, legal, criminal, or relational challenges</p>
                </div>
              </label>

              <div className="flex justify-end pt-4">
                <Button onClick={handleInitialContinue} disabled={isNarrating}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Disabilities list */}
          {phase === 'disabilities' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Check all that apply
              </h2>
              
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
                {DISABILITY_OPTIONS.map(option => (
                  <label 
                    key={option.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedDisabilities.includes(option.id) 
                        ? "bg-primary/10" 
                        : "hover:bg-white/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedDisabilities.includes(option.id)}
                      onCheckedChange={() => toggleSelection(option.id, selectedDisabilities, setSelectedDisabilities)}
                      className="mt-0.5 border-gray-400"
                    />
                    <div>
                      <span className="text-gray-800 font-medium">{option.label}</span>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setPhase('initial')} className="text-gray-600">
                  Back
                </Button>
                <Button onClick={handleDisabilitiesContinue} disabled={isNarrating}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Symptoms list */}
          {phase === 'symptoms' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Common experiences — check what feels familiar
              </h2>
              
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
                {availableSymptoms.map(({ symptom, from }, index) => (
                  <label 
                    key={`${from}-${symptom}-${index}`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedSymptoms.includes(symptom) 
                        ? "bg-primary/10" 
                        : "hover:bg-white/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedSymptoms.includes(symptom)}
                      onCheckedChange={() => toggleSelection(symptom, selectedSymptoms, setSelectedSymptoms)}
                      className="border-gray-400"
                    />
                    <span className="text-gray-800">{symptom}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setPhase('disabilities')} className="text-gray-600">
                  Back
                </Button>
                <Button onClick={handleSymptomsContinue} disabled={isNarrating}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Circumstances list */}
          {phase === 'circumstances' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Life circumstances — check all that apply
              </h2>
              
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
                {CIRCUMSTANCE_OPTIONS.map(option => (
                  <label 
                    key={option.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedCircumstances.includes(option.id) 
                        ? "bg-primary/10" 
                        : "hover:bg-white/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedCircumstances.includes(option.id)}
                      onCheckedChange={() => toggleSelection(option.id, selectedCircumstances, setSelectedCircumstances)}
                      className="mt-0.5 border-gray-400"
                    />
                    <div>
                      <span className="text-gray-800 font-medium">{option.label}</span>
                      <p className="text-xs text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => hasDisabilities && selectedDisabilities.length > 0 ? setPhase('symptoms') : setPhase('initial')} 
                  className="text-gray-600"
                >
                  Back
                </Button>
                <Button onClick={handleCircumstancesContinue} disabled={isNarrating}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Circumstance details */}
          {phase === 'circumstance-details' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Tell me more about your situation
              </h2>
              
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2">
                {availableDetails.map(({ detail, from }, index) => (
                  <label 
                    key={`${from}-${detail}-${index}`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      selectedDetails.includes(detail) 
                        ? "bg-primary/10" 
                        : "hover:bg-white/50"
                    )}
                  >
                    <Checkbox 
                      checked={selectedDetails.includes(detail)}
                      onCheckedChange={() => toggleSelection(detail, selectedDetails, setSelectedDetails)}
                      className="border-gray-400"
                    />
                    <span className="text-gray-800">{detail}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setPhase('circumstances')} className="text-gray-600">
                  Back
                </Button>
                <Button onClick={handleDetailsContinue} disabled={isNarrating}>
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
