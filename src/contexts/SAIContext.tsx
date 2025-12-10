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
  SAIPersonality
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
  
  // SAI personality - per-user profile
  saiPersonality: SAIPersonality;
  
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

  // SAI personality is derived from user's conditions/symptoms/environment
  const saiPersonality: SAIPersonality = React.useMemo(() => {
    const hasTrauma = selectedCategories.some(c => 
      ['mental_health', 'authority_trauma', 'self_harm'].includes(c)
    );
    const hasSensory = selectedCategories.includes('sensory') || 
      selectedConditions.some(c => c.conditions.includes('autism'));
    const hasAddiction = selectedCategories.some(c => 
      ['substance_addiction', 'behavioral_addiction', 'eating_disorder'].includes(c)
    );
    const hasAuthorityTrauma = selectedCategories.includes('authority_trauma');
    const hasEnvironmentalHardship = selectedCategories.includes('environmental_hardship');
    const hasCPTSD = selectedConditions.some(c => c.conditions.includes('cptsd') || c.conditions.includes('ptsd'));
    
    // Build trigger zones based on categories
    const triggerZones: string[] = [];
    if (hasAuthorityTrauma) triggerZones.push('fear of authority', 'commands/directives');
    if (selectedCategories.includes('self_harm')) triggerZones.push('self-harm urges');
    if (hasAddiction) triggerZones.push('addiction shame', 'relapse guilt');
    if (selectedConditions.some(c => c.conditions.includes('eating_disorder'))) {
      triggerZones.push('body image', 'food control');
    }
    
    // Build adaptations based on profile
    const adaptations: string[] = [];
    if (hasTrauma) adaptations.push('trauma-informed language', 'no authority tone');
    if (hasSensory) adaptations.push('reduced stimulation', 'clear structure', 'literal language');
    if (hasAddiction) adaptations.push('zero shame approach', 'harm reduction framing');
    if (hasCPTSD) adaptations.push('grounding first', 'safety before goals', 'more reassurance');
    if (hasAuthorityTrauma) adaptations.push('non-threatening wording', 'choices not commands');
    if (hasEnvironmentalHardship) adaptations.push('practical stability focus', 'survival-first');
    
    return {
      tone: hasTrauma || hasCPTSD ? 'calm' : 'warm',
      pacing: hasSensory ? 'slow' : 'moderate',
      sensitivityLevel: hasTrauma || hasCPTSD ? 'high' : hasAddiction ? 'medium' : 'low',
      validationNeeds: hasTrauma || hasCPTSD ? 'high' : 'moderate',
      goalComfort: hasCPTSD || hasEnvironmentalHardship ? 'tiny' : hasTrauma ? 'short-range' : 'long-term',
      adaptations,
      triggerZones,
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
    // Clear all SAI-related localStorage keys
    const keysToRemove = [
      'sai_onboarding',
      'sai_user_profile',
      'sai_who_model',
      'sai_categories',
      'sai_conditions',
      'sai_symptoms',
      'sai_progress',
      'sai_goals',
      'sai_habits',
      'sai_safety_plan',
      'sai_intro_completed',
      'sai_tutorial_completed',
      'sai_room_intro_seen',
      'sai_mic_enabled',
      'sai_mic_muted',
      'sai_mic_warning_seen',
      'sai_voice_enabled',
      'sai_voice_id',
      'sai_speaking_speed',
      'sai_volume',
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
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
      saiPersonality,
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
