// Water Profile Types and Logic
// Determines user's emotional processing style based on onboarding answers

import type { 
  DisabilityCategory, 
  ConditionSelection, 
  SymptomMapping,
  WHOFunctionalModel,
  UserPreferences 
} from '@/types/sai';

export type WaterProfileType = 'stillwater' | 'stormwater' | 'tidal' | 'reservoir';

export interface WaterProfile {
  type: WaterProfileType;
  name: string;
  description: string;
  strengths: string[];
  challenges: string[];
  whatWeWatch: string[]; // What the Watcher tracks
  whatYouGain: string[]; // Benefits from the program
  icon: string;
}

const waterProfiles: Record<WaterProfileType, WaterProfile> = {
  stillwater: {
    type: 'stillwater',
    name: 'Stillwater',
    description: 'Calm on the surface, but carrying depth beneath. You tend to hold things in, appearing composed even when processing heavy emotions.',
    strengths: [
      'Natural composure under pressure',
      'Thoughtful and reflective',
      'Good at maintaining stability for others',
    ],
    challenges: [
      'Difficulty expressing needs',
      'May bottle up until overwhelmed',
      'Others may not realize when you need support',
    ],
    whatWeWatch: [
      'Subtle signs of building pressure',
      'Patterns of withdrawal or isolation',
      'Moments when the calm cracks',
    ],
    whatYouGain: [
      'Safe space to release what you hold',
      'Tools to express needs before overflow',
      'Recognition that depth is strength',
    ],
    icon: '🌊',
  },
  stormwater: {
    type: 'stormwater',
    name: 'Stormwater',
    description: 'Fast, intense, and powerful. Your emotions move quickly and can feel overwhelming — both to you and sometimes to others.',
    strengths: [
      'Passionate and expressive',
      'Quick to process and move forward',
      'Honest about what you feel',
    ],
    challenges: [
      'Intensity can be exhausting',
      'May act before thinking',
      'Hard to slow down when activated',
    ],
    whatWeWatch: [
      'Early warning signs of escalation',
      'Triggers that spark the storm',
      'Recovery patterns after intensity',
    ],
    whatYouGain: [
      'Skills to ride the wave without drowning',
      'Grounding anchors for intense moments',
      'Understanding your intensity as energy, not flaw',
    ],
    icon: '⛈️',
  },
  tidal: {
    type: 'tidal',
    name: 'Tidal',
    description: 'Rhythmic, cyclical, predictable in some ways but still powerful. Your emotions ebb and flow in patterns — sometimes high, sometimes low.',
    strengths: [
      'Self-aware of your cycles',
      'Able to prepare for known patterns',
      'Resilient through repeated experiences',
    ],
    challenges: [
      'Feeling trapped in cycles',
      'Low points can feel inevitable',
      'Hard to break patterns',
    ],
    whatWeWatch: [
      'Timing and triggers of your cycles',
      'What helps during low tide',
      'Signs that a shift is coming',
    ],
    whatYouGain: [
      'Tools to smooth the extremes',
      'Strategies for low-tide survival',
      'Understanding cycles as natural, not failure',
    ],
    icon: '🌙',
  },
  reservoir: {
    type: 'reservoir',
    name: 'Reservoir',
    description: 'You hold everything in — collecting experiences, emotions, and stress until the dam threatens to break. You can handle a lot, but not forever.',
    strengths: [
      'High capacity for endurance',
      'Reliable and steady for long periods',
      'Patient and deliberate',
    ],
    challenges: [
      'Don\'t release until critical',
      'May not recognize when full',
      'Overflow can be sudden and intense',
    ],
    whatWeWatch: [
      'Signs the reservoir is filling',
      'Patterns of avoidance or denial',
      'What happens at capacity',
    ],
    whatYouGain: [
      'Regular release valves before overflow',
      'Early warning recognition',
      'Permission to not hold everything',
    ],
    icon: '💧',
  },
};

// Calculate Water Profile from user's onboarding data
export function calculateWaterProfile(
  categories: DisabilityCategory[],
  conditions: ConditionSelection[],
  symptoms: SymptomMapping[],
  whoModel: WHOFunctionalModel | null,
  preferences?: UserPreferences
): WaterProfileType {
  // Scoring system for each profile type
  const scores: Record<WaterProfileType, number> = {
    stillwater: 0,
    stormwater: 0,
    tidal: 0,
    reservoir: 0,
  };

  // Analyze categories
  if (categories.includes('mental_health')) {
    scores.stormwater += 2;
    scores.tidal += 2;
  }
  if (categories.includes('developmental')) {
    scores.stillwater += 1;
    scores.reservoir += 1;
  }
  if (categories.includes('authority_trauma')) {
    scores.reservoir += 2;
    scores.stillwater += 1;
  }
  if (categories.includes('substance_addiction') || categories.includes('behavioral_addiction')) {
    scores.stormwater += 2;
    scores.reservoir += 1;
  }
  if (categories.includes('environmental_hardship')) {
    scores.reservoir += 2;
    scores.stillwater += 1;
  }
  if (categories.includes('self_harm')) {
    scores.stormwater += 1;
    scores.tidal += 2;
  }
  if (categories.includes('eating_disorder')) {
    scores.tidal += 2;
    scores.reservoir += 1;
  }

  // Analyze symptoms
  const allSymptoms = symptoms.flatMap(s => s.symptoms);
  
  // Emotional regulation symptoms
  if (allSymptoms.some(s => s.includes('anger') || s.includes('rage') || s.includes('outburst'))) {
    scores.stormwater += 3;
  }
  if (allSymptoms.some(s => s.includes('numb') || s.includes('disconnect') || s.includes('dissociat'))) {
    scores.stillwater += 3;
  }
  if (allSymptoms.some(s => s.includes('cycle') || s.includes('mood') || s.includes('swing'))) {
    scores.tidal += 3;
  }
  if (allSymptoms.some(s => s.includes('bottle') || s.includes('suppress') || s.includes('avoid'))) {
    scores.reservoir += 3;
  }

  // Analyze WHO model
  if (whoModel) {
    // Body functions indicating regulation issues
    if (whoModel.bodyFunctions.some(f => f.includes('emotion') || f.includes('impulse'))) {
      scores.stormwater += 2;
    }
    if (whoModel.bodyFunctions.some(f => f.includes('energy') || f.includes('fatigue'))) {
      scores.tidal += 1;
    }
    
    // Activity limitations
    if (whoModel.activityLimitations.some(a => a.includes('communication') || a.includes('express'))) {
      scores.stillwater += 2;
      scores.reservoir += 1;
    }
  }

  // Analyze preferences if available
  if (preferences) {
    if (preferences.intensity === 'gentle') {
      scores.stillwater += 1;
      scores.reservoir += 1;
    }
    if (preferences.intensity === 'challenge') {
      scores.stormwater += 1;
    }
    if (preferences.pace === 'gentle') {
      scores.stillwater += 1;
    }
    if (preferences.pace === 'challenge') {
      scores.stormwater += 1;
    }
  }

  // Find highest score
  let maxScore = 0;
  let profileType: WaterProfileType = 'stillwater';
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      profileType = type as WaterProfileType;
    }
  }

  return profileType;
}

export function getWaterProfile(type: WaterProfileType): WaterProfile {
  return waterProfiles[type];
}

export function getAllWaterProfiles(): WaterProfile[] {
  return Object.values(waterProfiles);
}
