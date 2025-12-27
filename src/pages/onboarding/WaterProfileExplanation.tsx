import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { calculateWaterProfile, getWaterProfile } from '@/lib/waterProfile';
import { ArrowRight, TrendingUp, Eye, Gift } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function WaterProfileExplanation() {
  const navigate = useNavigate();
  const { 
    selectedCategories, 
    selectedConditions, 
    selectedSymptoms, 
    whoModel,
    userProfile 
  } = useSAI();

  const waterProfileType = useMemo(() => {
    return calculateWaterProfile(
      selectedCategories,
      selectedConditions,
      selectedSymptoms,
      whoModel,
      userProfile?.preferences
    );
  }, [selectedCategories, selectedConditions, selectedSymptoms, whoModel, userProfile?.preferences]);

  const profile = getWaterProfile(waterProfileType);

  const handleContinue = () => {
    navigate('/sai-room');
  };

  return (
    <OnboardingLayout 
      saiMessage={profile.description}
      saiState="speaking"
    >
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-2 px-2">
          {/* Profile header */}
          <div className="text-center mb-4">
            <span className="text-4xl">{profile.icon}</span>
            <h2 className="text-xl font-display font-bold text-white mt-2">
              Your Profile: {profile.name}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Strengths */}
            <div className="bg-emerald-500/10 backdrop-blur-md rounded-xl border border-emerald-500/20 p-4">
              <h3 className="font-medium text-emerald-400 mb-2 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                Your Strengths
              </h3>
              <ul className="space-y-1">
                {profile.strengths.map((strength, i) => (
                  <li key={i} className="text-white/80 text-xs flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* What to Watch */}
            <div className="bg-amber-500/10 backdrop-blur-md rounded-xl border border-amber-500/20 p-4">
              <h3 className="font-medium text-amber-400 mb-2 flex items-center gap-2 text-sm">
                <Eye className="w-4 h-4" />
                What to Watch
              </h3>
              <ul className="space-y-1">
                {profile.challenges.map((challenge, i) => (
                  <li key={i} className="text-white/80 text-xs flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

            {/* What You Gain */}
            <div className="bg-primary/10 backdrop-blur-md rounded-xl border border-primary/20 p-4">
              <h3 className="font-medium text-primary mb-2 flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4" />
                What You'll Gain
              </h3>
              <ul className="space-y-1">
                {profile.whatYouGain.map((item, i) => (
                  <li key={i} className="text-white/80 text-xs flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reassurance */}
          <div className="mt-4 bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-xs text-center">
              This profile isn't a label — it's a starting point. We'll refine it together.
            </p>
          </div>
        </ScrollArea>

        <div className="pt-4 shrink-0">
          <Button
            onClick={handleContinue}
            className="w-full h-12 rounded-xl"
          >
            Enter My SAI Room
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
