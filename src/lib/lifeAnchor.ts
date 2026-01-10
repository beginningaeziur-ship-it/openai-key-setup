/**
 * Life Anchor System
 * 
 * Stability buffer questions that preserve identity during onboarding.
 * Stores only TAGS/CATEGORIES, not raw sensitive text.
 */

// Life Anchor categories - what gives the user purpose/calm
export const LIFE_ANCHOR_CATEGORIES = [
  'music',
  'art',
  'writing',
  'gaming',
  'fitness',
  'cooking',
  'nature',
  'animals',
  'reading',
  'crafts',
  'helping_others',
  'learning',
  'spirituality',
  'family',
  'friends',
  'work',
  'school',
  'other',
] as const;

export type LifeAnchorCategory = typeof LIFE_ANCHOR_CATEGORIES[number];

// Employment/situation categories
export const SITUATION_CATEGORIES = [
  'working',
  'looking_for_work',
  'in_school',
  'neither',
  'prefer_not_to_say',
  'not_sure',
] as const;

export type SituationCategory = typeof SITUATION_CATEGORIES[number];

// Skill categories
export const SKILL_CATEGORIES = [
  'creative',
  'technical',
  'social',
  'physical',
  'analytical',
  'caring',
  'organizing',
  'other',
  'not_sure',
] as const;

export type SkillCategory = typeof SKILL_CATEGORIES[number];

// Life Anchor profile - stored in persistence
export interface LifeAnchorProfile {
  situation?: SituationCategory;
  interests: LifeAnchorCategory[];
  skills: SkillCategory[];
  incomeSource?: string; // category only, not details
  purposeAnchor?: LifeAnchorCategory; // primary life anchor
}

// Stability buffer questions
export interface StabilityBufferQuestion {
  id: string;
  question: string;
  type: 'single' | 'multi';
  category: 'situation' | 'interests' | 'skills' | 'income' | 'purpose';
  options: { label: string; value: string }[];
  allowSkip: boolean;
  allowPreferNot: boolean;
  allowNotSure: boolean;
}

export const STABILITY_BUFFER_QUESTIONS: StabilityBufferQuestion[] = [
  {
    id: 'situation',
    question: "Are you working right now, looking for work, in school, or neither?",
    type: 'single',
    category: 'situation',
    options: [
      { label: 'Working', value: 'working' },
      { label: 'Looking for work', value: 'looking_for_work' },
      { label: 'In school', value: 'in_school' },
      { label: 'Neither', value: 'neither' },
    ],
    allowSkip: true,
    allowPreferNot: true,
    allowNotSure: true,
  },
  {
    id: 'interests',
    question: "What do you like to do when you feel okay?",
    type: 'multi',
    category: 'interests',
    options: [
      { label: 'Music', value: 'music' },
      { label: 'Art', value: 'art' },
      { label: 'Writing', value: 'writing' },
      { label: 'Gaming', value: 'gaming' },
      { label: 'Fitness', value: 'fitness' },
      { label: 'Cooking', value: 'cooking' },
      { label: 'Nature', value: 'nature' },
      { label: 'Reading', value: 'reading' },
      { label: 'Crafts', value: 'crafts' },
      { label: 'Helping others', value: 'helping_others' },
    ],
    allowSkip: true,
    allowPreferNot: true,
    allowNotSure: true,
  },
  {
    id: 'hobbies',
    question: "What are your hobbies or interests?",
    type: 'multi',
    category: 'interests',
    options: [
      { label: 'Music', value: 'music' },
      { label: 'Art', value: 'art' },
      { label: 'Sports/Fitness', value: 'fitness' },
      { label: 'Gaming', value: 'gaming' },
      { label: 'Animals', value: 'animals' },
      { label: 'Outdoors', value: 'nature' },
      { label: 'Learning', value: 'learning' },
      { label: 'Socializing', value: 'friends' },
    ],
    allowSkip: true,
    allowPreferNot: true,
    allowNotSure: true,
  },
  {
    id: 'income',
    question: "How do you usually earn money?",
    type: 'single',
    category: 'income',
    options: [
      { label: 'Job/Employment', value: 'employment' },
      { label: 'Self-employed', value: 'self_employed' },
      { label: 'Benefits/Assistance', value: 'benefits' },
      { label: 'Family/Support', value: 'family_support' },
      { label: 'Other', value: 'other' },
    ],
    allowSkip: true,
    allowPreferNot: true,
    allowNotSure: true,
  },
  {
    id: 'skills',
    question: "What are you good at, even if it doesn't feel like it counts?",
    type: 'multi',
    category: 'skills',
    options: [
      { label: 'Creative things', value: 'creative' },
      { label: 'Technical/Computers', value: 'technical' },
      { label: 'Talking to people', value: 'social' },
      { label: 'Physical work', value: 'physical' },
      { label: 'Figuring things out', value: 'analytical' },
      { label: 'Taking care of others', value: 'caring' },
      { label: 'Organizing/Planning', value: 'organizing' },
    ],
    allowSkip: true,
    allowPreferNot: true,
    allowNotSure: true,
  },
  {
    id: 'purpose',
    question: "What gives you a sense of purpose or calm?",
    type: 'single',
    category: 'purpose',
    options: [
      { label: 'Music', value: 'music' },
      { label: 'Art/Creating', value: 'art' },
      { label: 'Helping others', value: 'helping_others' },
      { label: 'Nature/Animals', value: 'nature' },
      { label: 'Learning', value: 'learning' },
      { label: 'Family/Friends', value: 'family' },
      { label: 'Spirituality', value: 'spirituality' },
      { label: 'Work/Career', value: 'work' },
    ],
    allowSkip: true,
    allowPreferNot: true,
    allowNotSure: true,
  },
];

// Get friendly label for a life anchor category
export function getLifeAnchorLabel(category: LifeAnchorCategory): string {
  const labels: Record<LifeAnchorCategory, string> = {
    music: 'Music',
    art: 'Art & Creating',
    writing: 'Writing',
    gaming: 'Gaming',
    fitness: 'Fitness & Movement',
    cooking: 'Cooking',
    nature: 'Nature & Outdoors',
    animals: 'Animals',
    reading: 'Reading',
    crafts: 'Crafts & Making',
    helping_others: 'Helping Others',
    learning: 'Learning',
    spirituality: 'Spirituality',
    family: 'Family',
    friends: 'Friends & Social',
    work: 'Work & Career',
    school: 'School & Education',
    other: 'Other',
  };
  return labels[category] || category;
}
