// Clock Panel - Time & Reminders
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useVoiceSettings } from '@/contexts/VoiceSettingsContext';
import { Clock, Plus, Pill, Calendar, Bell, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClockPanelProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

interface Reminder {
  id: string;
  label: string;
  time: string;
  type: 'appointment' | 'medication' | 'deadline' | 'general';
}

const typeIcons = {
  appointment: Calendar,
  medication: Pill,
  deadline: Clock,
  general: Bell,
};

export function ClockPanel({ open, onClose, userName = 'Friend' }: ClockPanelProps) {
  const { speak, voiceEnabled } = useVoiceSettings();
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', label: 'Morning medication', time: '8:00 AM', type: 'medication' },
    { id: '2', label: 'Drink water', time: '10:00 AM', type: 'general' },
  ]);
  const [newReminder, setNewReminder] = useState('');
  const [newTime, setNewTime] = useState('');

  const addReminder = () => {
    if (!newReminder.trim()) return;
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      label: newReminder,
      time: newTime || 'No time set',
      type: 'general',
    };
    
    setReminders([...reminders, reminder]);
    setNewReminder('');
    setNewTime('');
    
    if (voiceEnabled) {
      speak("Reminder added. I'll help you remember.");
    }
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <SheetTitle>Time & Reminders</SheetTitle>
              <SheetDescription>
                Appointments, medications, and important deadlines
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Add new reminder */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="What do you need to remember?"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addReminder} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reminder list */}
        <div className="space-y-3">
          {reminders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No reminders yet. Add one above.
            </p>
          ) : (
            reminders.map((reminder) => {
              const Icon = typeIcons[reminder.type];
              
              return (
                <Card key={reminder.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{reminder.label}</p>
                        <p className="text-sm text-muted-foreground">{reminder.time}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeReminder(reminder.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Info */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-xs text-muted-foreground text-center">
            I'll help you remember what matters. Nothing sneaks up on you.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
