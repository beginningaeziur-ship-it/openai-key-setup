import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { useSAI } from '@/contexts/SAIContext';
import { SceneBackground, sceneOptions, SceneType } from '@/components/sai-room/SceneBackground';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SceneSelect() {
  const navigate = useNavigate();
  const { userProfile, setUserProfile, setOnboardingStep } = useSAI();
  
  const [selectedScene, setSelectedScene] = useState<SceneType>(
    (userProfile?.scene as SceneType) || 'bedroom'
  );

  const handleNext = () => {
    setUserProfile({
      ...userProfile!,
      scene: selectedScene,
    });
    setOnboardingStep(9);
    navigate('/onboarding/goals');
  };

  return (
    <SceneBackground scene={selectedScene}>
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">
          <OnboardingProgress currentStep={8} totalSteps={9} />
          
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                Choose Your Peaceful Space
              </h1>
              <p className="text-lg text-foreground/80">
                This will be your SAI Room — a calm place to return to whenever you need support.
              </p>
            </div>

            {/* Scene Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sceneOptions.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene.id)}
                  className={cn(
                    'relative flex flex-col items-center p-4 rounded-xl',
                    'bg-card/40 backdrop-blur-sm border transition-all duration-300',
                    'hover:bg-card/60 hover:scale-105',
                    selectedScene === scene.id
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                      : 'border-border/30'
                  )}
                >
                  <span className="text-3xl mb-2">{scene.icon}</span>
                  <span className="font-medium text-sm">{scene.label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{scene.description}</span>
                  
                  {selectedScene === scene.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Preview text */}
            <div className="text-center">
              <p className="text-sm text-foreground/60">
                ↑ The background shows a preview of your selected scene
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/onboarding/preferences')}
                className="flex-1 h-12 rounded-xl bg-background/50"
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
        </div>
      </div>
    </SceneBackground>
  );
}
