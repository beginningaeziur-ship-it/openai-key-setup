import type { DisabilityCategory, ConditionSelection, SymptomMapping, WHOFunctionalModel, Goal } from '@/types/sai';
import { getLifeAnchorLabel, type LifeAnchorCategory } from '@/lib/lifeAnchor';

export interface GeneratedGoal {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  type: 'long_term' | 'midpoint' | 'micro';
  parentGoalId?: string;
  isLifeAnchorGoal?: boolean; // Goals connected to identity/purpose
}

export interface LifeAnchorProfile {
  situation?: string;
  interests: string[];
  skills: string[];
  incomeSource?: string;
  purposeAnchor?: string;
}

export interface GoalGenerationResult {
  longTermGoals: GeneratedGoal[];
  midpointGoals: GeneratedGoal[];
  microGoals: GeneratedGoal[];
}

/**
 * AEZUIR Goal Engine
 * 
 * Hierarchy:
 * - 1 Core Stability Goal (safety/housing/health/stability)
 * - 2 Mid-Level Goals (one supports stability, one supports identity/purpose via Life Anchor)
 * - 4 Mini Goals (at least 1 connects to Life Anchor, all doable on low-energy days)
 * 
 * Rules:
 * - Diagnosis/symptoms inform CONSTRAINTS, not identity
 * - Life Anchor informs PURPOSE and identity-building
 * - SAI says: "We'll focus on progress, not perfection."
 * - SAI explains: "We're building stability AND building your life back. Both matter."
 */
export function generateGoalsFromProfile(
  categories: DisabilityCategory[],
  conditions: ConditionSelection[],
  symptoms: SymptomMapping[],
  whoModel: WHOFunctionalModel | null,
  lifeAnchor?: LifeAnchorProfile | null
): GoalGenerationResult {
  const allConditions = conditions.flatMap(c => c.conditions);
  const allSymptoms = symptoms.flatMap(s => s.symptoms);

  const longTermGoals: GeneratedGoal[] = [];
  const midpointGoals: GeneratedGoal[] = [];
  const microGoals: GeneratedGoal[] = [];

  // Detect profile types (for CONSTRAINTS, not identity)
  const hasTrauma = categories.some(c => ['mental_health', 'authority_trauma', 'self_harm'].includes(c));
  const hasCPTSD = allConditions.includes('cptsd') || allConditions.includes('ptsd');
  const hasAddiction = categories.some(c => ['substance_addiction', 'behavioral_addiction', 'eating_disorder'].includes(c));
  const hasChronicIllness = categories.some(c => ['chronic_illness', 'neurological', 'physical'].includes(c));
  const hasDevelopmental = categories.includes('developmental') || allConditions.includes('autism') || allConditions.includes('adhd');
  const hasHousingIssues = categories.includes('environmental_hardship') || 
    whoModel?.environmentalBarriers?.some(b => ['homelessness', 'unsafe_relationships'].includes(b));
  const hasLowEnergy = allSymptoms.includes('fatigue') || allSymptoms.includes('low_energy') || hasChronicIllness;

  // === CORE STABILITY GOAL (Everyone gets this) ===
  const stabilityGoal: GeneratedGoal = {
    id: 'core_stability',
    category: 'stability',
    title: hasHousingIssues 
      ? 'Work toward safer, more stable housing'
      : hasTrauma 
        ? 'Build emotional safety day by day' 
        : 'Feel more stable day to day',
    description: hasHousingIssues
      ? 'Address immediate safety and housing needs first'
      : hasTrauma 
        ? 'Create grounding routines and safe spaces'
        : 'Develop consistent rhythms for a sense of control',
    icon: '🏠',
    type: 'long_term',
  };
  longTermGoals.push(stabilityGoal);

  // === MID-LEVEL GOAL #1: Support Stability ===
  const stabilityMidGoal: GeneratedGoal = {
    id: 'mid_stability',
    category: 'stability',
    title: hasTrauma || hasCPTSD
      ? 'Establish one grounding practice'
      : hasAddiction
        ? 'Build 3 alternative coping options'
        : 'Create a simple daily anchor routine',
    description: hasTrauma 
      ? 'Pick one technique that works for you'
      : 'Something small to start each day',
    icon: '🌿',
    type: 'midpoint',
    parentGoalId: 'core_stability',
  };
  midpointGoals.push(stabilityMidGoal);

  // === MID-LEVEL GOAL #2: Support Identity/Purpose via Life Anchor ===
  const anchor = lifeAnchor?.purposeAnchor || (lifeAnchor?.interests?.[0] as LifeAnchorCategory);
  const anchorLabel = anchor ? getLifeAnchorLabel(anchor as LifeAnchorCategory) : null;
  
  const identityMidGoal: GeneratedGoal = {
    id: 'mid_identity',
    category: 'identity',
    title: anchor 
      ? `Reconnect with ${anchorLabel}`
      : 'Rediscover something that brings you calm',
    description: anchor
      ? `Your connection to ${anchorLabel?.toLowerCase()} is part of who you are`
      : 'Find one thing that feels like "you" again',
    icon: anchor ? getLifeAnchorIcon(anchor as LifeAnchorCategory) : '✨',
    type: 'midpoint',
    parentGoalId: 'core_stability',
    isLifeAnchorGoal: true,
  };
  midpointGoals.push(identityMidGoal);

  // === MINI GOALS (4 total, at least 1 connects to Life Anchor) ===
  
  // Mini goal 1: Stability-focused
  microGoals.push({
    id: 'mini_1',
    category: 'stability',
    title: hasTrauma ? 'Try box breathing once' : 'Drink a glass of water when you wake up',
    description: 'Just one small action. Nothing more required.',
    icon: '🌿',
    type: 'micro',
    parentGoalId: 'mid_stability',
  });

  // Mini goal 2: Awareness-focused
  microGoals.push({
    id: 'mini_2',
    category: 'awareness',
    title: hasChronicIllness 
      ? 'Notice how your body feels right now (1-10)'
      : 'Notice one thing in your environment',
    description: 'No judgment. Just notice.',
    icon: hasDevelopmental ? '📋' : '👁️',
    type: 'micro',
    parentGoalId: 'mid_stability',
  });

  // Mini goal 3: Life Anchor connection (REQUIRED)
  const anchorMiniGoal = generateLifeAnchorMiniGoal(anchor as LifeAnchorCategory, hasLowEnergy);
  microGoals.push({
    id: 'mini_3_anchor',
    category: 'identity',
    title: anchorMiniGoal.title,
    description: anchorMiniGoal.description,
    icon: anchorMiniGoal.icon,
    type: 'micro',
    parentGoalId: 'mid_identity',
    isLifeAnchorGoal: true,
  });

  // Mini goal 4: Social/connection or self-care
  microGoals.push({
    id: 'mini_4',
    category: 'connection',
    title: 'Reach out to one person (text counts)',
    description: 'Connection doesn\'t have to be big.',
    icon: '💬',
    type: 'micro',
    parentGoalId: 'mid_identity',
  });

  return {
    longTermGoals: longTermGoals.slice(0, 1), // 1 Core goal
    midpointGoals: midpointGoals.slice(0, 2), // 2 Mid goals
    microGoals: microGoals.slice(0, 4), // 4 Mini goals
  };
}

function generateLifeAnchorMiniGoal(anchor: LifeAnchorCategory | undefined, lowEnergy: boolean): {
  title: string;
  description: string;
  icon: string;
} {
  if (!anchor) {
    return {
      title: 'Do one thing you enjoy for 5 minutes',
      description: 'Even something small counts.',
      icon: '✨',
    };
  }

  const goals: Record<string, { title: string; description: string; icon: string }> = {
    music: {
      title: lowEnergy ? 'Listen to one song you like' : 'Listen to or play music for 10 minutes',
      description: 'Music is part of who you are.',
      icon: '🎵',
    },
    art: {
      title: lowEnergy ? 'Look at art that inspires you' : 'Create something small (doodle, sketch)',
      description: 'Art doesn\'t have to be "good."',
      icon: '🎨',
    },
    writing: {
      title: lowEnergy ? 'Write one sentence about today' : 'Write for 5 minutes about anything',
      description: 'Words are yours.',
      icon: '✍️',
    },
    gaming: {
      title: 'Play a game for 15 minutes',
      description: 'Games count. Fun counts.',
      icon: '🎮',
    },
    fitness: {
      title: lowEnergy ? 'Stretch for 2 minutes' : 'Move your body for 10 minutes',
      description: 'Any movement is movement.',
      icon: '💪',
    },
    cooking: {
      title: lowEnergy ? 'Make something simple to eat' : 'Prepare one meal you enjoy',
      description: 'Feeding yourself is self-care.',
      icon: '🍳',
    },
    nature: {
      title: lowEnergy ? 'Look at nature through a window' : 'Spend 10 minutes outside',
      description: 'Nature is always there.',
      icon: '🌲',
    },
    animals: {
      title: 'Spend time with an animal (yours or watch videos)',
      description: 'Animals don\'t judge.',
      icon: '🐕',
    },
    reading: {
      title: 'Read one page of something',
      description: 'One page is enough.',
      icon: '📚',
    },
    crafts: {
      title: 'Work on a craft for 10 minutes',
      description: 'Creating with your hands is grounding.',
      icon: '🧵',
    },
    helping_others: {
      title: 'Do one small kind thing for someone',
      description: 'Helping others can help you feel connected.',
      icon: '🤝',
    },
    learning: {
      title: 'Learn one new thing (video, article, anything)',
      description: 'Curiosity is a strength.',
      icon: '📖',
    },
    spirituality: {
      title: 'Take 5 minutes for reflection or prayer',
      description: 'This is your time.',
      icon: '🙏',
    },
    family: {
      title: 'Connect with a family member briefly',
      description: 'Even a short message counts.',
      icon: '👨‍👩‍👧',
    },
    friends: {
      title: 'Text or call a friend',
      description: 'Connection doesn\'t have to be long.',
      icon: '👋',
    },
    work: {
      title: 'Do one small work-related task',
      description: 'Progress, not perfection.',
      icon: '💼',
    },
    school: {
      title: 'Study or review for 15 minutes',
      description: 'Small steps add up.',
      icon: '📝',
    },
    other: {
      title: 'Do one thing that brings you peace',
      description: 'You know what works for you.',
      icon: '✨',
    },
  };

  return goals[anchor] || goals.other;
}

function getLifeAnchorIcon(anchor: LifeAnchorCategory): string {
  const icons: Record<string, string> = {
    music: '🎵',
    art: '🎨',
    writing: '✍️',
    gaming: '🎮',
    fitness: '💪',
    cooking: '🍳',
    nature: '🌲',
    animals: '🐕',
    reading: '📚',
    crafts: '🧵',
    helping_others: '🤝',
    learning: '📖',
    spirituality: '🙏',
    family: '👨‍👩‍👧',
    friends: '👋',
    work: '💼',
    school: '📝',
    other: '✨',
  };
  return icons[anchor] || '✨';
}

export function convertToGoals(generated: GeneratedGoal[]): Omit<Goal, 'id' | 'createdAt'>[] {
  return generated.map(g => ({
    type: g.type,
    category: g.category,
    title: g.title,
    progress: 0,
    targetDate: g.type === 'long_term' 
      ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      : g.type === 'midpoint'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}
