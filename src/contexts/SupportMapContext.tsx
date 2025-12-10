// Support Map Context - Disability mapping and personalized support plans
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Types for the support map
export interface GroundingPlan {
  techniques: string[];
  preferredMethod: 'breathing' | 'sensory' | 'movement' | 'cognitive';
  customPhrases: string[];
}

export interface CrisisPlan {
  warningSignsPhysical: string[];
  warningSignsEmotional: string[];
  copingStrategies: string[];
  safePlaces: string[];
  emergencyContacts: { name: string; phone: string; relationship: string }[];
  professionalContacts: { name: string; phone: string; type: string }[];
  reasonsToLive: string[];
}

export interface AdvocacyItem {
  id: string;
  category: 'medical' | 'legal' | 'housing' | 'financial' | 'workplace' | 'education';
  description: string;
  status: 'needed' | 'in-progress' | 'resolved';
  notes: string;
}

export interface ToolNeeds {
  voiceSupport: boolean;
  breathingReminders: boolean;
  medicationReminders: boolean;
  hydrationReminders: boolean;
  checkInFrequency: 'hourly' | 'few-hours' | 'daily' | 'as-needed';
  groundingAccess: 'always-visible' | 'quick-access' | 'on-request';
}

export interface SupportGoal {
  id: string;
  title: string;
  description: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | '3-months' | '6-months';
  category: 'stability' | 'independence' | 'health' | 'social' | 'practical';
  progress: number;
  milestones: { text: string; completed: boolean }[];
  createdAt: string;
}

export interface SupportMap {
  groundingPlan: GroundingPlan;
  crisisPlan: CrisisPlan;
  advocacyList: AdvocacyItem[];
  toolNeeds: ToolNeeds;
  shortTermGoals: SupportGoal[];
  longTermGoals: SupportGoal[];
  adaptations: {
    tonePreference: 'gentle' | 'honest' | 'direct';
    pacingPreference: 'slow' | 'normal' | 'fast';
    reminderStyle: 'soft' | 'neutral' | 'firm';
  };
}

interface SupportMapContextType {
  supportMap: SupportMap;
  
  // Update functions
  updateGroundingPlan: (plan: Partial<GroundingPlan>) => void;
  updateCrisisPlan: (plan: Partial<CrisisPlan>) => void;
  addAdvocacyItem: (item: Omit<AdvocacyItem, 'id'>) => void;
  updateAdvocacyItem: (id: string, updates: Partial<AdvocacyItem>) => void;
  removeAdvocacyItem: (id: string) => void;
  updateToolNeeds: (needs: Partial<ToolNeeds>) => void;
  addGoal: (goal: Omit<SupportGoal, 'id' | 'createdAt'>, type: 'short' | 'long') => void;
  updateGoal: (id: string, updates: Partial<SupportGoal>, type: 'short' | 'long') => void;
  removeGoal: (id: string, type: 'short' | 'long') => void;
  updateAdaptations: (adaptations: Partial<SupportMap['adaptations']>) => void;
  
  // Build support map from onboarding data
  buildFromProfile: (categories: string[], conditions: string[], symptoms: string[]) => void;
  
  // Reset
  resetSupportMap: () => void;
}

const STORAGE_KEY = 'sai_support_map';

const defaultGroundingPlan: GroundingPlan = {
  techniques: ['5-4-3-2-1 senses', 'Box breathing', 'Cold water on wrists'],
  preferredMethod: 'breathing',
  customPhrases: [],
};

const defaultCrisisPlan: CrisisPlan = {
  warningSignsPhysical: [],
  warningSignsEmotional: [],
  copingStrategies: [],
  safePlaces: [],
  emergencyContacts: [],
  professionalContacts: [],
  reasonsToLive: [],
};

const defaultToolNeeds: ToolNeeds = {
  voiceSupport: true,
  breathingReminders: false,
  medicationReminders: false,
  hydrationReminders: false,
  checkInFrequency: 'few-hours',
  groundingAccess: 'quick-access',
};

const defaultSupportMap: SupportMap = {
  groundingPlan: defaultGroundingPlan,
  crisisPlan: defaultCrisisPlan,
  advocacyList: [],
  toolNeeds: defaultToolNeeds,
  shortTermGoals: [],
  longTermGoals: [],
  adaptations: {
    tonePreference: 'honest',
    pacingPreference: 'normal',
    reminderStyle: 'neutral',
  },
};

const SupportMapContext = createContext<SupportMapContextType | undefined>(undefined);

export function SupportMapProvider({ children }: { children: ReactNode }) {
  const [supportMap, setSupportMap] = useState<SupportMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultSupportMap, ...JSON.parse(saved) } : defaultSupportMap;
    } catch {
      return defaultSupportMap;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(supportMap));
  }, [supportMap]);

  const updateGroundingPlan = useCallback((plan: Partial<GroundingPlan>) => {
    setSupportMap(prev => ({
      ...prev,
      groundingPlan: { ...prev.groundingPlan, ...plan },
    }));
  }, []);

  const updateCrisisPlan = useCallback((plan: Partial<CrisisPlan>) => {
    setSupportMap(prev => ({
      ...prev,
      crisisPlan: { ...prev.crisisPlan, ...plan },
    }));
  }, []);

  const addAdvocacyItem = useCallback((item: Omit<AdvocacyItem, 'id'>) => {
    setSupportMap(prev => ({
      ...prev,
      advocacyList: [...prev.advocacyList, { ...item, id: crypto.randomUUID() }],
    }));
  }, []);

  const updateAdvocacyItem = useCallback((id: string, updates: Partial<AdvocacyItem>) => {
    setSupportMap(prev => ({
      ...prev,
      advocacyList: prev.advocacyList.map(item =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  const removeAdvocacyItem = useCallback((id: string) => {
    setSupportMap(prev => ({
      ...prev,
      advocacyList: prev.advocacyList.filter(item => item.id !== id),
    }));
  }, []);

  const updateToolNeeds = useCallback((needs: Partial<ToolNeeds>) => {
    setSupportMap(prev => ({
      ...prev,
      toolNeeds: { ...prev.toolNeeds, ...needs },
    }));
  }, []);

  const addGoal = useCallback((goal: Omit<SupportGoal, 'id' | 'createdAt'>, type: 'short' | 'long') => {
    const newGoal: SupportGoal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setSupportMap(prev => ({
      ...prev,
      [type === 'short' ? 'shortTermGoals' : 'longTermGoals']: [
        ...prev[type === 'short' ? 'shortTermGoals' : 'longTermGoals'],
        newGoal,
      ],
    }));
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<SupportGoal>, type: 'short' | 'long') => {
    const key = type === 'short' ? 'shortTermGoals' : 'longTermGoals';
    setSupportMap(prev => ({
      ...prev,
      [key]: prev[key].map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      ),
    }));
  }, []);

  const removeGoal = useCallback((id: string, type: 'short' | 'long') => {
    const key = type === 'short' ? 'shortTermGoals' : 'longTermGoals';
    setSupportMap(prev => ({
      ...prev,
      [key]: prev[key].filter(goal => goal.id !== id),
    }));
  }, []);

  const updateAdaptations = useCallback((adaptations: Partial<SupportMap['adaptations']>) => {
    setSupportMap(prev => ({
      ...prev,
      adaptations: { ...prev.adaptations, ...adaptations },
    }));
  }, []);

  // Build support map from user's disability profile
  const buildFromProfile = useCallback((categories: string[], conditions: string[], symptoms: string[]) => {
    const newMap = { ...defaultSupportMap };

    // Determine grounding preferences based on conditions
    if (categories.includes('sensory') || conditions.some(c => c.includes('autism'))) {
      newMap.groundingPlan.preferredMethod = 'sensory';
      newMap.groundingPlan.techniques = [
        'Weighted blanket pressure',
        'Ice cube in hand',
        'Textured objects',
        'Noise-canceling space',
      ];
      newMap.adaptations.pacingPreference = 'slow';
    }

    if (categories.includes('mental_health') || conditions.some(c => 
      c.includes('ptsd') || c.includes('cptsd') || c.includes('anxiety')
    )) {
      newMap.groundingPlan.preferredMethod = 'breathing';
      newMap.toolNeeds.breathingReminders = true;
      newMap.adaptations.tonePreference = 'gentle';
    }

    if (categories.includes('physical') || categories.includes('chronic_illness')) {
      newMap.groundingPlan.preferredMethod = 'cognitive';
      newMap.toolNeeds.medicationReminders = true;
      newMap.toolNeeds.hydrationReminders = true;
    }

    if (categories.includes('self_harm') || categories.includes('eating_disorder')) {
      newMap.toolNeeds.checkInFrequency = 'hourly';
      newMap.toolNeeds.groundingAccess = 'always-visible';
      newMap.crisisPlan.copingStrategies = [
        'Ice cube technique',
        'Call support person',
        'Leave current environment',
        'Use grounding exercise',
      ];
    }

    if (categories.includes('substance_addiction') || categories.includes('behavioral_addiction')) {
      newMap.toolNeeds.checkInFrequency = 'few-hours';
      newMap.adaptations.reminderStyle = 'soft';
    }

    if (categories.includes('developmental') || conditions.some(c => c.includes('adhd'))) {
      newMap.adaptations.pacingPreference = 'normal';
      newMap.adaptations.tonePreference = 'direct';
    }

    if (categories.includes('authority_trauma')) {
      newMap.adaptations.tonePreference = 'gentle';
      newMap.adaptations.reminderStyle = 'soft';
    }

    setSupportMap(newMap);
  }, []);

  const resetSupportMap = useCallback(() => {
    setSupportMap(defaultSupportMap);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <SupportMapContext.Provider value={{
      supportMap,
      updateGroundingPlan,
      updateCrisisPlan,
      addAdvocacyItem,
      updateAdvocacyItem,
      removeAdvocacyItem,
      updateToolNeeds,
      addGoal,
      updateGoal,
      removeGoal,
      updateAdaptations,
      buildFromProfile,
      resetSupportMap,
    }}>
      {children}
    </SupportMapContext.Provider>
  );
}

export function useSupportMap() {
  const context = useContext(SupportMapContext);
  if (context === undefined) {
    throw new Error('useSupportMap must be used within a SupportMapProvider');
  }
  return context;
}
