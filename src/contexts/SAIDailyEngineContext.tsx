import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSAI } from './SAIContext';

// Focus categories for weekly rotation
export type DailyFocusCategory = 
  | 'health_body'
  | 'housing_stability'
  | 'admin_paperwork'
  | 'work_purpose'
  | 'social_connection'
  | 'recovery_grounding'
  | 'review_rest';

interface DailyFocus {
  category: DailyFocusCategory;
  label: string;
  description: string;
  icon: string;
}

export const FOCUS_CATEGORIES: Record<DailyFocusCategory, DailyFocus> = {
  health_body: {
    category: 'health_body',
    label: 'Health & Body',
    description: 'Taking care of physical needs',
    icon: '💪',
  },
  housing_stability: {
    category: 'housing_stability',
    label: 'Housing & Stability',
    description: 'Creating a safe environment',
    icon: '🏠',
  },
  admin_paperwork: {
    category: 'admin_paperwork',
    label: 'Admin & Paperwork',
    description: 'Handling documents and tasks',
    icon: '📋',
  },
  work_purpose: {
    category: 'work_purpose',
    label: 'Work & Purpose',
    description: 'Activities that give meaning',
    icon: '✨',
  },
  social_connection: {
    category: 'social_connection',
    label: 'Social & Connection',
    description: 'Connecting with others',
    icon: '💬',
  },
  recovery_grounding: {
    category: 'recovery_grounding',
    label: 'Recovery & Grounding',
    description: 'Centering and healing',
    icon: '🧘',
  },
  review_rest: {
    category: 'review_rest',
    label: 'Review & Rest',
    description: 'Reflecting and resting',
    icon: '🌙',
  },
};

const WEEKLY_ROTATION: DailyFocusCategory[] = [
  'health_body',
  'housing_stability',
  'admin_paperwork',
  'work_purpose',
  'social_connection',
  'recovery_grounding',
  'review_rest',
];

export interface DailyTask {
  id: string;
  type: 'personal_care' | 'social' | 'goal_specific';
  title: string;
  description?: string;
  completed: boolean;
  skipped: boolean;
  alternatives?: string[];
  category: DailyFocusCategory;
}

export interface CheckInData {
  date: string;
  type: 'morning' | 'midday' | 'evening';
  emotionalTemp?: number; // 1-5 scale
  tasksAssigned?: DailyTask[];
  tasksCompleted?: string[];
  tasksSkipped?: string[];
  reflection?: string;
  blockers?: string;
  completed: boolean;
}

export interface WeeklyPlan {
  weekStart: string;
  focusByDay: DailyFocusCategory[];
  adjustments: number; // how many times we've adjusted this week
}

interface GoalProgress {
  goalId: string;
  missedCount: number;
  adjustmentsMade: number;
  lastTaskSize: 'normal' | 'reduced' | 'minimal';
}

interface SAIDailyEngineContextType {
  // Current day
  todaysFocus: DailyFocus;
  todaysTasks: DailyTask[];
  
  // Check-ins
  currentCheckIn: CheckInData | null;
  morningCheckInComplete: boolean;
  eveningCheckInComplete: boolean;
  startMorningCheckIn: () => void;
  startEveningCheckIn: () => void;
  completeMorningCheckIn: (emotionalTemp: number, tasks: DailyTask[]) => void;
  completeEveningCheckIn: (reflection: string, blockers?: string) => void;
  
  // Tasks
  completeTask: (taskId: string) => void;
  skipTask: (taskId: string) => void;
  
  // Weekly planning
  weeklyPlan: WeeklyPlan | null;
  initializeWeek: () => void;
  
  // Goal adaptation
  goalProgress: GoalProgress[];
  recordGoalMiss: (goalId: string) => void;
  getGoalAdjustment: (goalId: string) => 'reduce' | 'change_type' | 'change_time' | 'change_goal' | null;
  
  // Check-in needed
  needsMorningCheckIn: boolean;
  needsEveningCheckIn: boolean;
  
  // SAI dialogue
  getCheckInGreeting: () => string;
  getTaskEncouragement: () => string;
  getReflectionPrompt: () => string;
}

const SAIDailyEngineContext = createContext<SAIDailyEngineContextType | undefined>(undefined);

export function SAIDailyEngineProvider({ children }: { children: ReactNode }) {
  const { userProfile, goals, selectedCategories, saiPersonality } = useSAI();
  const userName = userProfile?.nickname || 'Friend';
  
  // State
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(() => {
    const saved = localStorage.getItem('sai_weekly_plan');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [todaysTasks, setTodaysTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('sai_todays_tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if it's from today
      if (parsed.date === new Date().toDateString()) {
        return parsed.tasks;
      }
    }
    return [];
  });
  
  const [checkIns, setCheckIns] = useState<CheckInData[]>(() => {
    const saved = localStorage.getItem('sai_checkins');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>(() => {
    const saved = localStorage.getItem('sai_goal_progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentCheckIn, setCurrentCheckIn] = useState<CheckInData | null>(null);

  // Persist to localStorage
  useEffect(() => {
    if (weeklyPlan) {
      localStorage.setItem('sai_weekly_plan', JSON.stringify(weeklyPlan));
    }
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem('sai_todays_tasks', JSON.stringify({
      date: new Date().toDateString(),
      tasks: todaysTasks,
    }));
  }, [todaysTasks]);

  useEffect(() => {
    localStorage.setItem('sai_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('sai_goal_progress', JSON.stringify(goalProgress));
  }, [goalProgress]);

  // Get today's day index (0 = Sunday)
  const getTodayIndex = () => {
    const day = new Date().getDay();
    // Rotate so Monday = 0
    return day === 0 ? 6 : day - 1;
  };

  // Get today's focus category
  const todaysFocus: DailyFocus = React.useMemo(() => {
    if (weeklyPlan?.focusByDay) {
      const category = weeklyPlan.focusByDay[getTodayIndex()];
      return FOCUS_CATEGORIES[category];
    }
    // Default rotation
    return FOCUS_CATEGORIES[WEEKLY_ROTATION[getTodayIndex()]];
  }, [weeklyPlan]);

  // Check if check-ins are done today
  const getTodaysCheckIns = useCallback(() => {
    const today = new Date().toDateString();
    return checkIns.filter(c => c.date === today);
  }, [checkIns]);

  const morningCheckInComplete = React.useMemo(() => {
    return getTodaysCheckIns().some(c => c.type === 'morning' && c.completed);
  }, [getTodaysCheckIns]);

  const eveningCheckInComplete = React.useMemo(() => {
    return getTodaysCheckIns().some(c => c.type === 'evening' && c.completed);
  }, [getTodaysCheckIns]);

  // Determine if check-ins needed
  const needsMorningCheckIn = React.useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 12 && !morningCheckInComplete;
  }, [morningCheckInComplete]);

  const needsEveningCheckIn = React.useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 && !eveningCheckInComplete;
  }, [eveningCheckInComplete]);

  // Initialize week
  const initializeWeek = useCallback(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    
    // Check if we already have a plan for this week
    if (weeklyPlan?.weekStart === monday.toDateString()) {
      return;
    }

    const newPlan: WeeklyPlan = {
      weekStart: monday.toDateString(),
      focusByDay: [...WEEKLY_ROTATION],
      adjustments: 0,
    };
    
    setWeeklyPlan(newPlan);
  }, [weeklyPlan]);

  // Generate daily tasks based on focus
  const generateDailyTasks = useCallback((focus: DailyFocusCategory): DailyTask[] => {
    const personalCareTasks: Record<DailyFocusCategory, string[]> = {
      health_body: ['Take medication if due', 'Drink a glass of water', 'Stretch for 2 minutes'],
      housing_stability: ['Make your bed', 'Tidy one small area', 'Check your safe space'],
      admin_paperwork: ['Look at your calendar', 'Handle one piece of mail', 'Update one document'],
      work_purpose: ['List one thing you want to do', 'Take a break mindfully', 'Notice one accomplishment'],
      social_connection: ['Send one message', 'Smile at yourself in mirror', 'Reach out to one person'],
      recovery_grounding: ['Do a grounding exercise', 'Journal for 3 minutes', 'Notice 5 things around you'],
      review_rest: ['Rest without guilt', 'Reflect on the week', 'Plan one gentle thing'],
    };

    const socialTasks: string[] = [
      'Send one message to someone safe',
      'Have a brief conversation',
      'Reach out to a support person',
      'Share one thing about your day',
    ];

    const goalTasks: Record<DailyFocusCategory, string[]> = {
      health_body: ['Track how you feel (1-10)', 'Move gently for 5 minutes', 'Eat one nutritious thing'],
      housing_stability: ['Identify one safety need', 'Save one important number', 'Look up one resource'],
      admin_paperwork: ['Complete one small task', 'File one document', 'Make one call'],
      work_purpose: ['Work on one small goal', 'Learn something new for 5 min', 'Create something small'],
      social_connection: ['Tell someone you care', 'Ask someone how they are', 'Accept help if offered'],
      recovery_grounding: ['Practice one coping skill', 'Sit in sunlight for 3 min', 'Name your feelings'],
      review_rest: ['Notice what went well', 'Forgive yourself for one thing', 'Set one intention'],
    };

    const tasks: DailyTask[] = [
      {
        id: crypto.randomUUID(),
        type: 'personal_care',
        title: personalCareTasks[focus][Math.floor(Math.random() * personalCareTasks[focus].length)],
        completed: false,
        skipped: false,
        alternatives: personalCareTasks[focus],
        category: focus,
      },
      {
        id: crypto.randomUUID(),
        type: 'social',
        title: socialTasks[Math.floor(Math.random() * socialTasks.length)],
        completed: false,
        skipped: false,
        alternatives: socialTasks,
        category: focus,
      },
      {
        id: crypto.randomUUID(),
        type: 'goal_specific',
        title: goalTasks[focus][Math.floor(Math.random() * goalTasks[focus].length)],
        completed: false,
        skipped: false,
        alternatives: goalTasks[focus],
        category: focus,
      },
    ];

    return tasks;
  }, []);

  // Start morning check-in
  const startMorningCheckIn = useCallback(() => {
    setCurrentCheckIn({
      date: new Date().toDateString(),
      type: 'morning',
      completed: false,
    });
  }, []);

  // Start evening check-in
  const startEveningCheckIn = useCallback(() => {
    setCurrentCheckIn({
      date: new Date().toDateString(),
      type: 'evening',
      tasksCompleted: todaysTasks.filter(t => t.completed).map(t => t.id),
      tasksSkipped: todaysTasks.filter(t => t.skipped).map(t => t.id),
      completed: false,
    });
  }, [todaysTasks]);

  // Complete morning check-in
  const completeMorningCheckIn = useCallback((emotionalTemp: number, tasks: DailyTask[]) => {
    const checkIn: CheckInData = {
      date: new Date().toDateString(),
      type: 'morning',
      emotionalTemp,
      tasksAssigned: tasks,
      completed: true,
    };
    
    setCheckIns(prev => [...prev, checkIn]);
    setTodaysTasks(tasks);
    setCurrentCheckIn(null);
  }, []);

  // Complete evening check-in
  const completeEveningCheckIn = useCallback((reflection: string, blockers?: string) => {
    const checkIn: CheckInData = {
      date: new Date().toDateString(),
      type: 'evening',
      reflection,
      blockers,
      tasksCompleted: todaysTasks.filter(t => t.completed).map(t => t.id),
      tasksSkipped: todaysTasks.filter(t => t.skipped).map(t => t.id),
      completed: true,
    };
    
    setCheckIns(prev => [...prev, checkIn]);
    setCurrentCheckIn(null);
  }, [todaysTasks]);

  // Complete a task
  const completeTask = useCallback((taskId: string) => {
    setTodaysTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: true } : t
    ));
  }, []);

  // Skip a task
  const skipTask = useCallback((taskId: string) => {
    setTodaysTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, skipped: true } : t
    ));
  }, []);

  // Record goal miss
  const recordGoalMiss = useCallback((goalId: string) => {
    setGoalProgress(prev => {
      const existing = prev.find(p => p.goalId === goalId);
      if (existing) {
        return prev.map(p => 
          p.goalId === goalId 
            ? { ...p, missedCount: p.missedCount + 1 }
            : p
        );
      }
      return [...prev, { goalId, missedCount: 1, adjustmentsMade: 0, lastTaskSize: 'normal' }];
    });
  }, []);

  // Get adjustment recommendation
  const getGoalAdjustment = useCallback((goalId: string): 'reduce' | 'change_type' | 'change_time' | 'change_goal' | null => {
    const progress = goalProgress.find(p => p.goalId === goalId);
    if (!progress) return null;
    
    if (progress.missedCount >= 5) return 'change_goal';
    if (progress.missedCount >= 3) return 'change_type';
    if (progress.missedCount >= 2) return 'change_time';
    if (progress.missedCount >= 1) return 'reduce';
    return null;
  }, [goalProgress]);

  // SAI dialogue helpers
  const getCheckInGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const greetings = hour < 12 
      ? [
          `Good morning, ${userName}.`,
          `Morning. How are you feeling?`,
          `Hey ${userName}. Let's take this day gently.`,
        ]
      : [
          `How was your day, ${userName}?`,
          `Let's wind down together.`,
          `Evening, ${userName}. Time to reflect.`,
        ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, [userName]);

  const getTaskEncouragement = useCallback(() => {
    // Check if in first week (based on localStorage onboarding date)
    const onboardingDate = localStorage.getItem('sai_onboarding_complete');
    const isFirstWeek = onboardingDate 
      ? (Date.now() - new Date(onboardingDate).getTime()) < 7 * 24 * 60 * 60 * 1000
      : true;
    
    const daysSinceOnboarding = onboardingDate
      ? Math.floor((Date.now() - new Date(onboardingDate).getTime()) / (24 * 60 * 60 * 1000))
      : 0;

    // First week specific messaging
    if (isFirstWeek) {
      if (daysSinceOnboarding === 0) {
        return "Today is just about settling in. No goals to complete.";
      } else if (daysSinceOnboarding < 5) {
        return "We're building your goals slowly. One small step is enough.";
      } else {
        return "This week helped us understand what supports you. Nothing is locked in.";
      }
    }

    const phrases = [
      "We'll focus on progress, not perfection.",
      "If this is too much, we'll adjust.",
      "Small steps count.",
      "You don't have to do it all today.",
      "Nothing here decides who you are.",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  const getReflectionPrompt = useCallback(() => {
    const prompts = [
      "What got in the way today?",
      "How did your body feel?",
      "What was one small win?",
      "Incomplete doesn't mean failure.",
      "What do you need right now?",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, []);

  // Auto-initialize week on mount
  useEffect(() => {
    initializeWeek();
  }, [initializeWeek]);

  return (
    <SAIDailyEngineContext.Provider value={{
      todaysFocus,
      todaysTasks,
      currentCheckIn,
      morningCheckInComplete,
      eveningCheckInComplete,
      startMorningCheckIn,
      startEveningCheckIn,
      completeMorningCheckIn,
      completeEveningCheckIn,
      completeTask,
      skipTask,
      weeklyPlan,
      initializeWeek,
      goalProgress,
      recordGoalMiss,
      getGoalAdjustment,
      needsMorningCheckIn,
      needsEveningCheckIn,
      getCheckInGreeting,
      getTaskEncouragement,
      getReflectionPrompt,
    }}>
      {children}
    </SAIDailyEngineContext.Provider>
  );
}

export function useSAIDailyEngine() {
  const context = useContext(SAIDailyEngineContext);
  if (!context) {
    throw new Error('useSAIDailyEngine must be used within SAIDailyEngineProvider');
  }
  return context;
}
