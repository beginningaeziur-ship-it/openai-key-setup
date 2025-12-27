import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { disabilityCategories } from '@/data/saiCategories';
import type { DisabilityCategory } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const saiMessage = categories.length === 0
    ? "So I know how to move with you, not against you. What are you living with? Select what applies — you can skip anything."
    : `${categories.length} selected. Take your time, or say "next" when you're ready.`;

  return (
    <OnboardingLayout saiMessage={saiMessage} saiState="attentive">
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
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

          {/* Privacy note */}
          <div className="mt-4 bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-white/60 text-xs text-center">
              Nothing here is saved as personal information. These selections only shape your support structure.
            </p>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/who-model')}
            className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
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
    </OnboardingLayout>
  );
}
