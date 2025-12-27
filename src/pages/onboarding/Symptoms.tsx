import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSAI } from '@/contexts/SAIContext';
import { symptomsList } from '@/data/saiCategories';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PaperTestForm } from '@/components/onboarding/PaperTestForm';
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
            What symptoms do you experience? This helps me understand how to pace our time together:
          </p>
          {symptoms.length > 0 && (
            <p className="text-sm text-stone-500">{symptoms.length} selected</p>
          )}
        </div>

        {/* Options */}
        <ScrollArea className="max-h-[280px]">
          <div className="grid gap-2 pr-2">
            {symptomsList.map(symptom => (
              <div
                key={symptom.id}
                onClick={() => toggleSymptom(symptom.id)}
                className={`
                  flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                  ${symptoms.includes(symptom.id)
                    ? 'bg-amber-200 border-2 border-amber-500'
                    : 'bg-amber-50 border border-stone-300 hover:bg-amber-100'
                  }
                `}
              >
                <span className="text-stone-800 text-sm font-medium">{symptom.label}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Privacy note */}
        <p className="text-xs text-stone-500 italic text-center">
          Nothing here is saved as personal information. Staff see progress percentages only.
        </p>

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate('/onboarding/conditions')}
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
