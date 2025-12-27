import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { conditionsByCategory, disabilityCategories } from '@/data/saiCategories';
import type { ConditionSelection } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PaperTestForm } from '@/components/onboarding/PaperTestForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Conditions() {
  const navigate = useNavigate();
  const { selectedCategories, selectedConditions, setSelectedConditions, setOnboardingStep } = useSAI();
  const { lastTranscript, clearTranscript, isMicEnabled } = useMicrophone();
  
  const [conditions, setConditions] = useState<ConditionSelection[]>(selectedConditions);

  useEffect(() => {
    if (!lastTranscript || !isMicEnabled) return;
    
    const lower = lastTranscript.toLowerCase();
    
    if (lower.includes('next') || lower.includes('continue') || lower.includes('done')) {
      clearTranscript();
      handleNext();
      return;
    }
    
    if (lower.includes('back')) {
      clearTranscript();
      navigate('/onboarding/categories');
      return;
    }
    
    selectedCategories.forEach(categoryId => {
      const categoryConditions = conditionsByCategory[categoryId] || [];
      categoryConditions.forEach(condition => {
        if (lower.includes(condition.label.toLowerCase())) {
          toggleCondition(categoryId, condition.id);
          clearTranscript();
        }
      });
    });
  }, [lastTranscript, isMicEnabled]);

  const toggleCondition = (category: string, conditionId: string) => {
    const existing = conditions.find(c => c.category === category);
    
    if (existing) {
      if (existing.conditions.includes(conditionId)) {
        const updated = existing.conditions.filter(c => c !== conditionId);
        if (updated.length === 0) {
          setConditions(conditions.filter(c => c.category !== category));
        } else {
          setConditions(conditions.map(c => 
            c.category === category ? { ...c, conditions: updated } : c
          ));
        }
      } else {
        setConditions(conditions.map(c => 
          c.category === category 
            ? { ...c, conditions: [...c.conditions, conditionId] } 
            : c
        ));
      }
    } else {
      setConditions([...conditions, { category: category as any, conditions: [conditionId] }]);
    }
  };

  const isConditionSelected = (category: string, conditionId: string) => {
    return conditions.find(c => c.category === category)?.conditions.includes(conditionId) || false;
  };

  const getCategoryLabel = (categoryId: string) => {
    return disabilityCategories.find(c => c.id === categoryId)?.label || categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    return disabilityCategories.find(c => c.id === categoryId)?.icon || '📋';
  };

  const handleNext = () => {
    setSelectedConditions(conditions);
    setOnboardingStep(6);
    navigate('/onboarding/symptoms');
  };

  const totalSelected = conditions.reduce((sum, c) => sum + c.conditions.length, 0);

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
            Let's get more specific. Expand each category and select what applies:
          </p>
          {totalSelected > 0 && (
            <p className="text-sm text-stone-500">{totalSelected} selected so far</p>
          )}
        </div>

        {/* Options */}
        <ScrollArea className="max-h-[300px]">
          <Accordion type="multiple" className="w-full">
            {selectedCategories.map(categoryId => (
              <AccordionItem key={categoryId} value={categoryId} className="border-stone-300">
                <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-amber-50 text-stone-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(categoryId)}</span>
                    <span className="font-medium text-sm">{getCategoryLabel(categoryId)}</span>
                    {conditions.find(c => c.category === categoryId) && (
                      <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                        {conditions.find(c => c.category === categoryId)?.conditions.length}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="grid gap-2">
                    {conditionsByCategory[categoryId]?.map(condition => (
                      <div
                        key={condition.id}
                        onClick={() => toggleCondition(categoryId, condition.id)}
                        className={`
                          flex items-center gap-3 p-2 rounded cursor-pointer transition-all text-sm
                          ${isConditionSelected(categoryId, condition.id)
                            ? 'bg-amber-200 border border-amber-500'
                            : 'bg-amber-50/50 border border-stone-200 hover:bg-amber-100'
                          }
                        `}
                      >
                        <span className="text-stone-800">{condition.label}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/categories')}
            className="flex-1 h-10 bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
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
