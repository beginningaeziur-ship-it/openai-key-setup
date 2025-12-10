// Self-Start Routines Context
// Manages automated check-ins, reminders, and triggered interventions

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { useSupportMap } from './SupportMapContext';

export type RoutineType = 
  | 'morning-checkin'
  | 'evening-grounding'
  | 'micro-grounding'
  | 'hydration'
  | 'medication'
  | 'task-reminder'
  | 'goal-reminder'
  | 'distress-triggered';

export interface ScheduledRoutine {
  id: string;
  type: RoutineType;
  enabled: boolean;
  time?: string; // HH:MM format for scheduled routines
  intervalMinutes?: number; // For periodic routines
  lastTriggered?: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface PendingRoutine {
  id: string;
  routine: ScheduledRoutine;
  triggeredAt: string;
  acknowledged: boolean;
}

interface SelfStartContextType {
  // Scheduled routines
  routines: ScheduledRoutine[];
  
  // Pending routines that need acknowledgment
  pendingRoutines: PendingRoutine[];
  
  // Actions
  enableRoutine: (type: RoutineType) => void;
  disableRoutine: (type: RoutineType) => void;
  toggleRoutine: (type: RoutineType) => void;
  updateRoutineTime: (type: RoutineType, time: string) => void;
  updateRoutineInterval: (type: RoutineType, minutes: number) => void;
  
  // Acknowledge/dismiss pending routines
  acknowledgePending: (id: string) => void;
  dismissPending: (id: string) => void;
  
  // Trigger routines manually or from distress detection
  triggerRoutine: (type: RoutineType, customMessage?: string) => void;
  triggerDistressCheckIn: (distressLevel: 'medium' | 'high') => void;
  
  // Settings
  globalEnabled: boolean;
  setGlobalEnabled: (enabled: boolean) => void;
  
  // Reset
  resetRoutines: () => void;
}

const STORAGE_KEY = 'sai_self_start';

const defaultRoutines: ScheduledRoutine[] = [
  {
    id: 'morning-checkin',
    type: 'morning-checkin',
    enabled: true,
    time: '08:00',
    message: "Good morning. How are you feeling as you start the day?",
    priority: 'medium',
  },
  {
    id: 'evening-grounding',
    type: 'evening-grounding',
    enabled: true,
    time: '21:00',
    message: "Evening grounding time. Let's take a moment to settle before rest.",
    priority: 'medium',
  },
  {
    id: 'micro-grounding',
    type: 'micro-grounding',
    enabled: false,
    intervalMinutes: 60,
    message: "Just checking your breathing. Take a slow breath if you can.",
    priority: 'low',
  },
  {
    id: 'hydration',
    type: 'hydration',
    enabled: false,
    intervalMinutes: 90,
    message: "Hydration reminder. Have you had some water recently?",
    priority: 'low',
  },
  {
    id: 'medication',
    type: 'medication',
    enabled: false,
    time: '09:00',
    message: "Medication reminder. Time to take your scheduled medication.",
    priority: 'high',
  },
  {
    id: 'task-reminder',
    type: 'task-reminder',
    enabled: true,
    intervalMinutes: 180,
    message: "Gentle reminder about your daily tasks. No pressure.",
    priority: 'low',
  },
  {
    id: 'goal-reminder',
    type: 'goal-reminder',
    enabled: true,
    intervalMinutes: 240,
    message: "Thinking of you and your goals. Small steps count.",
    priority: 'low',
  },
];

const SelfStartContext = createContext<SelfStartContextType | undefined>(undefined);

export function SelfStartProvider({ children }: { children: ReactNode }) {
  const { supportMap } = useSupportMap();
  
  const [globalEnabled, setGlobalEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_global`);
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [routines, setRoutines] = useState<ScheduledRoutine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultRoutines;
    } catch {
      return defaultRoutines;
    }
  });

  const [pendingRoutines, setPendingRoutines] = useState<PendingRoutine[]>([]);
  
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastCheckRef = useRef<Map<string, string>>(new Map());

  // Persist routines
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_global`, String(globalEnabled));
  }, [globalEnabled]);

  // Sync tool needs from support map
  useEffect(() => {
    if (supportMap.toolNeeds.hydrationReminders) {
      enableRoutine('hydration');
    }
    if (supportMap.toolNeeds.medicationReminders) {
      enableRoutine('medication');
    }
    if (supportMap.toolNeeds.breathingReminders) {
      enableRoutine('micro-grounding');
    }
  }, [supportMap.toolNeeds]);

  // Check and trigger routines
  const checkAndTrigger = useCallback((routine: ScheduledRoutine) => {
    if (!globalEnabled || !routine.enabled) return;
    
    const now = new Date();
    const lastTriggered = lastCheckRef.current.get(routine.id);
    
    // Time-based routines
    if (routine.time) {
      const [hours, minutes] = routine.time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const diff = Math.abs(now.getTime() - scheduledTime.getTime());
      const today = now.toDateString();
      
      // Within 5 minutes of scheduled time and not triggered today
      if (diff < 5 * 60 * 1000 && lastTriggered !== today) {
        triggerRoutine(routine.type);
        lastCheckRef.current.set(routine.id, today);
      }
    }
  }, [globalEnabled]);

  // Set up interval checking
  useEffect(() => {
    if (!globalEnabled) return;

    const checkInterval = setInterval(() => {
      routines.forEach(routine => {
        if (routine.enabled && routine.time) {
          checkAndTrigger(routine);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [globalEnabled, routines, checkAndTrigger]);

  // Set up interval-based routines
  useEffect(() => {
    // Clear existing intervals
    intervalRefs.current.forEach(interval => clearInterval(interval));
    intervalRefs.current.clear();

    if (!globalEnabled) return;

    routines.forEach(routine => {
      if (routine.enabled && routine.intervalMinutes) {
        const interval = setInterval(() => {
          triggerRoutine(routine.type);
        }, routine.intervalMinutes * 60 * 1000);
        
        intervalRefs.current.set(routine.id, interval);
      }
    });

    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
    };
  }, [globalEnabled, routines]);

  const triggerRoutine = useCallback((type: RoutineType, customMessage?: string) => {
    const routine = routines.find(r => r.type === type);
    if (!routine) return;

    const pending: PendingRoutine = {
      id: crypto.randomUUID(),
      routine: { ...routine, message: customMessage || routine.message },
      triggeredAt: new Date().toISOString(),
      acknowledged: false,
    };

    setPendingRoutines(prev => [...prev, pending]);
    
    // Update last triggered
    setRoutines(prev => prev.map(r => 
      r.type === type ? { ...r, lastTriggered: new Date().toISOString() } : r
    ));
  }, [routines]);

  const triggerDistressCheckIn = useCallback((distressLevel: 'medium' | 'high') => {
    const message = distressLevel === 'high'
      ? "I noticed you might be struggling. I'm here. Would you like to do some grounding together?"
      : "Just checking in — how are you holding up right now?";
    
    triggerRoutine('distress-triggered', message);
  }, [triggerRoutine]);

  const enableRoutine = useCallback((type: RoutineType) => {
    setRoutines(prev => prev.map(r => 
      r.type === type ? { ...r, enabled: true } : r
    ));
  }, []);

  const disableRoutine = useCallback((type: RoutineType) => {
    setRoutines(prev => prev.map(r => 
      r.type === type ? { ...r, enabled: false } : r
    ));
  }, []);

  const toggleRoutine = useCallback((type: RoutineType) => {
    setRoutines(prev => prev.map(r => 
      r.type === type ? { ...r, enabled: !r.enabled } : r
    ));
  }, []);

  const updateRoutineTime = useCallback((type: RoutineType, time: string) => {
    setRoutines(prev => prev.map(r => 
      r.type === type ? { ...r, time } : r
    ));
  }, []);

  const updateRoutineInterval = useCallback((type: RoutineType, minutes: number) => {
    setRoutines(prev => prev.map(r => 
      r.type === type ? { ...r, intervalMinutes: minutes } : r
    ));
  }, []);

  const acknowledgePending = useCallback((id: string) => {
    setPendingRoutines(prev => prev.map(p => 
      p.id === id ? { ...p, acknowledged: true } : p
    ));
  }, []);

  const dismissPending = useCallback((id: string) => {
    setPendingRoutines(prev => prev.filter(p => p.id !== id));
  }, []);

  const setGlobalEnabled = useCallback((enabled: boolean) => {
    setGlobalEnabledState(enabled);
  }, []);

  const resetRoutines = useCallback(() => {
    setRoutines(defaultRoutines);
    setPendingRoutines([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SelfStartContext.Provider value={{
      routines,
      pendingRoutines,
      enableRoutine,
      disableRoutine,
      toggleRoutine,
      updateRoutineTime,
      updateRoutineInterval,
      acknowledgePending,
      dismissPending,
      triggerRoutine,
      triggerDistressCheckIn,
      globalEnabled,
      setGlobalEnabled,
      resetRoutines,
    }}>
      {children}
    </SelfStartContext.Provider>
  );
}

export function useSelfStart() {
  const context = useContext(SelfStartContext);
  if (context === undefined) {
    throw new Error('useSelfStart must be used within a SelfStartProvider');
  }
  return context;
}
