// Self-Start Routines Settings Component
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useSelfStart, type RoutineType } from '@/contexts/SelfStartContext';
import { 
  Sun, 
  Moon, 
  Wind, 
  Droplets, 
  Pill, 
  ListTodo, 
  Target,
  Bell,
  BellOff
} from 'lucide-react';

const routineInfo: Record<RoutineType, { label: string; icon: typeof Sun; description: string }> = {
  'morning-checkin': {
    label: 'Morning Check-in',
    icon: Sun,
    description: 'Start your day with a gentle check-in',
  },
  'evening-grounding': {
    label: 'Evening Grounding',
    icon: Moon,
    description: 'Wind down with grounding before rest',
  },
  'micro-grounding': {
    label: 'Hourly Breathing',
    icon: Wind,
    description: 'Quick breathing reminders throughout the day',
  },
  'hydration': {
    label: 'Hydration Reminders',
    icon: Droplets,
    description: 'Gentle reminders to drink water',
  },
  'medication': {
    label: 'Medication Reminder',
    icon: Pill,
    description: 'Daily medication reminders',
  },
  'task-reminder': {
    label: 'Task Check-ins',
    icon: ListTodo,
    description: 'Periodic reminders about daily tasks',
  },
  'goal-reminder': {
    label: 'Goal Reminders',
    icon: Target,
    description: 'Encouragement about your goals',
  },
  'distress-triggered': {
    label: 'Distress Detection',
    icon: Bell,
    description: 'Auto check-in when distress is detected',
  },
};

export function SelfStartSettings() {
  const { 
    routines, 
    toggleRoutine, 
    updateRoutineTime, 
    updateRoutineInterval,
    globalEnabled,
    setGlobalEnabled 
  } = useSelfStart();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {globalEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            Self-Start Routines
          </CardTitle>
          <Switch
            checked={globalEnabled}
            onCheckedChange={setGlobalEnabled}
          />
        </div>
        <CardDescription>
          {globalEnabled 
            ? 'SAI will check in with you automatically' 
            : 'All automatic check-ins are paused'}
        </CardDescription>
      </CardHeader>
      
      {globalEnabled && (
        <CardContent className="space-y-4">
          {routines.map((routine) => {
            const info = routineInfo[routine.type];
            if (!info) return null;
            const Icon = info.icon;
            
            return (
              <div key={routine.id} className="space-y-2 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor={routine.id} className="font-medium">
                      {info.label}
                    </Label>
                  </div>
                  <Switch
                    id={routine.id}
                    checked={routine.enabled}
                    onCheckedChange={() => toggleRoutine(routine.type)}
                  />
                </div>
                
                <p className="text-xs text-muted-foreground pl-6">
                  {info.description}
                </p>
                
                {routine.enabled && (
                  <div className="pl-6 pt-2 space-y-2">
                    {routine.time !== undefined && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs w-16">Time:</Label>
                        <Input
                          type="time"
                          value={routine.time}
                          onChange={(e) => updateRoutineTime(routine.type, e.target.value)}
                          className="h-8 w-28"
                        />
                      </div>
                    )}
                    
                    {routine.intervalMinutes !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Every:</Label>
                          <span className="text-xs text-muted-foreground">
                            {routine.intervalMinutes} min
                          </span>
                        </div>
                        <Slider
                          value={[routine.intervalMinutes]}
                          onValueChange={([value]) => updateRoutineInterval(routine.type, value)}
                          min={15}
                          max={240}
                          step={15}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
