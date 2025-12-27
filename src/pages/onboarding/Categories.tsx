import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { disabilityCategories } from '@/data/saiCategories';
import type { DisabilityCategory } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PaperTestForm } from '@/components/onboarding/PaperTestForm';
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
        <div className="space-y-2">
          <p className="text-stone-700 font-medium">
            What are you living with? Select all that apply:
          </p>
          {categories.length > 0 && (
            <p className="text-sm text-stone-500">{categories.length} selected</p>
          )}
        </div>

        {/* Options */}
        <ScrollArea className="max-h-[300px]">
          <div className="grid gap-2 sm:grid-cols-2 pr-2">
            {disabilityCategories.map(category => (
              <div
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                  ${categories.includes(category.id as DisabilityCategory)
                    ? 'bg-amber-200 border-2 border-amber-500'
                    : 'bg-amber-50 border border-stone-300 hover:bg-amber-100'
                  }
                `}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-stone-800 text-sm font-medium">{category.label}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Privacy note */}
        <p className="text-xs text-stone-500 italic text-center">
          Nothing here is saved as personal information. These selections only shape your support structure.
        </p>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/who-model')}
            className="flex-1 h-10 bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={categories.length === 0}
            className="flex-1 h-10 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </PaperTestForm>
  );
}
