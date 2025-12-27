import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PaperTestForm } from '@/components/onboarding/PaperTestForm';
import { ScrollArea } from '@/components/ui/scroll-area';

type ChoiceType = 'gentle' | 'standard' | 'challenge';

interface PreferenceOption {
  id: ChoiceType;
  label: string;
  description: string;
}

const paceOptions: PreferenceOption[] = [
  { id: 'gentle', label: 'Gentle', description: 'Take it slow, lots of breaks' },
  { id: 'standard', label: 'Standard', description: 'Balanced pace' },
  { id: 'challenge', label: 'Motivated', description: 'Push me forward' },
];

const intensityOptions: PreferenceOption[] = [
  { id: 'gentle', label: 'Light', description: 'Minimal pressure' },
  { id: 'standard', label: 'Moderate', description: 'Steady engagement' },
  { id: 'challenge', label: 'Intense', description: 'Full focus mode' },
];

const supportOptions: PreferenceOption[] = [
  { id: 'gentle', label: 'Encouraging', description: 'Lots of positive feedback' },
  { id: 'standard', label: 'Balanced', description: 'Mix of support styles' },
  { id: 'challenge', label: 'Direct', description: 'Straight to the point' },
];

const goalSizeOptions: PreferenceOption[] = [
  { id: 'gentle', label: 'Tiny', description: 'Small, quick wins' },
  { id: 'standard', label: 'Medium', description: 'Moderate challenges' },
  { id: 'challenge', label: 'Big', description: 'Ambitious goals' },
];

export default function Preferences() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, setOnboardingStep } = useSAI();
  
  const [pace, setPace] = useState<ChoiceType | null>(
    (userProfile?.preferences?.pace as ChoiceType) || null
  );
  const [intensity, setIntensity] = useState<ChoiceType | null>(
    (userProfile?.preferences?.intensity as ChoiceType) || null
  );
  const [supportStyle, setSupportStyle] = useState<ChoiceType | null>(
    (userProfile?.preferences?.supportStyle as ChoiceType) || null
  );
  const [goalSize, setGoalSize] = useState<ChoiceType | null>(
    (userProfile?.preferences?.goalSize as ChoiceType) || null
  );

  const handleNext = () => {
    if (userProfile && pace && intensity && supportStyle && goalSize) {
      setUserProfile({
        ...userProfile,
        preferences: { pace, intensity, supportStyle, goalSize },
      });
    }
    setOnboardingStep(8);
    navigate('/onboarding/goals');
  };

  const allSelected = pace && intensity && supportStyle && goalSize;

  const renderChoiceGroup = (
    title: string,
    options: PreferenceOption[],
    selected: ChoiceType | null,
    onSelect: (id: ChoiceType) => void
  ) => (
    <div className="space-y-2">
      <p className="text-stone-700 font-medium text-sm">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(option => (
          <div
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`
              p-2 rounded-lg cursor-pointer transition-all text-center
              ${selected === option.id
                ? 'bg-amber-200 border-2 border-amber-500'
                : 'bg-amber-50 border border-stone-300 hover:bg-amber-100'
              }
            `}
          >
            <p className="text-stone-800 text-sm font-medium">{option.label}</p>
            <p className="text-stone-500 text-xs">{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PaperTestForm>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b-2 border-stone-300 pb-4">
          <h1 className="text-2xl font-bold text-stone-800 tracking-wide">
            Personal Support Assessment
          </h1>
          <p className="text-xs text-red-600 font-semibold mt-1">CONFIDENTIAL</p>
        </div>

        {/* Question */}
        <p className="text-stone-700 font-medium">
          How should we work together? There's no wrong answer:
        </p>

        {/* Options */}
        <ScrollArea className="max-h-[320px]">
          <div className="space-y-4 pr-2">
            {renderChoiceGroup('Pace', paceOptions, pace, setPace)}
            {renderChoiceGroup('Intensity', intensityOptions, intensity, setIntensity)}
            {renderChoiceGroup('Support Style', supportOptions, supportStyle, setSupportStyle)}
            {renderChoiceGroup('Goal Size', goalSizeOptions, goalSize, setGoalSize)}
          </div>
        </ScrollArea>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/symptoms')}
            className="flex-1 h-10 bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!allSelected}
            className="flex-1 h-10 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </PaperTestForm>
  );
}
