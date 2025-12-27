/**
 * SAI — PRODUCT & UI SPECIFICATION
 * Critical UI/UX rules for trauma-informed interface behavior
 * 
 * ONE-SENTENCE PRODUCT TRUTH:
 * Sai is a visible companion guiding the user through safety, routine, and care.
 * Nothing speaks, moves, asks, or changes without Sai present and explaining why.
 */

// ============================================================================
// LOGO BEHAVIOR (CRITICAL)
// ============================================================================

export const SAI_LOGO_RULES = {
  animation: {
    maxDuration: 3, // seconds
    playsOnce: true,
    noInfiniteLoop: true,
    noDependencyOnDataLoading: true,
  },
  
  resolution: 'Logo must always resolve into Sai visible',
  
  failsafe: 'If anything takes too long → logo freezes into calm idle → Sai appears anyway',
  
  principle: 'The logo is not a state. The logo is a transition.',
} as const;

// ============================================================================
// FIRST MOMENT (NO BLANK SCREENS)
// ============================================================================

export const SAI_FIRST_MOMENT = {
  rules: [
    'Sai is visible from moment one',
    'Sai speaks first',
    'No screen, card, or question appears before Sai introduces it',
  ],
  
  principle: 'If Sai is not visible, the app is not allowed to ask anything.',
} as const;

// ============================================================================
// SPLIT SCREENS (FIXED ROLE)
// ============================================================================

export const SAI_SPLIT_SCREEN = {
  layout: {
    leftSide: 'Sai present (always)',
    rightSide: 'Notebook / cards / UI',
  },
  
  neverAllowed: [
    'Sai becomes text-only',
    'Sai becomes a floating status indicator',
    'Sai without a body',
    '"SAI is speaking…" without visual presence',
  ],
  
  principle: 'Sai always has a body.',
} as const;

// ============================================================================
// NOTEBOOK VS OFFICE (UNIFIED)
// ============================================================================

export const SAI_SPACE_HIERARCHY = {
  persistent: 'Office / cabin is the persistent world',
  overlay: 'Notebook is an overlay, not a destination',
  
  mentalModel: [
    'Sai sits in the room',
    'Sai pulls out the notebook',
    'Work happens',
    'Notebook closes',
    'Room remains',
  ],
  
  principle: 'Background never changes during onboarding. Only overlays change.',
} as const;

// ============================================================================
// ONBOARDING ORDER (HARD LOCK)
// ============================================================================

export const SAI_ONBOARDING_ORDER = {
  sequence: [
    { step: 1, name: 'Logo resolves' },
    { step: 2, name: 'Sai appears and speaks' },
    { step: 3, name: '"Who" assessment (Sai introduces questions)' },
    { step: 4, name: 'Safety plan creation' },
    { step: 5, name: 'Enter Home-Base Cabin' },
  ],
  
  neverBefore: {
    safety: [
      'Environment selection',
      'Aesthetic choices',
    ],
    relationship: [
      'Forms',
      'Assessments without Sai introduction',
    ],
  },
  
  locked: true,
} as const;

// ============================================================================
// "WHO" ASSESSMENT SCREEN
// ============================================================================

export const SAI_ASSESSMENT_RULES = {
  problems: [
    '"What are you living with?" feels invasive',
    'Feels like intake, not care',
  ],
  
  corrections: [
    'Sai explains the question first',
    'Copy framed as support calibration',
  ],
  
  rules: [
    'All assessment questions are introduced by Sai in first person',
    'No standalone assessment UI',
  ],
} as const;

// ============================================================================
// ENVIRONMENTS (TASK-BASED, NOT AESTHETIC)
// ============================================================================

export const SAI_ENVIRONMENT_PURPOSES = {
  homeBaseCabin: {
    name: 'Home-Base Cabin',
    purpose: ['Daily routine', 'Goals', '12-step', 'Responsibility'],
  },
  recoveryCabin: {
    name: 'Recovery Cabin',
    purpose: ['Reflection', 'Writing', 'Step work'],
  },
  woods: {
    name: 'Woods',
    purpose: ['Midday grounding', 'Movement', 'Reset'],
  },
  ocean: {
    name: 'Ocean',
    purpose: ['Meditation', 'Panic regulation', 'Sleep'],
  },
  
  principle: 'Users do not choose environments on onboarding. Sai moves the user when needed.',
} as const;

// ============================================================================
// RESPONSIBILITY SYSTEM (DOG CARE)
// ============================================================================

export const SAI_CARE_MECHANICS = {
  needs: ['food', 'water', 'rest', 'movement'],
  mirror: 'These mirror self-care',
  
  noFailureStates: true,
  noPunishment: true,
  
  missedCareResult: {
    stimulation: 'lower',
    presence: 'softer',
    access: 'never lost',
  },
} as const;

// ============================================================================
// TONE CONSISTENCY (UI COPY)
// ============================================================================

export const SAI_COPY_RULES = {
  allowedVoices: [
    'Spoken by Sai',
    'Written as if Sai is narrating',
  ],
  
  neverAllowed: [
    'System voice',
    'Clinical headings',
    'Motivational slogans',
  ],
  
  principle: 'All copy sounds like Sai or Sai narrating.',
} as const;

// ============================================================================
// PREVIEW VS LIVE (DEPLOY RULE)
// ============================================================================

export const SAI_DEPLOY_RULES = {
  rule: 'Preview = live',
  
  neverAllowed: [
    'Preview-only onboarding flows',
    'Hidden fallbacks',
  ],
  
  principle: 'If it doesn\'t look right in live, preview doesn\'t count.',
} as const;

// ============================================================================
// VALIDATION HELPER
// ============================================================================

export const validateScreen = (screenState: {
  saiVisible: boolean;
  saiHasBody: boolean;
  saiSpokeFirst: boolean;
  backgroundChanged: boolean;
}): { valid: boolean; violations: string[] } => {
  const violations: string[] = [];
  
  if (!screenState.saiVisible) {
    violations.push('Sai must be visible');
  }
  if (!screenState.saiHasBody) {
    violations.push('Sai must have a body (not text-only)');
  }
  if (!screenState.saiSpokeFirst) {
    violations.push('Sai must introduce content before it appears');
  }
  if (screenState.backgroundChanged) {
    violations.push('Background should not change during onboarding');
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
};

// ============================================================================
// PRODUCT TRUTH (USE TO CHECK EVERYTHING)
// ============================================================================

export const SAI_PRODUCT_TRUTH = 
  'Sai is a visible companion guiding the user through safety, routine, and care. ' +
  'Nothing speaks, moves, asks, or changes without Sai present and explaining why. ' +
  'If a screen violates that sentence, it\'s wrong.';