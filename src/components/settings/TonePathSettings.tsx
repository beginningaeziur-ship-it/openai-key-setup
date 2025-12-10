// Tone/Path Settings Component for Settings page
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSupportMap } from '@/contexts/SupportMapContext';
import { Heart, MessageCircle, Zap } from 'lucide-react';

const paths = [
  {
    id: 'gentle',
    label: 'Gentle',
    description: 'Grounding, simple, slow, reassuring. Best when overwhelmed.',
    icon: Heart,
    color: 'text-pink-500',
  },
  {
    id: 'honest',
    label: 'Honest',
    description: 'Clear, supportive, reality-based. Helps with decisions.',
    icon: MessageCircle,
    color: 'text-blue-500',
  },
  {
    id: 'direct',
    label: 'Direct',
    description: 'Firm, protective, structured. When you need action.',
    icon: Zap,
    color: 'text-amber-500',
  },
];

export function TonePathSettings() {
  const { supportMap, updateAdaptations } = useSupportMap();
  const currentTone = supportMap.adaptations.tonePreference;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          SAI Response Style
        </CardTitle>
        <CardDescription>
          Choose how SAI communicates with you. This can be overridden when needed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={currentTone}
          onValueChange={(value) => updateAdaptations({ tonePreference: value as 'gentle' | 'honest' | 'direct' })}
          className="space-y-3"
        >
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <div key={path.id} className="relative">
                <RadioGroupItem
                  value={path.id}
                  id={path.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={path.id}
                  className="flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                    peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5
                    hover:bg-muted/50"
                >
                  <Icon className={`w-5 h-5 mt-0.5 ${path.color}`} />
                  <div className="flex-1">
                    <span className="font-medium block">{path.label}</span>
                    <span className="text-sm text-muted-foreground">{path.description}</span>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
        
        <p className="text-xs text-muted-foreground mt-4">
          Note: SAI will automatically switch to Gentle mode if it detects high distress,
          regardless of this setting.
        </p>
      </CardContent>
    </Card>
  );
}
