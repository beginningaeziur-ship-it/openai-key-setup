import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  MessageCircle, 
  Heart,
  Shield,
  Sparkles,
  Volume2,
  Clock,
  Save,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SAIAdaptations {
  communicationStyle: 'gentle' | 'direct' | 'playful';
  responseLength: number; // 1-5 (brief to detailed)
  checkInFrequency: 'rarely' | 'sometimes' | 'often';
  sensitivityFlags: {
    trauma: boolean;
    anxiety: boolean;
    isolation: boolean;
    grief: boolean;
  };
  useAffirmations: boolean;
  useHumor: boolean;
  pauseBeforeTopics: boolean;
}

const STORAGE_KEY = 'sai_adaptations';

const COMMUNICATION_STYLES = [
  { value: 'gentle', label: 'Gentle', description: 'Soft, slow, very patient' },
  { value: 'direct', label: 'Direct', description: 'Clear, to the point' },
  { value: 'playful', label: 'Playful', description: 'Lighter tone, occasional humor' },
] as const;

const CHECK_IN_OPTIONS = [
  { value: 'rarely', label: 'Rarely', description: 'Only when I ask' },
  { value: 'sometimes', label: 'Sometimes', description: 'A few times a day' },
  { value: 'often', label: 'Often', description: 'Regular check-ins' },
] as const;

export function SAIAdaptationControls() {
  const { toast } = useToast();
  
  const [adaptations, setAdaptations] = useState<SAIAdaptations>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      communicationStyle: 'gentle',
      responseLength: 2,
      checkInFrequency: 'sometimes',
      sensitivityFlags: {
        trauma: false,
        anxiety: false,
        isolation: false,
        grief: false,
      },
      useAffirmations: true,
      useHumor: false,
      pauseBeforeTopics: true,
    };
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(true);
  }, [adaptations]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(adaptations));
    setHasChanges(false);
    toast({
      title: 'Adaptations saved',
      description: 'SAI will adjust to your preferences.',
    });
  };

  const handleReset = () => {
    const defaults: SAIAdaptations = {
      communicationStyle: 'gentle',
      responseLength: 2,
      checkInFrequency: 'sometimes',
      sensitivityFlags: {
        trauma: false,
        anxiety: false,
        isolation: false,
        grief: false,
      },
      useAffirmations: true,
      useHumor: false,
      pauseBeforeTopics: true,
    };
    setAdaptations(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    toast({ description: 'SAI adaptations reset to defaults.' });
  };

  const toggleSensitivity = (flag: keyof SAIAdaptations['sensitivityFlags']) => {
    setAdaptations(prev => ({
      ...prev,
      sensitivityFlags: {
        ...prev.sensitivityFlags,
        [flag]: !prev.sensitivityFlags[flag]
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          SAI Adaptations
        </CardTitle>
        <CardDescription>
          Help SAI learn how to best support you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Communication Style */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Communication Style</span>
          </div>
          <RadioGroup
            value={adaptations.communicationStyle}
            onValueChange={(value: 'gentle' | 'direct' | 'playful') => 
              setAdaptations(prev => ({ ...prev, communicationStyle: value }))
            }
            className="grid grid-cols-3 gap-2"
          >
            {COMMUNICATION_STYLES.map((style) => (
              <Label
                key={style.value}
                htmlFor={style.value}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer transition-all",
                  adaptations.communicationStyle === style.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <RadioGroupItem value={style.value} id={style.value} className="sr-only" />
                <span className="font-medium text-sm">{style.label}</span>
                <span className="text-xs text-muted-foreground text-center">{style.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Response Length */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Response Length</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {adaptations.responseLength <= 2 ? 'Brief' : adaptations.responseLength >= 4 ? 'Detailed' : 'Moderate'}
            </span>
          </div>
          <Slider
            value={[adaptations.responseLength]}
            onValueChange={([value]) => setAdaptations(prev => ({ ...prev, responseLength: value }))}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Just the essentials</span>
            <span>Full explanations</span>
          </div>
        </div>

        {/* Check-in Frequency */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Check-in Frequency</span>
          </div>
          <RadioGroup
            value={adaptations.checkInFrequency}
            onValueChange={(value: 'rarely' | 'sometimes' | 'often') => 
              setAdaptations(prev => ({ ...prev, checkInFrequency: value }))
            }
            className="space-y-2"
          >
            {CHECK_IN_OPTIONS.map((option) => (
              <Label
                key={option.value}
                htmlFor={`checkin-${option.value}`}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                  adaptations.checkInFrequency === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div>
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">{option.description}</span>
                </div>
                <RadioGroupItem value={option.value} id={`checkin-${option.value}`} />
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Sensitivity Flags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sensitivity Awareness</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Help SAI be more careful around these topics
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(adaptations.sensitivityFlags).map(([flag, enabled]) => (
              <button
                key={flag}
                onClick={() => toggleSensitivity(flag as keyof SAIAdaptations['sensitivityFlags'])}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  enabled
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-sm font-medium capitalize">{flag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Use Affirmations
              </span>
              <p className="text-xs text-muted-foreground">Include encouraging words</p>
            </div>
            <Switch
              checked={adaptations.useAffirmations}
              onCheckedChange={(checked) => setAdaptations(prev => ({ ...prev, useAffirmations: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Allow Light Humor
              </span>
              <p className="text-xs text-muted-foreground">Occasional gentle humor when appropriate</p>
            </div>
            <Switch
              checked={adaptations.useHumor}
              onCheckedChange={(checked) => setAdaptations(prev => ({ ...prev, useHumor: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Pause Before Sensitive Topics</span>
              <p className="text-xs text-muted-foreground">Ask permission before going deeper</p>
            </div>
            <Switch
              checked={adaptations.pauseBeforeTopics}
              onCheckedChange={(checked) => setAdaptations(prev => ({ ...prev, pauseBeforeTopics: checked }))}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={handleSave}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
