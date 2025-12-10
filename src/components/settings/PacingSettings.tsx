// Pacing Settings Component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSupportMap } from '@/contexts/SupportMapContext';
import { Turtle, Rabbit, Snail } from 'lucide-react';

const pacingOptions = [
  {
    id: 'slow',
    label: 'Slow',
    description: 'Extra time between messages. More pauses.',
    icon: Snail,
  },
  {
    id: 'normal',
    label: 'Normal',
    description: 'Standard conversational pace.',
    icon: Turtle,
  },
  {
    id: 'fast',
    label: 'Fast',
    description: 'Quick responses. Minimal pauses.',
    icon: Rabbit,
  },
];

export function PacingSettings() {
  const { supportMap, updateAdaptations } = useSupportMap();
  const currentPacing = supportMap.adaptations.pacingPreference;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Turtle className="w-5 h-5" />
          Conversation Pacing
        </CardTitle>
        <CardDescription>
          How quickly SAI responds and moves through topics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={currentPacing}
          onValueChange={(value) => updateAdaptations({ pacingPreference: value as 'slow' | 'normal' | 'fast' })}
          className="grid grid-cols-3 gap-3"
        >
          {pacingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.id} className="relative">
                <RadioGroupItem
                  value={option.id}
                  id={`pacing-${option.id}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`pacing-${option.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all text-center
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                    hover:bg-muted/50"
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-sm">{option.label}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
