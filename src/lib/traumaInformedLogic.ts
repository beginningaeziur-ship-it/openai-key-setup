/**
 * Trauma-Informed Response Logic for SAI
 * 
 * This module provides:
 * 1. Two-choice decision framework (never tell user what to do)
 * 2. Integration with 9 Steps to Self-Discovery
 * 3. Non-authoritative, supportive response patterns
 */

import { AEZUIR_NINE_STEPS, getStepByNumber, getStepForSituation } from './aezuirNineSteps';

// Professional App language (renamed from Watcher)
export const PROFESSIONAL_APP_LANGUAGE = {
  name: "Professional App",
  shortName: "your care team's view",
  description: "A separate portal where your care team can see your general progress — never your private conversations or details.",
  privacyNote: "Staff see only stability percentages and trends — not behavior, symptoms, or personal information.",
  pinNote: "Your PIN protects your goals and progress, not your identity.",
  controlNote: "You control who, if anyone, has access.",
  neverShared: "Content, conversations, urges, and personal details are never shared.",
  progressOnly: "Progress only, not details.",
  optional: "The Professional App is completely optional.",
} as const;

// Two-choice decision framework
export interface TwoChoiceDecision {
  context: string;
  optionA: {
    label: string;
    description: string;
    outcome: string;
    relatedStep?: number; // Links to 9 steps
  };
  optionB: {
    label: string;
    description: string;
    outcome: string;
    relatedStep?: number;
  };
  closingNote: string;
}

/**
 * Generate a trauma-informed two-choice response
 * Never tells user what to do - only shows options and outcomes
 */
export function generateTwoChoiceResponse(decision: TwoChoiceDecision): string {
  const stepRefA = decision.optionA.relatedStep 
    ? ` (This connects to Step ${decision.optionA.relatedStep}: ${getStepByNumber(decision.optionA.relatedStep)?.title})`
    : '';
  const stepRefB = decision.optionB.relatedStep
    ? ` (This connects to Step ${decision.optionB.relatedStep}: ${getStepByNumber(decision.optionB.relatedStep)?.title})`
    : '';

  return `${decision.context}

Here are two options:

**Option 1: ${decision.optionA.label}**
${decision.optionA.description}
If you choose this, here's what usually happens: ${decision.optionA.outcome}${stepRefA}

**Option 2: ${decision.optionB.label}**
${decision.optionB.description}
If you choose this, here's what typically follows: ${decision.optionB.outcome}${stepRefB}

${decision.closingNote}`;
}

/**
 * Spoken version of two-choice (for voice)
 */
export function speakTwoChoiceResponse(decision: TwoChoiceDecision): string {
  return `${decision.context} Here are two options. 

First option: ${decision.optionA.label}. ${decision.optionA.description}. If you choose this, here's what usually happens: ${decision.optionA.outcome}.

Second option: ${decision.optionB.label}. ${decision.optionB.description}. If you choose this, here's what typically follows: ${decision.optionB.outcome}.

${decision.closingNote}`;
}

// Common two-choice scenarios
export const COMMON_DECISIONS: Record<string, TwoChoiceDecision> = {
  continueOrPause: {
    context: "I notice you might need a moment.",
    optionA: {
      label: "Continue",
      description: "We keep going at this pace.",
      outcome: "We move forward together.",
      relatedStep: 3, // Regulate first
    },
    optionB: {
      label: "Pause",
      description: "We take a break and breathe.",
      outcome: "You get space to settle, and we can continue when you're ready.",
      relatedStep: 3,
    },
    closingNote: "The choice is yours. There's no wrong answer here.",
  },
  
  skipOrComplete: {
    context: "This part is optional.",
    optionA: {
      label: "Complete it now",
      description: "We finish this section together.",
      outcome: "You'll have a more complete picture to work with.",
      relatedStep: 1, // Notice what's happening
    },
    optionB: {
      label: "Skip for now",
      description: "We move on and come back later if you want.",
      outcome: "No pressure. You can always return to this.",
      relatedStep: 7, // Replace, don't punish
    },
    closingNote: "Skipping is always okay. There's no rush here.",
  },
  
  talkOrGround: {
    context: "I'm here with you.",
    optionA: {
      label: "Talk it through",
      description: "We explore what you're experiencing together.",
      outcome: "Sometimes naming things helps them feel smaller.",
      relatedStep: 4, // Understand your pattern
    },
    optionB: {
      label: "Ground first",
      description: "We pause and do a quick grounding exercise.",
      outcome: "Your nervous system settles, making everything clearer.",
      relatedStep: 3, // Regulate first
    },
    closingNote: "Either way, I'm here. What feels right?",
  },
  
  shareOrPrivate: {
    context: "This information could help me support you better.",
    optionA: {
      label: "Share",
      description: "You tell me what's relevant.",
      outcome: "I can tailor support more closely to your needs.",
      relatedStep: 5, // Identify your real needs
    },
    optionB: {
      label: "Keep private",
      description: "You hold onto this for now.",
      outcome: "Your privacy is protected. We work with what you're comfortable sharing.",
      relatedStep: 2, // Protect your identity
    },
    closingNote: "Privacy is always respected. You decide what to share.",
  },
  
  professionalAppSetup: {
    context: "The Professional App lets your care team see your general progress.",
    optionA: {
      label: "Set it up",
      description: "Connect a trusted professional to see your stability trends.",
      outcome: "They see only percentages and trends — never private details or conversations.",
      relatedStep: 8, // Repair what you can
    },
    optionB: {
      label: "Skip this",
      description: "Keep this private for now.",
      outcome: "No one else has access. You can set this up later if you choose.",
      relatedStep: 2, // Protect your identity
    },
    closingNote: "This is completely optional. You control who sees your progress.",
  },
};

// Shame spiral intervention
export const SHAME_SPIRAL_RESPONSE = {
  separatePersonFromAction: (action: string) => 
    `You ${action}. That's an action, not a definition of who you are.`,
  
  validateEmotion: (emotion: string = "heavy") => 
    `That feels ${emotion}. I'm here with you.`,
  
  offerReset: (): TwoChoiceDecision => ({
    context: "Let's take a breath together.",
    optionA: {
      label: "Try a smaller step",
      description: "We find something more manageable right now.",
      outcome: "Small wins build momentum without overwhelm.",
      relatedStep: 6, // Choose one small safer step
    },
    optionB: {
      label: "Pause completely",
      description: "We stop and just breathe for a moment.",
      outcome: "Sometimes rest is the most important step.",
      relatedStep: 3, // Regulate first
    },
    closingNote: "Neither choice is giving up. Both are moving forward.",
  }),
};

/**
 * Get relevant 9-step guidance for current situation
 */
export function getSituationalGuidance(situation: 'overwhelmed' | 'stuck' | 'urge' | 'crisis' | 'progress'): string {
  const step = getStepForSituation(situation);
  if (!step) return "Let's take this one moment at a time.";
  
  return `Right now, Step ${step.number} might help: "${step.title}" — ${step.description}`;
}

/**
 * Professional App introduction speech (for onboarding)
 */
export function getProfessionalAppIntro(): string {
  return `There's also something called the ${PROFESSIONAL_APP_LANGUAGE.name}. ${PROFESSIONAL_APP_LANGUAGE.description} ${PROFESSIONAL_APP_LANGUAGE.controlNote}`;
}

/**
 * Professional App explanation when user asks questions
 */
export function getProfessionalAppExplanation(): string {
  return `The ${PROFESSIONAL_APP_LANGUAGE.name} is ${PROFESSIONAL_APP_LANGUAGE.optional}. It's just a way for someone you trust — like a counselor or case worker — to check on your general stability. ${PROFESSIONAL_APP_LANGUAGE.privacyNote} ${PROFESSIONAL_APP_LANGUAGE.neverShared} You're always in control.`;
}
