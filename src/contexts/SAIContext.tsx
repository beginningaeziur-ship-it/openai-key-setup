import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { 
  UserProfile, 
  WHOFunctionalModel, 
  DisabilityCategory, 
  ConditionSelection, 
  SymptomMapping,
  OnboardingState,
  ProgressMetrics,
  Goal,
  Habit,
  CyPersonality
} from '@/types/sai';

interface SAIContextType {
  // Onboarding state
  onboarding: OnboardingState;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
  
  // User profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  
  // WHO Model
  whoModel: WHOFunctionalModel | null;
  setWHOModel: (model: WHOFunctionalModel) => void;
  
  // Categories and conditions
  selectedCategories: DisabilityCategory[];
  setSelectedCategories: (categories: DisabilityCategory[]) => void;
  selectedConditions: ConditionSelection[];
  setSelectedConditions: (conditions: ConditionSelection[]) => void;
  selectedSymptoms: SymptomMapping[];
  setSelectedSymptoms: (symptoms: SymptomMapping[]) => void;
  
  // Progress tracking
  progressMetrics: ProgressMetrics;
  updateProgressMetrics: (metrics: Partial<ProgressMetrics>) => void;
  
  // Goals and habits
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  
  // Cy personality
  cyPersonality: CyPersonality;
  
  // Reset
  resetAll: () => void;
}

const defaultProgressMetrics: ProgressMetrics = {
  stability: 50,
  consistency: 50,
  emotionalRegulation: 50,
  recoverySpeed: 50,
  lastUpdated: new Date().toISOString(),
};

const defaultOnboarding: OnboardingState = {
  step: 0,
  completed: false,
};

const SAIContext = createContext<SAIContextType | undefined>(undefined);

export function SAIProvider({ children }: { children: ReactNode }) {
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem('sai_onboarding');
    return saved ? JSON.parse(saved) : defaultOnboarding;
  });
  
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sai_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [whoModel, setWHOModelState] = useState<WHOFunctionalModel | null>(() => {
    const saved = localStorage.getItem('sai_who_model');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [selectedCategories, setSelectedCategoriesState] = useState<DisabilityCategory[]>(() => {
    const saved = localStorage.getItem('sai_categories');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedConditions, setSelectedConditionsState] = useState<ConditionSelection[]>(() => {
    const saved = localStorage.getItem('sai_conditions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedSymptoms, setSelectedSymptomsState] = useState<SymptomMapping[]>(() => {
    const saved = localStorage.getItem('sai_symptoms');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics>(() => {
    const saved = localStorage.getItem('sai_progress');
    return saved ? JSON.parse(saved) : defaultProgressMetrics;
  });
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('sai_goals');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('sai_habits');
    return saved ? JSON.parse(saved) : [];
  });

  // Cy personality is derived from user's conditions/symptoms
  const cyPersonality: CyPersonality = React.useMemo(() => {
    const hasTrauma = selectedCategories.some(c => 
      ['mental_health', 'authority_trauma', 'self_harm'].includes(c)
    );
    const hasSensory = selectedCategories.includes('sensory') || 
      selectedConditions.some(c => c.conditions.includes('autism'));
    
    return {
      tone: hasTrauma ? 'calm' : 'warm',
      pacing: hasSensory ? 'slow' : 'moderate',
      adaptations: [
        ...(hasTrauma ? ['trauma-informed language', 'no authority tone'] : []),
        ...(hasSensory ? ['reduced stimulation', 'clear structure'] : []),
      ],
    };
  }, [selectedCategories, selectedConditions]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('sai_onboarding', JSON.stringify(onboarding));
  }, [onboarding]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('sai_user_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    if (whoModel) {
      localStorage.setItem('sai_who_model', JSON.stringify(whoModel));
    }
  }, [whoModel]);

  useEffect(() => {
    localStorage.setItem('sai_categories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  useEffect(() => {
    localStorage.setItem('sai_conditions', JSON.stringify(selectedConditions));
  }, [selectedConditions]);

  useEffect(() => {
    localStorage.setItem('sai_symptoms', JSON.stringify(selectedSymptoms));
  }, [selectedSymptoms]);

  useEffect(() => {
    localStorage.setItem('sai_progress', JSON.stringify(progressMetrics));
  }, [progressMetrics]);

  useEffect(() => {
    localStorage.setItem('sai_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('sai_habits', JSON.stringify(habits));
  }, [habits]);

  const setOnboardingStep = (step: number) => {
    setOnboarding(prev => ({ ...prev, step }));
  };

  const completeOnboarding = () => {
    setOnboarding(prev => ({ ...prev, completed: true }));
  };

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
  };

  const setWHOModel = (model: WHOFunctionalModel) => {
    setWHOModelState(model);
  };

  const setSelectedCategories = (categories: DisabilityCategory[]) => {
    setSelectedCategoriesState(categories);
  };

  const setSelectedConditions = (conditions: ConditionSelection[]) => {
    setSelectedConditionsState(conditions);
  };

  const setSelectedSymptoms = (symptoms: SymptomMapping[]) => {
    setSelectedSymptomsState(symptoms);
  };

  const updateProgressMetrics = (metrics: Partial<ProgressMetrics>) => {
    setProgressMetrics(prev => ({
      ...prev,
      ...metrics,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

const addHabit = (habit: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      createdAt: habit.createdAt || new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const removeHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const resetAll = () => {
    localStorage.removeItem('sai_onboarding');
    localStorage.removeItem('sai_user_profile');
    localStorage.removeItem('sai_who_model');
    localStorage.removeItem('sai_categories');
    localStorage.removeItem('sai_conditions');
    localStorage.removeItem('sai_symptoms');
    localStorage.removeItem('sai_progress');
    localStorage.removeItem('sai_goals');
    localStorage.removeItem('sai_habits');
    
    setOnboarding(defaultOnboarding);
    setUserProfileState(null);
    setWHOModelState(null);
    setSelectedCategoriesState([]);
    setSelectedConditionsState([]);
    setSelectedSymptomsState([]);
    setProgressMetrics(defaultProgressMetrics);
    setGoals([]);
    setHabits([]);
  };

  return (
    <SAIContext.Provider value={{
      onboarding,
      setOnboardingStep,
      completeOnboarding,
      userProfile,
      setUserProfile,
      whoModel,
      setWHOModel,
      selectedCategories,
      setSelectedCategories,
      selectedConditions,
      setSelectedConditions,
      selectedSymptoms,
      setSelectedSymptoms,
      progressMetrics,
      updateProgressMetrics,
      goals,
      addGoal,
      updateGoal,
      habits,
      addHabit,
      updateHabit,
      cyPersonality,
      resetAll,
    }}>
      {children}
    </SAIContext.Provider>
  );
}

export function useSAI() {
  const context = useContext(SAIContext);
  if (context === undefined) {
    throw new Error('useSAI must be used within a SAIProvider');
  }
  return context;
}
