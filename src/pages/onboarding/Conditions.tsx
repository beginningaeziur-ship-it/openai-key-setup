import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { useMicrophone } from '@/contexts/MicrophoneContext';
import { conditionsByCategory, disabilityCategories } from '@/data/saiCategories';
import type { ConditionSelection } from '@/types/sai';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Conditions() {
  const navigate = useNavigate();
  const { selectedCategories, selectedConditions, setSelectedConditions, setOnboardingStep } = useSAI();
  const { lastTranscript, clearTranscript, isMicEnabled } = useMicrophone();
  
  const [conditions, setConditions] = useState<ConditionSelection[]>(selectedConditions);

  // Voice command handling
  useEffect(() => {
    if (!lastTranscript || !isMicEnabled) return;
    
    const lower = lastTranscript.toLowerCase();
    
    // Check for navigation commands
    if (lower.includes('next') || lower.includes('continue') || lower.includes('enter') || lower.includes('done')) {
      clearTranscript();
      handleNext();
      return;
    }
    
    if (lower.includes('back') || lower.includes('previous')) {
      clearTranscript();
      navigate('/onboarding/categories');
      return;
    }
    
    // Check for condition selection by name
    selectedCategories.forEach(categoryId => {
      const categoryConditions = conditionsByCategory[categoryId] || [];
      categoryConditions.forEach(condition => {
        const conditionName = condition.label.toLowerCase();
        if (lower.includes(conditionName)) {
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
        // Remove condition
        const updated = existing.conditions.filter(c => c !== conditionId);
        if (updated.length === 0) {
          setConditions(conditions.filter(c => c.category !== category));
        } else {
          setConditions(conditions.map(c => 
            c.category === category ? { ...c, conditions: updated } : c
          ));
        }
      } else {
        // Add condition
        setConditions(conditions.map(c => 
          c.category === category 
            ? { ...c, conditions: [...c.conditions, conditionId] } 
            : c
        ));
      }
    } else {
      // New category
      setConditions([...conditions, { category: category as any, conditions: [conditionId] }]);
    }
  };

  const isConditionSelected = (category: string, conditionId: string) => {
    const cat = conditions.find(c => c.category === category);
    return cat?.conditions.includes(conditionId) || false;
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

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={5} totalSteps={9} />
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Let's get specific
            </h1>
            <p className="text-lg text-muted-foreground">
              Select the specific conditions within each category.
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <Accordion type="multiple" className="w-full">
              {selectedCategories.map(categoryId => (
                <AccordionItem key={categoryId} value={categoryId}>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(categoryId)}</span>
                      <span className="font-display font-medium">
                        {getCategoryLabel(categoryId)}
                      </span>
                      {conditions.find(c => c.category === categoryId) && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {conditions.find(c => c.category === categoryId)?.conditions.length} selected
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/categories')}
              className="flex-1 h-12 rounded-xl"
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
  );
}
