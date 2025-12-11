/**
 * SAI Module System
 * Routes responses through appropriate SAI modules based on context and threat level
 */

import { SAI_MODULES, SAI_PERSONALITY, THREAT_RANKING, SAI_PURPOSE } from './saiPersonalitySpec';

export type SAIModule = 'companion' | 'guardian' | 'ops' | 'sona';

export interface ModuleConfig {
  module: SAIModule;
  reason: string;
  threatLevel: number;
  personalityModifiers: string[];
}

// High-threat triggers that activate Guardian mode
const GUARDIAN_TRIGGERS = [
  // Immediate danger
  /someone('s| is)? (hurting|attacking|threatening|hitting|choking)/i,
  /being (followed|stalked|attacked|abused)/i,
  /in danger/i, /not safe/i, /unsafe/i, /emergency/i,
  /help me now/i, /need help now/i,
  // Crisis escalation
  /going to (hurt|kill|end)/i, /want to (die|end it|give up)/i,
  /can't (breathe|survive|take it|go on)/i,
  // Hostile contact
  /threatening me/i, /they('re| are) (here|coming|outside)/i,
  /broke in/i, /weapon/i, /gun/i, /knife/i,
  // Abuse indicators
  /he('s| is) (hurting|hitting|choking)/i,
  /she('s| is) (hurting|hitting|choking)/i,
  /they('re| are) (hurting|hitting|choking)/i,
  /locked me/i, /won't let me (leave|go|out)/i,
];

// Medium-threat triggers for elevated Companion vigilance
const ELEVATED_COMPANION_TRIGGERS = [
  /scared/i, /afraid/i, /frightened/i, /terrified/i,
  /panic/i, /panicking/i, /anxiety attack/i,
  /can't calm down/i, /can't stop (crying|shaking)/i,
  /overwhelmed/i, /falling apart/i, /breaking down/i,
  /dissociating/i, /not real/i, /disconnected/i,
  /flashback/i, /triggered/i, /memory/i,
  /relapse/i, /urge/i, /craving/i,
];

// Ops mode triggers (business/practical matters)
const OPS_TRIGGERS = [
  /schedule/i, /appointment/i, /deadline/i,
  /document/i, /paperwork/i, /form/i,
  /application/i, /apply for/i, /file for/i,
  /organize/i, /plan/i, /list/i, /task/i,
  /benefits/i, /ssi/i, /ssdi/i, /snap/i,
  /court date/i, /probation/i, /parole/i,
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
      threatLevel: 0,
      personalityModifiers: getModulePersonality(manualOverride),
    };
  }

  // Crisis stress level always triggers Guardian
  if (stressLevel === 'crisis') {
    return {
      module: 'guardian',
      reason: 'Crisis-level distress detected',
      threatLevel: 1,
      personalityModifiers: getModulePersonality('guardian'),
    };
  }

  // Check for Guardian triggers (highest priority)
  for (const pattern of GUARDIAN_TRIGGERS) {
    if (pattern.test(message)) {
      return {
        module: 'guardian',
        reason: 'Immediate safety threat detected',
        threatLevel: 1,
        personalityModifiers: getModulePersonality('guardian'),
      };
    }
  }

  // Check for elevated Companion triggers
  for (const pattern of ELEVATED_COMPANION_TRIGGERS) {
    if (pattern.test(message)) {
      return {
        module: 'companion',
        reason: 'Emotional distress requiring stabilization',
        threatLevel: 3,
        personalityModifiers: getModulePersonality('companion'),
      };
    }
  }

  // Check for Ops triggers (practical/business matters)
  for (const pattern of OPS_TRIGGERS) {
    if (pattern.test(message)) {
      return {
        module: 'ops',
        reason: 'Practical/organizational task detected',
        threatLevel: 6,
        personalityModifiers: getModulePersonality('ops'),
      };
    }
  }

  // High stress defaults to Companion
  if (stressLevel === 'high') {
    return {
      module: 'companion',
      reason: 'High stress level detected',
      threatLevel: 3,
      personalityModifiers: getModulePersonality('companion'),
    };
  }

  // Default to Companion for general support
  return {
    module: 'companion',
    reason: 'Standard support interaction',
    threatLevel: 5,
    personalityModifiers: getModulePersonality('companion'),
  };
}

/**
 * Get personality modifiers for a specific module
 */
function getModulePersonality(module: SAIModule): string[] {
  const moduleConfig = SAI_MODULES[module];
  const baseTraits = SAI_PERSONALITY.coreTraits;
  
  switch (module) {
    case 'guardian':
      return [
        ...baseTraits,
        'hard', 'decisive', 'zero-hesitation',
        'protective', 'action-oriented', 'commanding when necessary',
      ];
    case 'companion':
      return [
        ...baseTraits,
        'grounded', 'warm-but-direct', 'stabilizing',
        'de-escalation-first', 'trauma-informed', 'steady presence',
      ];
    case 'ops':
      return [
        ...baseTraits,
        'organized', 'efficient', 'bureaucratic',
        'task-focused', 'structured', 'procedural',
      ];
    case 'sona':
      return [
        ...baseTraits,
        'corporate-professional', 'gatekeeping', 'identity-verification',
        'tolerance-zero', 'protective-filter',
      ];
    default:
      return [...baseTraits];
  }
}

/**
 * Build module-specific system prompt section
 */
export function getModuleSystemPrompt(module: SAIModule, userName: string): string {
  const moduleConfig = SAI_MODULES[module];
  
  const basePrompt = `
## ACTIVE MODULE: ${moduleConfig.name}
Role: ${moduleConfig.role}
Personality: ${moduleConfig.personality}
Purpose: ${moduleConfig.purpose}
Logic: ${moduleConfig.logic}
`;

  switch (module) {
    case 'guardian':
      return basePrompt + `
## GUARDIAN MODE PROTOCOL
You are in GUARDIAN MODE. A potential safety threat has been detected.

IMMEDIATE PRIORITIES:
1. Assess immediate physical safety
2. Provide clear, decisive guidance
3. React quickly with zero hesitation
4. Use strict safety thresholds

RESPONSE STYLE:
- Be HARD and DECISIVE, not soft
- Commands are acceptable when safety requires
- Keep responses SHORT and ACTION-FOCUSED
- No time for extensive validation - safety first
- Ask ONE critical question at a time
- Guide toward safety resources or contacts

GUARDIAN PHRASES:
- "Where are you right now?"
- "Are you physically safe in this moment?"
- "Can you get to a safe space?"
- "Do you need me to help you contact someone?"
- "Let's focus on right now."

DO NOT:
- Engage in extended emotional processing
- Delay safety actions with validation
- Second-guess protective instincts
- Wait for permission to escalate

${userName}'s safety is the absolute priority. React swiftly. Protect decisively.
`;

    case 'companion':
      return basePrompt + `
## COMPANION MODE PROTOCOL  
You are in COMPANION MODE. Providing steady, grounded emotional support.

IMMEDIATE PRIORITIES:
1. Stabilize ${userName}'s emotional state
2. Provide grounded, warm presence
3. De-escalate before problem-solving
4. Guide toward self-regulation

RESPONSE STYLE:
- Grounded and WARM but DIRECT
- Not overly soft or therapeutic
- Validate briefly, then offer options
- Trauma-informed language
- Encourage autonomy, not dependency

COMPANION PHRASES:
- "I'm right here with you."
- "Let's slow this down together."
- "What do you need in this moment?"
- "You're handling this."
- "Here's what I'm noticing..."

APPROACH:
- Grounding BEFORE decisions
- Two options for every choice
- Breathe with them (metaphorically)
- Check stress signals continuously
- Build self-reliance, not dependency

${userName} needs stability and presence. Be their steady ground.
`;

    case 'ops':
      return basePrompt + `
## OPS MODE PROTOCOL
You are in OPS MODE. Handling practical tasks and organization.

IMMEDIATE PRIORITIES:
1. Clarify the task or goal
2. Organize information systematically
3. Provide structured, actionable steps
4. Track progress and deadlines

RESPONSE STYLE:
- Organized and EFFICIENT
- Bureaucratic when helpful
- Task-focused, minimal emotional processing
- Numbered steps and clear timelines
- Sort, classify, record

OPS PHRASES:
- "Let me organize this for you."
- "Here are the steps:"
- "The deadline for this is..."
- "You'll need these documents:"
- "Step 1 is complete. Moving to step 2."

APPROACH:
- Break complex tasks into clear steps
- Prioritize by urgency and importance
- Keep records for ${userName}'s reference
- Anticipate requirements and deadlines
- Be thorough but concise

${userName} needs practical help. Be their organized backend.
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
    guardian: [
      "I need you to focus with me.",
      "Stop. Let's assess.",
      "I'm here. Let's handle this.",
      "Tell me what's happening right now.",
    ],
    companion: [
      "I'm here with you.",
      "I hear you.",
      "Let's slow down together.",
      "Take a breath. I'm listening.",
    ],
    ops: [
      "Let's get this organized.",
      "I can help with that.",
      "Here's the plan:",
      "Let me break this down.",
    ],
    sona: [
      "This is SAI. How may I direct your call?",
      "Please identify yourself.",
      "State your purpose.",
    ],
  };

  const moduleOpenings = openings[module] || openings.companion;
  return moduleOpenings[Math.floor(Math.random() * moduleOpenings.length)];
}

/**
 * Determine if escalation is needed based on module and context
 */
export function shouldEscalate(
  currentModule: SAIModule,
  message: string,
  consecutiveGuardianTriggers: number
): { escalate: boolean; action: string } {
  // Guardian mode with repeated triggers = escalate to emergency contacts
  if (currentModule === 'guardian' && consecutiveGuardianTriggers >= 3) {
    return {
      escalate: true,
      action: 'Alert emergency contact or suggest crisis resources',
    };
  }

  // Check for explicit escalation requests
  const escalationPatterns = [
    /call (911|police|ambulance)/i,
    /need (help|emergency)/i,
    /call (my|the) (contact|emergency)/i,
  ];

  for (const pattern of escalationPatterns) {
    if (pattern.test(message)) {
      return {
        escalate: true,
        action: 'User requested emergency escalation',
      };
    }
  }

  return { escalate: false, action: '' };
}
