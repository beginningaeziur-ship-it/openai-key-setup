import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OnboardingProgress } from '@/components/sai/OnboardingProgress';
import { SelectableCard } from '@/components/sai/SelectableCard';
import { useSAI } from '@/contexts/SAIContext';
import { 
  whoBodyFunctions, 
  whoActivityLimitations, 
  whoParticipationRestrictions, 
  whoEnvironmentalBarriers 
} from '@/data/saiCategories';
import { ArrowLeft, ArrowRight, Brain, Activity, Users, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WHOModel() {
  const navigate = useNavigate();
  const { whoModel, setWHOModel, setOnboardingStep } = useSAI();
  
  const [bodyFunctions, setBodyFunctions] = useState<string[]>(whoModel?.bodyFunctions || []);
  const [activityLimitations, setActivityLimitations] = useState<string[]>(whoModel?.activityLimitations || []);
  const [participationRestrictions, setParticipationRestrictions] = useState<string[]>(whoModel?.participationRestrictions || []);
  const [environmentalBarriers, setEnvironmentalBarriers] = useState<string[]>(whoModel?.environmentalBarriers || []);
  
  const [activeTab, setActiveTab] = useState('body');

  const toggleSelection = (
    id: string, 
    current: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (current.includes(id)) {
      setter(current.filter(item => item !== id));
    } else {
      setter([...current, id]);
    }
  };

  const handleNext = () => {
    setWHOModel({
      bodyFunctions,
      activityLimitations,
      participationRestrictions,
      environmentalBarriers,
    });
    setOnboardingStep(4);
    navigate('/onboarding/categories');
  };

  const categories = [
    { id: 'body', label: 'Body', icon: Brain, items: whoBodyFunctions, selected: bodyFunctions, setter: setBodyFunctions },
    { id: 'activity', label: 'Activities', icon: Activity, items: whoActivityLimitations, selected: activityLimitations, setter: setActivityLimitations },
    { id: 'participation', label: 'Participation', icon: Users, items: whoParticipationRestrictions, selected: participationRestrictions, setter: setParticipationRestrictions },
    { id: 'environment', label: 'Environment', icon: Building, items: whoEnvironmentalBarriers, selected: environmentalBarriers, setter: setEnvironmentalBarriers },
  ];

  const descriptions: Record<string, { title: string; desc: string }> = {
    body: { 
      title: 'Body Functions', 
      desc: 'Things happening inside you — conditions, how your brain or body works differently.' 
    },
    activity: { 
      title: 'Activity Limitations', 
      desc: 'Things that are harder for you to do — daily tasks, focusing, organizing.' 
    },
    participation: { 
      title: 'Participation Restrictions', 
      desc: 'Things that make it harder to be part of life — work, school, social situations.' 
    },
    environment: { 
      title: 'Environmental Barriers', 
      desc: 'Things around you that create challenges — housing, relationships, systems.' 
    },
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-2xl mx-auto">
        <OnboardingProgress currentStep={3} totalSteps={7} />
        
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Tell me about your challenges
            </h1>
            <p className="text-lg text-muted-foreground">
              Check all that apply. This helps me understand how to support you best.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat.id} 
                  value={cat.id}
                  className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-card rounded-lg"
                >
                  <cat.icon className="w-5 h-5" />
                  <span className="text-xs">{cat.label}</span>
                  {cat.selected.length > 0 && (
                    <span className="text-xs bg-primary/20 text-primary px-2 rounded-full">
                      {cat.selected.length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="mt-6">
                <div className="bg-card rounded-2xl p-6 shadow-sm border border-border space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-display font-semibold text-foreground">
                      {descriptions[cat.id].title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {descriptions[cat.id].desc}
                    </p>
                  </div>

                  <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {cat.items.map(item => (
                      <SelectableCard
                        key={item.id}
                        id={item.id}
                        label={item.label}
                        selected={cat.selected.includes(item.id)}
                        onSelect={(id) => toggleSelection(id, cat.selected, cat.setter)}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/onboarding/user-info')}
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
