import type { DisabilityCategory, ConditionSelection, SymptomMapping, WHOFunctionalModel, Goal } from '@/types/sai';

export interface GeneratedGoal {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: string;
  type: 'long_term' | 'midpoint' | 'micro';
  parentGoalId?: string;
}

export interface GoalGenerationResult {
  longTermGoals: GeneratedGoal[];
  midpointGoals: GeneratedGoal[];
  microGoals: GeneratedGoal[];
}

export function generateGoalsFromProfile(
  categories: DisabilityCategory[],
  conditions: ConditionSelection[],
  symptoms: SymptomMapping[],
  whoModel: WHOFunctionalModel | null
): GoalGenerationResult {
  const allConditions = conditions.flatMap(c => c.conditions);
  const allSymptoms = symptoms.flatMap(s => s.symptoms);

  const longTermGoals: GeneratedGoal[] = [];
  const midpointGoals: GeneratedGoal[] = [];
  const microGoals: GeneratedGoal[] = [];

  // Detect profile types
  const hasTrauma = categories.some(c => ['mental_health', 'authority_trauma', 'self_harm'].includes(c));
  const hasCPTSD = allConditions.includes('cptsd') || allConditions.includes('ptsd');
  const hasAddiction = categories.some(c => ['substance_addiction', 'behavioral_addiction', 'eating_disorder'].includes(c));
  const hasEatingDisorder = categories.includes('eating_disorder');
  const hasChronicIllness = categories.some(c => ['chronic_illness', 'neurological', 'physical'].includes(c));
  const hasDevelopmental = categories.includes('developmental') || allConditions.includes('autism') || allConditions.includes('adhd');
  const hasHousingIssues = categories.includes('environmental_hardship') || 
    whoModel?.environmentalBarriers?.some(b => ['homelessness', 'unsafe_relationships'].includes(b));
  const hasJusticeInvolvement = categories.includes('authority_trauma') ||
    allConditions.some(c => c.includes('justice') || c.includes('probation'));

  // === STABILITY GOAL (Everyone) ===
  const stabilityGoal: GeneratedGoal = {
    id: 'stability',
    category: 'stability',
    title: hasTrauma ? 'Build emotional safety day by day' : 'Feel more stable day to day',
    description: hasTrauma 
      ? 'Create grounding routines and safe spaces'
      : 'Develop consistent rhythms for control',
    icon: '🌿',
    type: 'long_term',
  };
  longTermGoals.push(stabilityGoal);

  // Stability mid-goals
  midpointGoals.push({
    id: 'stability_mid_1',
    category: 'stability',
    title: 'Establish one grounding practice',
    description: 'Pick one technique that works for you',
    icon: '🌿',
    type: 'midpoint',
    parentGoalId: 'stability',
  });
  midpointGoals.push({
    id: 'stability_mid_2',
    category: 'stability',
    title: 'Build a morning anchor routine',
    description: 'Something small to start each day',
    icon: '🌿',
    type: 'midpoint',
    parentGoalId: 'stability',
  });

  // Stability micro-goals
  microGoals.push(
    { id: 'stability_micro_1', category: 'stability', title: 'Try box breathing once', description: '', icon: '🌿', type: 'micro', parentGoalId: 'stability_mid_1' },
    { id: 'stability_micro_2', category: 'stability', title: 'Notice 3 things you can see right now', description: '', icon: '🌿', type: 'micro', parentGoalId: 'stability_mid_1' },
    { id: 'stability_micro_3', category: 'stability', title: 'Drink a glass of water when you wake up', description: '', icon: '🌿', type: 'micro', parentGoalId: 'stability_mid_2' },
  );

  // === HEALTH GOAL (Chronic illness) ===
  if (hasChronicIllness) {
    const healthGoal: GeneratedGoal = {
      id: 'health',
      category: 'health',
      title: 'Manage health and symptoms more effectively',
      description: 'Build routines for physical health needs',
      icon: '💊',
      type: 'long_term',
    };
    longTermGoals.push(healthGoal);

    midpointGoals.push({
      id: 'health_mid_1',
      category: 'health',
      title: 'Track symptoms for one week',
      description: 'Notice patterns without judgment',
      icon: '💊',
      type: 'midpoint',
      parentGoalId: 'health',
    });

    microGoals.push(
      { id: 'health_micro_1', category: 'health', title: 'Note how you feel right now (1-10)', description: '', icon: '💊', type: 'micro', parentGoalId: 'health_mid_1' },
      { id: 'health_micro_2', category: 'health', title: 'Take your medication if due', description: '', icon: '💊', type: 'micro', parentGoalId: 'health_mid_1' },
    );
  }

  // === TRAUMA REGULATION GOAL ===
  if (hasTrauma || hasCPTSD) {
    const regulationGoal: GeneratedGoal = {
      id: 'regulation',
      category: 'emotional',
      title: 'Develop better emotional regulation tools',
      description: 'Manage triggers and overwhelming emotions',
      icon: '🧘',
      type: 'long_term',
    };
    longTermGoals.push(regulationGoal);

    midpointGoals.push({
      id: 'regulation_mid_1',
      category: 'emotional',
      title: 'Identify your top 3 triggers',
      description: 'Know what sets you off',
      icon: '🧘',
      type: 'midpoint',
      parentGoalId: 'regulation',
    });
    midpointGoals.push({
      id: 'regulation_mid_2',
      category: 'emotional',
      title: 'Practice one grounding technique daily',
      description: 'Build muscle memory for when you need it',
      icon: '🧘',
      type: 'midpoint',
      parentGoalId: 'regulation',
    });

    microGoals.push(
      { id: 'regulation_micro_1', category: 'emotional', title: 'Notice when your body tenses up', description: '', icon: '🧘', type: 'micro', parentGoalId: 'regulation_mid_1' },
      { id: 'regulation_micro_2', category: 'emotional', title: 'Take 3 slow breaths before reacting', description: '', icon: '🧘', type: 'micro', parentGoalId: 'regulation_mid_2' },
    );
  }

  // === ADDICTION RECOVERY GOAL ===
  if (hasAddiction) {
    const addictionType = hasEatingDisorder ? 'eating patterns' : 
      categories.includes('behavioral_addiction') ? 'behavioral patterns' : 'substance use';
    
    const recoveryGoal: GeneratedGoal = {
      id: 'recovery',
      category: 'recovery',
      title: `Build sustainable recovery from ${addictionType}`,
      description: 'Harm reduction strategies and healthier coping',
      icon: '🌱',
      type: 'long_term',
    };
    longTermGoals.push(recoveryGoal);

    midpointGoals.push({
      id: 'recovery_mid_1',
      category: 'recovery',
      title: 'Map your urge triggers',
      description: 'When do cravings hit hardest?',
      icon: '🌱',
      type: 'midpoint',
      parentGoalId: 'recovery',
    });
    midpointGoals.push({
      id: 'recovery_mid_2',
      category: 'recovery',
      title: 'Build 3 alternative coping options',
      description: 'Things to try before acting out',
      icon: '🌱',
      type: 'midpoint',
      parentGoalId: 'recovery',
    });

    microGoals.push(
      { id: 'recovery_micro_1', category: 'recovery', title: 'Pause and name the urge when it comes', description: '', icon: '🌱', type: 'micro', parentGoalId: 'recovery_mid_1' },
      { id: 'recovery_micro_2', category: 'recovery', title: 'Wait 10 minutes before deciding', description: '', icon: '🌱', type: 'micro', parentGoalId: 'recovery_mid_2' },
      { id: 'recovery_micro_3', category: 'recovery', title: 'Text a safe person instead', description: '', icon: '🌱', type: 'micro', parentGoalId: 'recovery_mid_2' },
    );
  }

  // === DAILY FUNCTIONING GOAL ===
  if (hasDevelopmental || allSymptoms.includes('executive_dysfunction')) {
    const functioningGoal: GeneratedGoal = {
      id: 'functioning',
      category: 'daily_life',
      title: "Build routines that don't crush your energy",
      description: 'Systems that work with your brain',
      icon: '📋',
      type: 'long_term',
    };
    longTermGoals.push(functioningGoal);

    midpointGoals.push({
      id: 'functioning_mid_1',
      category: 'daily_life',
      title: 'Create a simple morning checklist',
      description: '3-5 things max',
      icon: '📋',
      type: 'midpoint',
      parentGoalId: 'functioning',
    });

    microGoals.push(
      { id: 'functioning_micro_1', category: 'daily_life', title: 'Write down one task for today', description: '', icon: '📋', type: 'micro', parentGoalId: 'functioning_mid_1' },
      { id: 'functioning_micro_2', category: 'daily_life', title: 'Set one timer for one thing', description: '', icon: '📋', type: 'micro', parentGoalId: 'functioning_mid_1' },
    );
  }

  // === HOUSING/SAFETY GOAL ===
  if (hasHousingIssues) {
    const housingGoal: GeneratedGoal = {
      id: 'housing',
      category: 'safety',
      title: 'Work toward safer or more secure housing',
      description: 'Steps to improve your living situation',
      icon: '🏠',
      type: 'long_term',
    };
    longTermGoals.push(housingGoal);

    midpointGoals.push({
      id: 'housing_mid_1',
      category: 'safety',
      title: 'Identify housing resources in your area',
      description: 'Shelters, programs, assistance',
      icon: '🏠',
      type: 'midpoint',
      parentGoalId: 'housing',
    });

    microGoals.push(
      { id: 'housing_micro_1', category: 'safety', title: 'Look up one resource today', description: '', icon: '🏠', type: 'micro', parentGoalId: 'housing_mid_1' },
      { id: 'housing_micro_2', category: 'safety', title: 'Save an important phone number', description: '', icon: '🏠', type: 'micro', parentGoalId: 'housing_mid_1' },
    );
  }

  // === JUSTICE NAVIGATION GOAL ===
  if (hasJusticeInvolvement) {
    const justiceGoal: GeneratedGoal = {
      id: 'reentry',
      category: 'navigation',
      title: 'Navigate justice system requirements',
      description: 'Manage appointments and re-entry challenges',
      icon: '⚖️',
      type: 'long_term',
    };
    longTermGoals.push(justiceGoal);

    midpointGoals.push({
      id: 'reentry_mid_1',
      category: 'navigation',
      title: 'Create a calendar for all appointments',
      description: 'Never miss a date',
      icon: '⚖️',
      type: 'midpoint',
      parentGoalId: 'reentry',
    });

    microGoals.push(
      { id: 'reentry_micro_1', category: 'navigation', title: 'Write down your next appointment', description: '', icon: '⚖️', type: 'micro', parentGoalId: 'reentry_mid_1' },
    );
  }

  // Ensure minimum goals
  if (longTermGoals.length < 2) {
    longTermGoals.push({
      id: 'wellbeing',
      category: 'wellbeing',
      title: 'Improve overall wellbeing',
      description: 'Small steps toward feeling better',
      icon: '✨',
      type: 'long_term',
    });

    midpointGoals.push({
      id: 'wellbeing_mid_1',
      category: 'wellbeing',
      title: 'Do one thing you enjoy this week',
      description: 'Even something small',
      icon: '✨',
      type: 'midpoint',
      parentGoalId: 'wellbeing',
    });

    microGoals.push(
      { id: 'wellbeing_micro_1', category: 'wellbeing', title: 'Take a 5-minute break today', description: '', icon: '✨', type: 'micro', parentGoalId: 'wellbeing_mid_1' },
    );
  }

  return {
    longTermGoals: longTermGoals.slice(0, 4),
    midpointGoals,
    microGoals,
  };
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
