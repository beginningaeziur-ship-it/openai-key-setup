import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSAI } from '@/contexts/SAIContext';
import { calculateWaterProfile, getWaterProfile } from '@/lib/waterProfile';
import { ArrowLeft, ArrowRight, Sparkles, Eye, TrendingUp, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WaterProfileExplanation() {
  const navigate = useNavigate();
  const { 
    selectedCategories, 
    selectedConditions, 
    selectedSymptoms, 
    whoModel,
    userProfile 
  } = useSAI();

  const saiName = userProfile?.saiNickname || 'SAI';

  // Calculate the water profile based on onboarding data
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
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="text-5xl">{profile.icon}</div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Your Water Profile: {profile.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on what you've shared, here's how I understand you
          </p>
        </div>

        {/* SAI Message */}
        <Card className="p-4 bg-sai-lavender/30 border-sai-lavender-dark/30">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{saiName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {profile.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Strengths & Challenges */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4 bg-sai-calm/20 border-sai-calm/30">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sai-calm-dark" />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {profile.strengths.map((strength, i) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-sai-calm-dark">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4 bg-sai-warm/20 border-sai-warm-dark/30">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-sai-warm-dark" />
              What to Watch
            </h3>
            <ul className="space-y-2">
              {profile.challenges.map((challenge, i) => (
                <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-sai-warm-dark">•</span>
                  {challenge}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* What the Watcher Tracks */}
        <Card className="p-4 bg-card border-border">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            What I'll Be Watching For
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            These are patterns I'll gently track to help support you better:
          </p>
          <ul className="space-y-2">
            {profile.whatWeWatch.map((item, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-primary">→</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* What You Gain */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            What You'll Gain From This Program
          </h3>
          <ul className="space-y-2">
            {profile.whatYouGain.map((item, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                <span className="text-primary">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Reassurance */}
        <div className="bg-sai-lavender/30 rounded-xl p-4 border border-sai-lavender-dark/20">
          <p className="text-sm text-foreground text-center">
            <strong>This profile isn't a label.</strong> It's a starting point for understanding 
            how you process things. We'll refine it together as we work through the program.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/goals')}
            className="flex-1 h-12 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Goals
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 h-12 rounded-xl"
          >
            Enter My SAI Room
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
