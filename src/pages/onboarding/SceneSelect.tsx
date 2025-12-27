import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { sceneOptions, SceneType } from '@/components/sai-room/SceneBackground';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';

export default function SceneSelect() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, setOnboardingStep } = useSAI();
  
  const [selectedScene, setSelectedScene] = useState<SceneType>(
    (userProfile?.scene as SceneType) || 'cabin'
  );

  const handleNext = () => {
    setUserProfile({
      ...userProfile!,
      scene: selectedScene,
    });
    setOnboardingStep(9);
    navigate('/onboarding/goals');
  };

  // Note: For scene select, we still use OnboardingLayout but the scene is just for daily use
  // The onboarding itself maintains the cabin background per UI spec

  return (
    <OnboardingLayout 
      saiMessage={`After onboarding, this will be your main space. Pick what feels calming to you.`}
      saiState="attentive"
    >
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          {/* Scene Grid */}
          <div className="grid grid-cols-2 gap-3">
            {sceneOptions.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.id)}
                className={cn(
                  'relative flex flex-col items-center p-4 rounded-xl',
                  'bg-black/40 backdrop-blur-md border transition-all',
                  'hover:bg-black/50',
                  selectedScene === scene.id
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-white/10'
                )}
              >
                <span className="text-2xl mb-2">{scene.icon}</span>
                <span className="font-medium text-white text-sm">{scene.label}</span>
                <span className="text-xs text-white/50 mt-1 text-center">{scene.description}</span>
                
                {selectedScene === scene.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="text-center text-white/40 text-xs mt-4">
            You can change this anytime in settings
          </p>
        </div>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/preferences')}
            className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
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
