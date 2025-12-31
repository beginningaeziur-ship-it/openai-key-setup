import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { disabilityCategories } from '@/data/saiCategories';
import type { DisabilityCategory } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SAIAnchoredLayout } from '@/components/onboarding/SAIAnchoredLayout';
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

  return (
    <SAIAnchoredLayout 
      saiMessage="What are you living with? This helps me understand how to support you best. Select all that apply."
      saiState="speaking"
      overlayStyle="paper"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center border-b-2 border-stone-300 pb-3">
          <h1 className="text-xl font-bold tracking-wide">
            Personal Support Assessment
          </h1>
          <p className="text-xs text-red-600 font-semibold mt-1">CONFIDENTIAL</p>
        </div>

        {/* Question */}
        <div className="space-y-1">
          <p className="font-medium text-sm">
            Select all that apply:
          </p>
          {categories.length > 0 && (
            <p className="text-xs text-stone-500">{categories.length} selected</p>
          )}
        </div>

        {/* Options */}
        <ScrollArea className="max-h-[200px]">
          <div className="grid gap-2 sm:grid-cols-2 pr-2">
            {disabilityCategories.map(category => (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm
                  ${categories.includes(category.id as DisabilityCategory)
                    ? 'bg-amber-200 border-2 border-amber-500'
                    : 'bg-amber-50 border border-stone-300 hover:bg-amber-100'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium">{category.label}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Privacy and consent note */}
        <div className="text-xs text-stone-500 italic text-center space-y-1">
          <p>Nothing saved as personal information. These only shape your support.</p>
          <p className="text-stone-400">You don't have to answer everything today. You can pause, skip, or come back later.</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/who-model')}
            className="flex-1 h-9 bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={categories.length === 0}
            className="flex-1 h-9 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </SAIAnchoredLayout>
  );
}
