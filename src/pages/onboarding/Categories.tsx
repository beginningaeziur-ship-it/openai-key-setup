import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { disabilityCategories } from '@/data/saiCategories';
import type { DisabilityCategory } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Categories() {
  const navigate = useNavigate();
  const { selectedCategories, setSelectedCategories, setOnboardingStep } = useSAI();
  
  const [categories, setCategories] = useState<DisabilityCategory[]>(selectedCategories);

  const toggleCategory = (id: string) => {
    const categoryId = id as DisabilityCategory;
    if (categories.includes(categoryId)) {
      setCategories(categories.filter(c => c !== categoryId));
    } else {
      setCategories([...categories, categoryId]);
    }
  };

  const handleNext = () => {
    setSelectedCategories(categories);
    setOnboardingStep(5);
    navigate('/onboarding/conditions');
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={4} totalSteps={9} />
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              What are you living with?
            </h1>
            <p className="text-lg text-muted-foreground">
              Select the categories that apply to you. We'll get more specific next.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="grid gap-3 sm:grid-cols-2">
              {disabilityCategories.map(category => (
                <SelectableCard
                  key={category.id}
                  id={category.id}
                  label={category.label}
                  icon={category.icon}
                  selected={categories.includes(category.id as DisabilityCategory)}
                  onSelect={toggleCategory}
                />
              ))}
            </div>
          </div>

          {/* Privacy disclaimer */}
          <div className="bg-sai-calm/30 rounded-xl p-4 border border-sai-calm-dark/20">
            <p className="text-sm text-foreground">
              <strong>Nothing you select here is saved as personal information.</strong> SAI uses these selections only to shape the size and structure of your support goals. This information is not stored, tracked, or shared.
            </p>
          </div>

          <div className="bg-sai-warm/50 rounded-xl p-4 border border-sai-warm-dark/20">
            <p className="text-sm text-foreground">
              <strong>You don't need a diagnosis.</strong> If you experience something, 
              it counts. This is about understanding your needs, not proving them.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/who-model')}
              className="flex-1 h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={categories.length === 0}
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
