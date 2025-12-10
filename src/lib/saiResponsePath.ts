// SAI 3-Path Response System
// Routes all SAI responses through Gentle, Honest, or Direct paths

export type ResponsePath = 'gentle' | 'honest' | 'direct';

export interface PathConfig {
  path: ResponsePath;
  reason: string;
  confidenceScore: number;
}

// Distress indicators for path detection
const GENTLE_TRIGGERS = {
  crisis: [
    /can't breathe/i, /can't think/i, /dying/i, /want to die/i,
    /kill myself/i, /end it/i, /give up/i, /no point/i,
    /hurting myself/i, /cut myself/i, /hurt myself/i,
  ],
  overwhelm: [
    /too much/i, /overwhelmed/i, /can't handle/i, /can't cope/i,
    /falling apart/i, /breaking down/i, /panic/i, /panicking/i,
    /scared/i, /terrified/i, /afraid/i, /frightened/i,
  ],
  dissociation: [
    /not real/i, /don't feel real/i, /disconnected/i, /floating/i,
    /numb/i, /empty/i, /frozen/i, /can't move/i, /stuck/i,
    /far away/i, /watching myself/i, /outside my body/i,
  ],
  trauma: [
    /flashback/i, /nightmare/i, /triggered/i, /memory/i,
    /abuse/i, /hurt me/i, /attacked/i, /violated/i,
  ],
};

const DIRECT_TRIGGERS = [
  /just tell me/i, /be direct/i, /no nonsense/i, /cut to/i,
  /get to the point/i, /straight answer/i, /what do I do/i,
  /tell me what to do/i, /I need action/i, /enough talk/i,
  /skip the/i, /bottom line/i, /quick answer/i,
];

const HONEST_TRIGGERS = [
  /help me decide/i, /what should I/i, /I don't know/i,
  /confused/i, /not sure/i, /both options/i, /either way/i,
  /pros and cons/i, /think through/i, /weigh/i, /consider/i,
  /what do you think/i, /your opinion/i, /advice/i,
];

// Analyze message to determine optimal path
export function detectResponsePath(
  message: string,
  currentDistressLevel?: 'low' | 'medium' | 'high',
  manualOverride?: ResponsePath
): PathConfig {
  // Manual override takes priority
  if (manualOverride) {
    return {
      path: manualOverride,
      reason: 'User preference',
      confidenceScore: 1.0,
    };
  }

  // High distress always triggers gentle
  if (currentDistressLevel === 'high') {
    return {
      path: 'gentle',
      reason: 'High distress detected',
      confidenceScore: 0.95,
    };
  }

  const lowerMessage = message.toLowerCase();
  let gentleScore = 0;
  let directScore = 0;
  let honestScore = 0;

  // Check gentle triggers (crisis, overwhelm, dissociation, trauma)
  for (const category of Object.values(GENTLE_TRIGGERS)) {
    for (const pattern of category) {
      if (pattern.test(message)) {
        gentleScore += 3;
      }
    }
  }

  // Check direct triggers
  for (const pattern of DIRECT_TRIGGERS) {
    if (pattern.test(message)) {
      directScore += 2;
    }
  }

  // Check honest triggers
  for (const pattern of HONEST_TRIGGERS) {
    if (pattern.test(message)) {
      honestScore += 2;
    }
  }

  // Behavioral indicators
  if (message.length < 20) directScore += 0.5; // Short messages often want quick responses
  if (message.includes('?')) honestScore += 0.5; // Questions suggest decision-making
  if (message.split(/[.!?]/).length > 3) gentleScore += 0.5; // Long messages may indicate overwhelm

  // Determine winner
  const maxScore = Math.max(gentleScore, directScore, honestScore);
  
  if (maxScore === 0) {
    // Default to honest path for neutral messages
    return {
      path: 'honest',
      reason: 'Neutral input',
      confidenceScore: 0.6,
    };
  }

  if (gentleScore === maxScore) {
    return {
      path: 'gentle',
      reason: 'Emotional distress cues detected',
      confidenceScore: Math.min(0.95, 0.5 + gentleScore * 0.1),
    };
  }

  if (directScore === maxScore) {
    return {
      path: 'direct',
      reason: 'User requested clarity/action',
      confidenceScore: Math.min(0.95, 0.5 + directScore * 0.1),
    };
  }

  return {
    path: 'honest',
    reason: 'Decision support needed',
    confidenceScore: Math.min(0.95, 0.5 + honestScore * 0.1),
  };
}

// Path-specific response templates
export const PATH_STYLES = {
  gentle: {
    opening: [
      "I hear you.",
      "I'm right here with you.",
      "Take a breath.",
      "You're safe right now.",
      "Let's go slow.",
    ],
    pacing: 'slow',
    sentenceLength: 'short',
    tone: 'grounding, simple, reassuring',
    validation: 'high',
    systemPromptModifier: `
      Use GENTLE PATH: The user is overwhelmed, scared, or having trauma responses.
      - Keep sentences very short (5-10 words max)
      - Use grounding language
      - Validate emotions before anything else
      - Never push or suggest action
      - Breathe with them metaphorically
      - Use words like: safe, here, okay, breathe, moment
      - Avoid: should, must, need to, have to
    `,
  },
  honest: {
    opening: [
      "Let's think through this together.",
      "Here's how I see it.",
      "There are a couple of ways to look at this.",
      "Let me share some thoughts.",
    ],
    pacing: 'moderate',
    sentenceLength: 'medium',
    tone: 'clear, supportive, reality-based',
    validation: 'moderate',
    systemPromptModifier: `
      Use HONEST PATH: The user is stable but needs help deciding.
      - Present options clearly (always 2 choices)
      - Acknowledge complexity without overwhelming
      - Use "you might consider" or "one option is"
      - Help them think through consequences
      - Never decide for them
      - Ask clarifying questions when helpful
      - Support their autonomy
    `,
  },
  direct: {
    opening: [
      "Here's what I'd suggest:",
      "Let's get straight to it.",
      "Clear answer:",
      "Action steps:",
    ],
    pacing: 'normal',
    sentenceLength: 'concise',
    tone: 'firm, protective, structured',
    validation: 'minimal',
    systemPromptModifier: `
      Use DIRECT PATH: The user wants action and clarity.
      - Be concise and actionable
      - Lead with the answer, then explain if needed
      - Use numbered steps for multi-part actions
      - Skip excessive validation
      - Be confident and clear
      - Still offer choices when appropriate
      - Respect their request for directness
    `,
  },
};

// Build system prompt modifier based on path
export function getPathSystemPrompt(path: ResponsePath): string {
  return PATH_STYLES[path].systemPromptModifier;
}

// Get path-appropriate opening
export function getPathOpening(path: ResponsePath): string {
  const openings = PATH_STYLES[path].opening;
  return openings[Math.floor(Math.random() * openings.length)];
}
