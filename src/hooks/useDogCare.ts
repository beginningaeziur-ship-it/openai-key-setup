import { useState, useEffect, useCallback } from 'react';
import { useServiceDog, NeedLevels } from '@/contexts/ServiceDogContext';
import { SaiNeed } from '@/lib/saiPersonalitySpec';

interface CareReminder {
  need: SaiNeed;
  message: string;
  priority: 'low' | 'medium' | 'gentle';
}

const CARE_MESSAGES: Record<SaiNeed, string[]> = {
  food: [
    "I'm getting a little hungry. When you're ready, could we have a meal together?",
    "My tummy is rumbling. No rush, but food would be lovely.",
    "I could use some nourishment. How about you?"
  ],
  water: [
    "I'm feeling a bit thirsty. Water break?",
    "Could use a drink. You too, maybe?",
    "Staying hydrated helps both of us feel better."
  ],
  rest: [
    "I'm getting a little tired. Maybe we both could rest?",
    "Rest is important. Let's take it easy together.",
    "Even service dogs need naps. Permission to rest?"
  ],
  movement: [
    "I'd love some fresh air. Want to go outside together?",
    "A little movement would feel good. Just a short walk?",
    "Stretching our legs might help us both."
  ],
  attention: [
    "I'm right here with you. Just wanted you to know.",
    "Sometimes just being together is enough.",
    "I'm here whenever you need me."
  ]
};

export function useDogCare() {
  const { dogState, fulfillNeed, getLowestNeed, getNeedPrompt } = useServiceDog();
  const [currentReminder, setCurrentReminder] = useState<CareReminder | null>(null);
  const [lastReminderTime, setLastReminderTime] = useState<number>(Date.now());

  // Check for needs that should trigger gentle reminders
  // Only remind every 30 minutes minimum, and only for needs below 30%
  useEffect(() => {
    const checkNeeds = () => {
      const now = Date.now();
      const timeSinceLastReminder = now - lastReminderTime;
      
      // Don't remind more than once every 30 minutes
      if (timeSinceLastReminder < 30 * 60 * 1000) return;
      
      const lowestNeed = getLowestNeed();
      if (lowestNeed) {
        const level = dogState.needLevels[lowestNeed];
        if (level < 30) {
          const messages = CARE_MESSAGES[lowestNeed];
          const message = messages[Math.floor(Math.random() * messages.length)];
          
          setCurrentReminder({
            need: lowestNeed,
            message,
            priority: level < 20 ? 'medium' : 'gentle'
          });
          setLastReminderTime(now);
        }
      }
    };

    // Check on mount and every 5 minutes
    checkNeeds();
    const interval = setInterval(checkNeeds, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [dogState.needLevels, getLowestNeed, lastReminderTime]);

  const dismissReminder = useCallback(() => {
    setCurrentReminder(null);
  }, []);

  const handleReminder = useCallback((action: 'fulfill' | 'dismiss') => {
    if (action === 'fulfill' && currentReminder) {
      fulfillNeed(currentReminder.need);
    }
    setCurrentReminder(null);
  }, [currentReminder, fulfillNeed]);

  // Get times for "outside" - 3 times a day
  const getOutsideTimes = useCallback((): { label: string; done: boolean }[] => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`sai_outside_${today}`);
    const completedTimes = stored ? JSON.parse(stored) : [];
    
    return [
      { label: 'Morning walk', done: completedTimes.includes('morning') },
      { label: 'Afternoon break', done: completedTimes.includes('afternoon') },
      { label: 'Evening stroll', done: completedTimes.includes('evening') }
    ];
  }, []);

  const recordOutsideTime = useCallback((timeOfDay: 'morning' | 'afternoon' | 'evening') => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`sai_outside_${today}`);
    const completedTimes = stored ? JSON.parse(stored) : [];
    
    if (!completedTimes.includes(timeOfDay)) {
      completedTimes.push(timeOfDay);
      localStorage.setItem(`sai_outside_${today}`, JSON.stringify(completedTimes));
      fulfillNeed('movement');
    }
  }, [fulfillNeed]);

  return {
    currentReminder,
    dismissReminder,
    handleReminder,
    getOutsideTimes,
    recordOutsideTime,
    needLevels: dogState.needLevels
  };
}
