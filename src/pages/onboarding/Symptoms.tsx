import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { symptomsList } from '@/data/saiCategories';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Symptoms() {
  const navigate = useNavigate();
  const { selectedSymptoms, setSelectedSymptoms } = useSAI();
  
  const [symptoms, setSymptoms] = useState<string[]>(
    selectedSymptoms.flatMap(s => s.symptoms)
  );

  const toggleSymptom = (id: string) => {
    if (symptoms.includes(id)) {
      setSymptoms(symptoms.filter(s => s !== id));
    } else {
      setSymptoms([...symptoms, id]);
    }
  };

  const handleNext = () => {
    setSelectedSymptoms([{ condition: 'general', symptoms }]);
    navigate('/onboarding/preferences');
  };

  return (
    <OnboardingLayout 
      saiMessage={`What symptoms do you experience? This helps me understand how to pace our time together. ${symptoms.length > 0 ? `${symptoms.length} selected.` : ''}`}
      saiState="attentive"
    >
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 -mx-2 px-2">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-2">
              {symptomsList.map(symptom => (
                <SelectableCard
                  key={symptom.id}
                  id={symptom.id}
                  label={symptom.label}
                  selected={symptoms.includes(symptom.id)}
                  onSelect={toggleSymptom}
                />
              ))}
            </div>
          </div>

          {/* Privacy notes */}
          <div className="mt-4 space-y-2">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/60 text-xs text-center">
                Nothing here is saved as personal information. Staff see progress percentages only.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex gap-3 pt-4 shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/conditions')}
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
