import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSAI } from '@/contexts/SAIContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Target, 
  Gauge, 
  Zap, 
  Turtle,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoalSettings {
  intensity: number; // 1-5 scale
  goalSize: 'micro' | 'small' | 'medium';
  pacingSpeed: number; // 1-5 scale
  challengeMode: boolean;
  gentleReminders: boolean;
}

const INTENSITY_LABELS = ['Very Gentle', 'Gentle', 'Balanced', 'Encouraging', 'Challenging'];
const PACING_LABELS = ['Very Slow', 'Slow', 'Moderate', 'Steady', 'Active'];
const GOAL_SIZE_OPTIONS = [
  { value: 'micro', label: 'Micro Goals', description: 'Tiny wins, one at a time' },
  { value: 'small', label: 'Small Goals', description: 'Manageable daily tasks' },
  { value: 'medium', label: 'Medium Goals', description: 'Weekly achievements' },
] as const;

const STORAGE_KEY = 'sai_goal_settings';

export function GoalAdjustmentPanel() {
  const { toast } = useToast();
  const { userProfile } = useSAI();
  
  const [settings, setSettings] = useState<GoalSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      intensity: 2,
      goalSize: 'small',
      pacingSpeed: 2,
      challengeMode: false,
      gentleReminders: true,
    };
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(true);
  }, [settings]);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: 'Settings saved',
      description: 'Your goal preferences have been updated.',
    });
  };

  const handleReset = () => {
    const defaults: GoalSettings = {
      intensity: 2,
      goalSize: 'small',
      pacingSpeed: 2,
      challengeMode: false,
      gentleReminders: true,
    };
    setSettings(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    toast({
      description: 'Goal settings reset to defaults.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Goal Adjustments
        </CardTitle>
        <CardDescription>
          Customize how SAI helps you work toward your goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intensity Dial */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Intensity</span>
            </div>
            <span className="text-sm text-primary font-medium">
              {INTENSITY_LABELS[settings.intensity - 1]}
            </span>
          </div>
          <Slider
            value={[settings.intensity]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, intensity: value }))}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Gentle</span>
            <span>Challenging</span>
          </div>
        </div>

        {/* Goal Size Selection */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Goal Size Preference</span>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_SIZE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings(prev => ({ ...prev, goalSize: option.value }))}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  settings.goalSize === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="text-sm font-medium block">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pacing Speed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Turtle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Pacing</span>
            </div>
            <span className="text-sm text-primary font-medium">
              {PACING_LABELS[settings.pacingSpeed - 1]}
            </span>
          </div>
          <Slider
            value={[settings.pacingSpeed]}
            onValueChange={([value]) => setSettings(prev => ({ ...prev, pacingSpeed: value }))}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Take my time</span>
            <span>Keep me moving</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Challenge Mode
              </span>
              <p className="text-xs text-muted-foreground">Push me a little harder</p>
            </div>
            <Switch
              checked={settings.challengeMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, challengeMode: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Gentle Reminders
              </span>
              <p className="text-xs text-muted-foreground">Soft nudges, no pressure</p>
            </div>
            <Switch
              checked={settings.gentleReminders}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, gentleReminders: checked }))}
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
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
