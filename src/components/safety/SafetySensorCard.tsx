import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Activity, 
  Moon, 
  Droplets,
  AlertCircle,
  Bluetooth,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorStatus {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  value?: string;
  status: 'normal' | 'attention' | 'alert';
}

interface SafetySensorCardProps {
  showForConditions: string[];
}

export function SafetySensorCard({ showForConditions }: SafetySensorCardProps) {
  const [sensors, setSensors] = useState<SensorStatus[]>([
    { 
      id: 'heart_rate', 
      name: 'Heart Rate', 
      icon: <Heart className="w-4 h-4" />, 
      connected: false,
      status: 'normal'
    },
    { 
      id: 'glucose', 
      name: 'Glucose Monitor', 
      icon: <Droplets className="w-4 h-4" />, 
      connected: false,
      status: 'normal'
    },
    { 
      id: 'sleep', 
      name: 'Sleep Tracker', 
      icon: <Moon className="w-4 h-4" />, 
      connected: false,
      status: 'normal'
    },
    { 
      id: 'activity', 
      name: 'Activity Monitor', 
      icon: <Activity className="w-4 h-4" />, 
      connected: false,
      status: 'normal'
    },
  ]);

  // Only show if user has relevant conditions
  const relevantConditions = [
    'epilepsy', 'diabetes', 'panic_disorder', 'dissociative',
    'heart_condition', 'cfs', 'sleep_issues'
  ];
  
  const shouldShow = showForConditions.some(c => relevantConditions.includes(c));
  
  if (!shouldShow) return null;

  const handleConnect = (sensorId: string) => {
    setSensors(prev => prev.map(s => 
      s.id === sensorId 
        ? { ...s, connected: !s.connected, value: s.connected ? undefined : 'Syncing...' }
        : s
    ));
  };

  const getStatusColor = (status: SensorStatus['status']) => {
    switch (status) {
      case 'normal': return 'text-progress-stable';
      case 'attention': return 'text-progress-attention';
      case 'alert': return 'text-progress-support';
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Safety Sensors
          <Badge variant="outline" className="ml-auto text-xs">Optional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Connect health sensors for grounding prompts. Data is never stored.
        </p>
        
        <div className="space-y-2">
          {sensors.map(sensor => (
            <div 
              key={sensor.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg bg-muted/50",
                sensor.connected && "bg-primary/5 border border-primary/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  sensor.connected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {sensor.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{sensor.name}</p>
                  {sensor.connected && sensor.value && (
                    <p className={cn("text-xs", getStatusColor(sensor.status))}>
                      {sensor.value}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant={sensor.connected ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleConnect(sensor.id)}
                className="gap-1"
              >
                {sensor.connected ? (
                  <>
                    <Check className="w-3 h-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <Bluetooth className="w-3 h-3" />
                    Pair
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>
            Sensors help Cy prompt grounding exercises or reminders like "check your sugar" 
            during detected stress. No health data is stored or shared.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}