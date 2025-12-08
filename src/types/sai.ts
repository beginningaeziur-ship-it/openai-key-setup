// SAI Ally Guide Types - Privacy-first design

export interface UserProfile {
  nickname: string;
  cyNickname: string;
  voicePreference: VoicePreference;
  emergencyContact: {
    nickname: string;
    phone: string;
  };
}

export type VoicePreference = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export interface WHOFunctionalModel {
  bodyFunctions: string[];
  activityLimitations: string[];
  participationRestrictions: string[];
  environmentalBarriers: string[];
}

export type DisabilityCategory = 
  | 'physical'
  | 'neurological'
  | 'developmental'
  | 'mental_health'
  | 'chronic_illness'
  | 'sensory'
  | 'substance_addiction'
  | 'behavioral_addiction'
  | 'eating_disorder'
  | 'self_harm'
  | 'authority_trauma'
  | 'environmental_hardship';

export interface ConditionSelection {
  category: DisabilityCategory;
  conditions: string[];
}

export interface SymptomMapping {
  condition: string;
  symptoms: string[];
}

// Progress tracking - stored data
export interface ProgressMetrics {
  stability: number; // 0-100
  consistency: number; // 0-100
  emotionalRegulation: number; // 0-100
  recoverySpeed: number; // 0-100
  lastUpdated: string;
}

export interface Goal {
  id: string;
  type: 'long_term' | 'midpoint' | 'micro';
  category: string;
  title: string;
  progress: number;
  targetDate?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  repetitions: number;
  targetRepetitions: number; // 30-60 for habit formation
  reminderFading: boolean;
  lastCompleted?: string;
}

// What professionals can see (Watcher view)
export interface WatcherView {
  clientCode: string;
  categories: DisabilityCategory[];
  progressPercentages: {
    stability: number;
    consistency: number;
    emotionalRegulation: number;
    recoverySpeed: number;
  };
  trends: 'improving' | 'stable' | 'declining';
  riskColor: 'green' | 'yellow' | 'orange' | 'red';
}

// Alert system
export interface SupportAlert {
  clientCode: string;
  category: string;
  urgencyColor: 'yellow' | 'orange' | 'red';
  trend: 'improving' | 'stable' | 'declining';
  timestamp: string;
}

// Onboarding state
export interface OnboardingState {
  step: number;
  completed: boolean;
  userProfile?: UserProfile;
  whoModel?: WHOFunctionalModel;
  categories?: DisabilityCategory[];
  conditions?: ConditionSelection[];
  symptoms?: SymptomMapping[];
}

// Chat message (NOT stored on server)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Cy's personality configuration
export interface CyPersonality {
  tone: 'calm' | 'warm' | 'encouraging' | 'grounding';
  pacing: 'slow' | 'moderate' | 'responsive';
  adaptations: string[];
}
