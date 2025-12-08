import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  X,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoCheckInProps {
  userName: string;
  saiName: string;
  onStartChat: () => void;
}

type CheckInTime = 'morning' | 'afternoon' | 'evening';

const getCheckInTime = (): CheckInTime => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const checkInMessages: Record<CheckInTime, string[]> = {
  morning: [
    "Good morning. How are you starting your day?",
    "Hey. Just checking in. How did you sleep?",
    "Morning. No rush, but I'm here when you're ready.",
  ],
  afternoon: [
    "Hey. How's your day going so far?",
    "Just a gentle check-in. You okay?",
    "Afternoon. How are you holding up?",
  ],
  evening: [
    "Evening. How was your day?",
    "Hey. Winding down? How are you feeling?",
    "Just checking in before the day ends.",
  ],
};

const getTimeIcon = (time: CheckInTime) => {
  switch (time) {
    case 'morning': return <Sun className="w-5 h-5" />;
    case 'afternoon': return <Sunset className="w-5 h-5" />;
    case 'evening': return <Moon className="w-5 h-5" />;
  }
};

export function AutoCheckIn({ userName, saiName, onStartChat }: AutoCheckInProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [checkInTime, setCheckInTime] = useState<CheckInTime>(getCheckInTime());
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if we should show a check-in
    const lastCheckIn = localStorage.getItem('sai_last_checkin');
    const now = new Date();
    const currentTime = getCheckInTime();
    setCheckInTime(currentTime);

    // Pick a random message for this time of day
    const messages = checkInMessages[currentTime];
    setMessage(messages[Math.floor(Math.random() * messages.length)]);

    // Show check-in if none today or different time period
    if (!lastCheckIn) {
      setVisible(true);
    } else {
      const lastDate = new Date(lastCheckIn);
      const sameDay = lastDate.toDateString() === now.toDateString();
      if (!sameDay) {
        setVisible(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  const handleStartChat = () => {
    localStorage.setItem('sai_last_checkin', new Date().toISOString());
    onStartChat();
  };

  if (!visible || dismissed) return null;

  return (
    <Card className={cn(
      "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent",
      "sai-slide-up animate-in"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/20 text-primary">
            {getTimeIcon(checkInTime)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">{saiName} says:</p>
            <p className="text-muted-foreground">
              "{message.replace('you', userName)}"
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-4 ml-11">
          <Button 
            size="sm" 
            onClick={handleStartChat}
            className="gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Talk to {saiName}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDismiss}
          >
            I'm okay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}