import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { symptomsList } from '@/data/saiCategories';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
    // Store as a general symptom mapping
    setSelectedSymptoms([{ condition: 'general', symptoms }]);
    navigate('/onboarding/goals');
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={6} totalSteps={7} />
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              What symptoms do you experience?
            </h1>
            <p className="text-lg text-muted-foreground">
              This helps me understand how to pace our conversations and what to watch for.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="grid gap-2 max-h-[450px] overflow-y-auto pr-2">
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

          <div className="bg-sai-lavender/50 rounded-xl p-4 border border-sai-lavender-dark/20">
            <p className="text-sm text-foreground">
              <strong>This stays private.</strong> I use this information to adapt how I talk to you, 
              not to share with anyone else. Professionals only see category-level information.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/conditions')}
              className="flex-1 h-12 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
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
