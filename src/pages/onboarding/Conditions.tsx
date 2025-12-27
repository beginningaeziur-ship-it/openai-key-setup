import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { conditionsByCategory, disabilityCategories } from '@/data/saiCategories';
import type { ConditionSelection } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
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
    <OnboardingLayout 
      saiMessage={`Let's get more specific. Expand each category and select what applies. ${totalSelected > 0 ? `${totalSelected} selected so far.` : ''}`}
      saiState="attentive"
    >
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
            <Accordion type="multiple" className="w-full">
              {selectedCategories.map(categoryId => (
                <AccordionItem key={categoryId} value={categoryId} className="border-white/10">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/5 text-white">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(categoryId)}</span>
                      <span className="font-medium text-sm">{getCategoryLabel(categoryId)}</span>
                      {conditions.find(c => c.category === categoryId) && (
                        <span className="text-xs bg-primary/30 text-primary px-2 py-0.5 rounded-full">
                          {conditions.find(c => c.category === categoryId)?.conditions.length}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-3">
                    <div className="grid gap-2">
                      {conditionsByCategory[categoryId]?.map(condition => (
                        <SelectableCard
                          key={condition.id}
                          id={condition.id}
                          label={condition.label}
                          selected={isConditionSelected(categoryId, condition.id)}
                          onSelect={() => toggleCondition(categoryId, condition.id)}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/categories')}
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
