import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { symptomsList } from '@/data/saiCategories';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SAIAnchoredLayout } from '@/components/onboarding/SAIAnchoredLayout';
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
    <SAIAnchoredLayout 
      saiMessage="What symptoms do you experience? This helps me understand how to pace our time together."
      saiState="attentive"
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
            Select the symptoms you experience:
          </p>
          {symptoms.length > 0 && (
            <p className="text-xs text-stone-500">{symptoms.length} selected</p>
          )}
        </div>

        {/* Options */}
        <ScrollArea className="max-h-[180px]">
          <div className="grid gap-2 pr-2">
            {symptomsList.map(symptom => (
              <div
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all text-sm
                  ${symptoms.includes(symptom.id)
                    ? 'bg-amber-200 border-2 border-amber-500'
                    : 'bg-amber-50 border border-stone-300 hover:bg-amber-100'
                  }
                `}
              >
                <span className="font-medium">{symptom.label}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Privacy and consent note */}
        <div className="text-xs text-stone-500 italic text-center space-y-1">
          <p>Nothing saved as personal information. Staff see progress percentages only.</p>
          <p className="text-stone-400">You're in control of the pace. Skipping is always okay.</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/conditions')}
            className="flex-1 h-9 bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
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
