import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { ThreeChoicePrompt, threeChoicePresets } from '@/components/sai/ThreeChoicePrompt';
import { useSAI } from '@/contexts/SAIContext';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
        preferences: {
          pace,
          intensity,
          supportStyle,
          goalSize,
        },
      });
    }
    setOnboardingStep(8);
    navigate('/onboarding/scene');
  };

  const allSelected = pace && intensity && supportStyle && goalSize;

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={7} totalSteps={9} />
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              How should we work together?
            </h1>
            <p className="text-lg text-muted-foreground">
              These choices help me adapt to your needs. You can change them anytime.
            </p>
          </div>

          {/* SAI Message */}
          <Card className="p-4 bg-sai-lavender/30 border-sai-lavender-dark/30">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  There's no wrong answer here. Each option teaches healthy 
                  decision-making — choosing what's right for you <em>right now</em>.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-8">
            {/* Pace Selection */}
            <Card className="p-6 bg-card border-border">
              <ThreeChoicePrompt
                {...threeChoicePresets.pace}
                selected={pace}
                onSelect={(id) => setPace(id as ChoiceType)}
              />
            </Card>

            {/* Intensity Selection */}
            <Card className="p-6 bg-card border-border">
              <ThreeChoicePrompt
                {...threeChoicePresets.intensity}
                selected={intensity}
                onSelect={(id) => setIntensity(id as ChoiceType)}
              />
            </Card>

            {/* Support Style Selection */}
            <Card className="p-6 bg-card border-border">
              <ThreeChoicePrompt
                {...threeChoicePresets.support}
                selected={supportStyle}
                onSelect={(id) => setSupportStyle(id as ChoiceType)}
              />
            </Card>

            {/* Goal Size Selection */}
            <Card className="p-6 bg-card border-border">
              <ThreeChoicePrompt
                {...threeChoicePresets.goalSize}
                selected={goalSize}
                onSelect={(id) => setGoalSize(id as ChoiceType)}
              />
            </Card>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/symptoms')}
              className="flex-1 h-12 rounded-xl"
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
      </div>
    </div>
  );
}
