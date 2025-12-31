/**
 * SAI Copy Library
 * Centralized copy for consistent messaging across the app
 * 
 * CORE TRUTH: "SAI remembers goals and progress, not people."
 */

// Privacy disclaimers to show at data entry points
export const PRIVACY_DISCLAIMERS = {
  general: {
    short: "Nothing you enter here is saved as personal information.",
    full: "Nothing you enter here is saved as personal information. SAI uses these selections only to shape the size and structure of your support goals. This information is not stored, tracked, or shared.",
  },
  categories: {
    text: "Nothing you select here is saved as personal information. SAI uses these selections only to shape the structure of your support goals.",
  },
  conditions: {
    text: "These selections help shape your goals. They are not stored as diagnoses or personal records.",
  },
  symptoms: {
    text: "This information is used to shape how SAI supports you. It is not stored, tracked, or shared with anyone.",
  },
  urges: {
    text: "A private place to notice an urge, talk it through, and reconnect to your goals or support. Urges are not stored, tracked, or reported — they are released after the moment.",
  },
  safety: {
    text: "Your safety information stays with you. SAI does not contact emergency services. SAI can help you identify next steps if you choose.",
  },
} as const;

// Decision-making language
export const DECISION_LANGUAGE = {
  intro: "Here are two options.",
  optionA: "If you choose this, here's what usually happens next:",
  optionB: "If you choose that, here's what typically follows:",
  closing: "The choice is yours.",
  noAdvice: "SAI doesn't tell you what to do — only helps you see your options clearly.",
} as const;

// Emergency language (never implies SAI takes action)
export const EMERGENCY_LANGUAGE = {
  helpIdentify: "I can help you identify next steps.",
  reachServices: "I can help you reach emergency services if you choose.",
  options: "Here are some options you can consider:",
  resources: "These resources are available to you:",
  yourChoice: "What feels right for you right now?",
} as const;

// Watcher/professional view language
export const WATCHER_LANGUAGE = {
  pinPurpose: "The PIN protects your goals and progress, not your identity.",
  watcherPurpose: "Staff see only a percentage of your progress — not behavior, symptoms, or personal information.",
  neverShared: "Content, conversations, urges, and personal details are never shared.",
  progressOnly: "Progress only, not details.",
} as const;

// SAI introduction language
export const SAI_INTRO = {
  greeting: "I'm SAI — here to walk alongside you.",
  role: "Think of me as a steady presence, like a service animal. I help you pause, think, and choose.",
  privacy: "I don't store your personal information, conversations, or diagnoses. I remember your goals and progress, not you as a person.",
  howIHelp: "I help by showing you options and what usually follows each one. The choices are always yours.",
  notAThreat: "I don't monitor, track, or report. I don't contact anyone on your behalf. I'm here to support, not supervise.",
} as const;

// Addiction/urge support language
export const URGE_SUPPORT = {
  intro: "A private place to notice an urge, talk it through, and reconnect to your goals.",
  notice: "What are you noticing right now?",
  talkThrough: "Let's talk through what's happening.",
  outcomes: "Here's what usually happens with each choice:",
  reconnect: "Would you like to reconnect to a goal or reach out to someone?",
  release: "This moment passes. Urges are not stored or tracked.",
  private: "This stays private. Urges are released after the moment.",
} as const;

// Grounding and support language
export const SUPPORT_LANGUAGE = {
  present: "I'm here with you.",
  noRush: "There's no rush. Take your time.",
  pause: "Let's pause for a moment.",
  breathe: "Take a breath.",
  options: "Here are your options right now:",
  yourPace: "We go at your pace.",
} as const;

// Button and action labels
export const ACTION_LABELS = {
  continue: "Continue",
  back: "Back",
  skip: "Skip for now",
  understand: "I understand",
  ready: "I'm ready",
  notNow: "Not right now",
  showOptions: "Show my options",
  talkItThrough: "Talk it through",
  needSupport: "I need support",
  imOkay: "I'm okay",
  slowDown: "Slow down",
} as const;

// Error messages (calm, non-clinical)
export const ERROR_MESSAGES = {
  general: "Something didn't work. Let's try again.",
  network: "Connection issue. Your information is safe.",
  voice: "Voice isn't working right now. We can continue with text.",
} as const;

// Consent and pacing language
export const CONSENT_LANGUAGE = {
  pauseReminder: "You don't have to answer everything today. You can pause, skip, or come back later.",
  paceControl: "You're in control of the pace.",
  skipOkay: "Skipping is always okay.",
  noRush: "There's no rush here.",
} as const;

// Identity-safe framing for assessments
export const IDENTITY_SAFE = {
  preAssessment: "These questions help us suggest goals that may support you. They do not define you. They are not diagnoses. They are not permanent.",
  weekToFinish: "You'll have the next week to finish, change, or remove anything.",
  notLocked: "Nothing here is locked in.",
} as const;

// Gradual goal building
export const GOAL_BUILD = {
  gradualIntro: "We'll build your goals gradually over the next week. These goals are guides, not rules.",
  notDefining: "Nothing here decides who you are.",
  progressNotPerfection: "We'll focus on progress, not perfection.",
} as const;

// First week check-in copy (days 1-7)
export const FIRST_WEEK_CHECKIN = {
  day1: {
    morning: "Today is just about settling in. No goals to complete.",
    evening: "You made it through your first day. That's enough.",
  },
  midWeek: {
    morning: "We're building your goals slowly. One small step is enough.",
    evening: "Any progress today counts. Even rest is progress.",
  },
  day7: {
    morning: "This is the last day of your first week. Nothing is locked in.",
    evening: "This week helped us understand what supports you. Nothing is locked in.",
  },
} as const;

// Food and care language (consent-based, not obligatory)
export const CARE_LANGUAGE = {
  food: {
    gentle: [
      "If you'd like, we can take a moment to think about nourishment together.",
      "Eating can be hard sometimes. If this feels like a good moment, we can check in about food.",
      "There's no rush here. When you're ready, we can talk about nourishment in a way that feels manageable.",
    ],
    skipNote: "Skipping is always okay.",
  },
  water: {
    gentle: "Hydration can help. No pressure, just a gentle reminder.",
    skipNote: "Skipping is always okay.",
  },
  movement: {
    gentle: "If your body feels ready, movement can help. Only if it feels right.",
    skipNote: "Skipping is always okay.",
  },
} as const;
