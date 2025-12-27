import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThreeChoicePrompt, threeChoicePresets } from '@/components/sai/ThreeChoicePrompt';
import { useSAI } from '@/contexts/SAIContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ScrollArea } from '@/components/ui/scroll-area';

type ChoiceType = 'gentle' | 'standard' | 'challenge';

export default function Preferences() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, setOnboardingStep } = useSAI();
  
  const [pace, setPace] = useState<ChoiceType>(
    (userProfile?.preferences?.pace as ChoiceType) || 'standard'
  );
  const [intensity, setIntensity] = useState<ChoiceType>(
    (userProfile?.preferences?.intensity as ChoiceType) || 'standard'
  );
  const [supportStyle, setSupportStyle] = useState<ChoiceType>(
    (userProfile?.preferences?.supportStyle as ChoiceType) || 'standard'
  );
  const [goalSize, setGoalSize] = useState<ChoiceType>(
    (userProfile?.preferences?.goalSize as ChoiceType) || 'standard'
  );

  const handleNext = () => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        preferences: { pace, intensity, supportStyle, goalSize },
      });
    }
    setOnboardingStep(8);
    navigate('/onboarding/goals');
  };

  const allSelected = pace && intensity && supportStyle && goalSize;

  return (
    <OnboardingLayout 
      saiMessage="How should we work together? There's no wrong answer — each option is healthy. Choose what's right for you right now."
      saiState="attentive"
    >
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="space-y-4">
            {/* Pace */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4">
              <ThreeChoicePrompt
                {...threeChoicePresets.pace}
                selected={pace}
                onSelect={(id) => setPace(id as ChoiceType)}
              />
            </div>

            {/* Intensity */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4">
              <ThreeChoicePrompt
                {...threeChoicePresets.intensity}
                selected={intensity}
                onSelect={(id) => setIntensity(id as ChoiceType)}
              />
            </div>

            {/* Support Style */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4">
              <ThreeChoicePrompt
                {...threeChoicePresets.support}
                selected={supportStyle}
                onSelect={(id) => setSupportStyle(id as ChoiceType)}
              />
            </div>

            {/* Goal Size */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4">
              <ThreeChoicePrompt
                {...threeChoicePresets.goalSize}
                selected={goalSize}
                onSelect={(id) => setGoalSize(id as ChoiceType)}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/symptoms')}
            className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!allSelected}
            className="flex-1 h-12 rounded-xl"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
