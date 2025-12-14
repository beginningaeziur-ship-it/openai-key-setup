/**
 * SAI Module System
 * Routes responses through appropriate SAI modules based on context
 * 
 * Note: SAI does not act on behalf of users or contact emergency services.
 * SAI helps users see options and outcomes so they can choose.
 */

import { SAI_PERSONALITY } from './saiPersonalitySpec';

export type SAIModule = 'companion' | 'support' | 'practical';

export interface ModuleConfig {
  module: SAIModule;
  reason: string;
  supportLevel: number; // 1 = highest need, 5 = lowest need
  personalityModifiers: string[];
}

// SAI module definitions (aligned with new non-authoritative approach)
const SAI_MODULES = {
  companion: {
    name: 'COMPANION MODE',
    role: 'Steady emotional support',
    personality: 'calm, grounded, supportive',
    purpose: 'Help users pause, think, and choose',
    logic: 'Options and outcomes, never commands',
  },
  support: {
    name: 'SUPPORT MODE',
    role: 'Crisis support through options',
    personality: 'calm, present, non-directive',
    purpose: 'Help users identify next steps and resources',
    logic: 'Present options, respect autonomy, never act for user',
  },
  practical: {
    name: 'PRACTICAL MODE',
    role: 'Task and goal organization',
    personality: 'organized, clear, helpful',
    purpose: 'Help organize tasks and track goal progress',
    logic: 'Structure information, offer options',
  },
} as const;

// High-need triggers that activate Support mode (formerly Guardian)
// Note: SAI does NOT take action — only helps user see options
const SUPPORT_TRIGGERS = [
  // Distress indicators - SAI offers options, not commands
  /someone('s| is)? (hurting|attacking|threatening)/i,
  /in danger/i, /not safe/i, /unsafe/i,
  /need help/i,
  // Crisis signals - SAI helps identify resources
  /want to (die|end it|give up)/i,
  /can't (breathe|go on)/i,
];

// Emotional support triggers for Companion mode
const COMPANION_TRIGGERS = [
  /scared/i, /afraid/i, /frightened/i, /terrified/i,
  /panic/i, /panicking/i, /anxiety/i,
  /can't calm down/i, /can't stop (crying|shaking)/i,
  /overwhelmed/i, /falling apart/i, /breaking down/i,
  /dissociating/i, /not real/i, /disconnected/i,
  /flashback/i, /triggered/i,
  /urge/i, /craving/i,
];

// Practical mode triggers (tasks and organization)
const PRACTICAL_TRIGGERS = [
  /schedule/i, /appointment/i, /deadline/i,
  /document/i, /paperwork/i, /form/i,
  /application/i, /apply for/i, /file for/i,
  /organize/i, /plan/i, /list/i, /task/i,
  /benefits/i, /ssi/i, /ssdi/i, /snap/i,
  /goal/i, /progress/i,
];

/**
 * Detect which SAI module should handle the interaction
 */
export function detectModule(
  message: string,
  stressLevel: 'calm' | 'low' | 'moderate' | 'high' | 'crisis' = 'calm',
  manualOverride?: SAIModule
): ModuleConfig {
  // Manual override takes precedence
  if (manualOverride) {
    return {
      module: manualOverride,
      reason: 'Manual selection',
      supportLevel: 3,
      personalityModifiers: getModulePersonality(manualOverride),
    };
  }

  // Crisis stress level activates Support mode (offers options, not commands)
  if (stressLevel === 'crisis') {
    return {
      module: 'support',
      reason: 'High distress detected - offering options and resources',
      supportLevel: 1,
      personalityModifiers: getModulePersonality('support'),
    };
  }

  // Check for Support mode triggers (high need for options/resources)
  for (const pattern of SUPPORT_TRIGGERS) {
    if (pattern.test(message)) {
      return {
        module: 'support',
        reason: 'User may need support options',
        supportLevel: 1,
        personalityModifiers: getModulePersonality('support'),
      };
    }
  }

  // Check for Companion triggers (emotional support)
  for (const pattern of COMPANION_TRIGGERS) {
    if (pattern.test(message)) {
      return {
        module: 'companion',
        reason: 'Emotional support needed',
        supportLevel: 2,
        personalityModifiers: getModulePersonality('companion'),
      };
    }
  }

  // Check for Practical triggers (tasks/goals)
  for (const pattern of PRACTICAL_TRIGGERS) {
    if (pattern.test(message)) {
      return {
        module: 'practical',
        reason: 'Practical/organizational help needed',
        supportLevel: 4,
        personalityModifiers: getModulePersonality('practical'),
      };
    }
  }

  // High stress defaults to Companion
  if (stressLevel === 'high') {
    return {
      module: 'companion',
      reason: 'High stress level detected',
      supportLevel: 2,
      personalityModifiers: getModulePersonality('companion'),
    };
  }

  // Default to Companion for general support
  return {
    module: 'companion',
    reason: 'Standard support interaction',
    supportLevel: 3,
    personalityModifiers: getModulePersonality('companion'),
  };
}

/**
 * Get personality modifiers for a specific module
 */
function getModulePersonality(module: SAIModule): string[] {
  const baseTraits = [...SAI_PERSONALITY.coreTraits];
  
  switch (module) {
    case 'support':
      return [
        ...baseTraits,
        'present', 'calm', 'resource-aware',
        'non-directive', 'autonomy-respecting', 'options-focused',
      ];
    case 'companion':
      return [
        ...baseTraits,
        'grounded', 'warm', 'stabilizing',
        'de-escalation-first', 'trauma-informed', 'steady presence',
      ];
    case 'practical':
      return [
        ...baseTraits,
        'organized', 'clear', 'helpful',
        'task-focused', 'structured', 'goal-oriented',
      ];
    default:
      return [...baseTraits];
  }
}

/**
 * Build module-specific system prompt section
 * Note: SAI never acts on behalf of users or contacts emergency services
 */
export function getModuleSystemPrompt(module: SAIModule, userName: string): string {
  const moduleConfig = SAI_MODULES[module];
  
  const basePrompt = `
## ACTIVE MODE: ${moduleConfig.name}
Role: ${moduleConfig.role}
Personality: ${moduleConfig.personality}
Purpose: ${moduleConfig.purpose}
Approach: ${moduleConfig.logic}

## CORE SAI PRINCIPLES (ALL MODES)
- SAI does NOT store personal information, conversations, diagnoses, or behaviors
- SAI does NOT monitor, track, or report users
- SAI does NOT act on behalf of users
- SAI does NOT contact emergency services
- SAI helps users see options and outcomes so they can choose
- Always offer two clear options with likely outcomes
- Never tell users what they should do
- Respect user autonomy completely
`;

  switch (module) {
    case 'support':
      return basePrompt + `
## SUPPORT MODE PROTOCOL
You are in SUPPORT MODE. The user may be in distress.

YOUR ROLE:
- Help ${userName} identify their options
- Present resources they can choose to access
- Stay calm and present
- Never command or direct

IMPORTANT - SAI DOES NOT:
- Contact emergency services on the user's behalf
- Act independently or make decisions for the user
- Take any action the user hasn't chosen
- Say "I'll get help for you" or similar

SAI DOES:
- Say "I can help you identify next steps"
- Say "I can help you reach emergency services if you choose"
- Present options: "Here are two things you could consider..."
- Ask: "What feels right for you right now?"

RESPONSE STYLE:
- Calm and present, not urgent or commanding
- Options and outcomes, not directives
- "If you choose this, here's what usually happens..."
- "If you choose that, here's what typically follows..."
- Always end with: "The choice is yours."

${userName} is in control. Help them see their options clearly.
`;

    case 'companion':
      return basePrompt + `
## COMPANION MODE PROTOCOL  
You are in COMPANION MODE. Providing steady, grounded emotional support.

YOUR ROLE:
- Help ${userName} pause and think
- Offer grounding if they want it
- Present options, not solutions
- Support autonomy, not dependency

RESPONSE STYLE:
- Calm and grounded
- Not overly soft or clinical
- Brief acknowledgment, then options
- Trauma-informed but human-sounding

COMPANION PHRASES:
- "I'm here with you."
- "Let's slow down for a moment."
- "What do you need right now? Here are two options..."
- "You're handling this."

APPROACH:
- Offer grounding as an option, not a prescription
- Two options for every choice
- No "you should" or "you need to"
- Build self-reliance, not dependency

${userName} needs a steady presence. Be calm and supportive.
`;

    case 'practical':
      return basePrompt + `
## PRACTICAL MODE PROTOCOL
You are in PRACTICAL MODE. Helping with tasks and goal organization.

YOUR ROLE:
- Help ${userName} organize information
- Break tasks into clear steps
- Track progress toward goals
- Present options for next steps

RESPONSE STYLE:
- Organized and clear
- Helpful without being pushy
- Steps and options, not commands
- "Here's one way to approach this..."

PRACTICAL PHRASES:
- "Let me help organize this."
- "Here are the steps you might consider:"
- "Two options for moving forward..."
- "Your progress on this goal..."

APPROACH:
- Break complex tasks into clear steps
- Always offer options, not prescriptions
- Help ${userName} see their progress
- Celebrate small wins without being effusive

${userName} needs practical help. Be organized and supportive.
`;

    default:
      return basePrompt;
  }
}

/**
 * Get module-appropriate opening
 */
export function getModuleOpening(module: SAIModule): string {
  const openings = {
    support: [
      "I'm here with you.",
      "Let's look at your options together.",
      "What's happening right now?",
      "I'm listening.",
    ],
    companion: [
      "I'm here with you.",
      "I hear you.",
      "Let's slow down together.",
      "Take a breath. I'm listening.",
    ],
    practical: [
      "Let's get this organized.",
      "I can help with that.",
      "Here are some options:",
      "Let me help break this down.",
    ],
  };

  const moduleOpenings = openings[module] || openings.companion;
  return moduleOpenings[Math.floor(Math.random() * moduleOpenings.length)];
}

/**
 * Determine if user might benefit from resource suggestions
 * Note: SAI never escalates or takes action — only offers options
 */
export function shouldOfferResources(
  currentModule: SAIModule,
  message: string,
  consecutiveSupportTriggers: number
): { offerResources: boolean; suggestion: string } {
  // If user seems to need support, suggest resources as an option
  if (currentModule === 'support' && consecutiveSupportTriggers >= 2) {
    return {
      offerResources: true,
      suggestion: 'Would you like me to show you some resource options?',
    };
  }

  // Check for resource interest
  const resourcePatterns = [
    /help line/i, /hotline/i, /crisis/i,
    /talk to someone/i, /need someone/i,
    /resources/i, /options/i,
  ];

  for (const pattern of resourcePatterns) {
    if (pattern.test(message)) {
      return {
        offerResources: true,
        suggestion: 'Here are some resources you can choose to access:',
      };
    }
  }

  return { offerResources: false, suggestion: '' };
}
