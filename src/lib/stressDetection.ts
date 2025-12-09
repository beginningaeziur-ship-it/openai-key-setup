// Stress detection patterns and analysis for SAI
// Monitors text, voice characteristics, and behavioral patterns

export type StressLevel = 'calm' | 'mild' | 'moderate' | 'high' | 'crisis';

export interface StressAnalysis {
  level: StressLevel;
  score: number; // 0-100
  triggers: string[];
  recommendedAction: 'monitor' | 'gentle-checkin' | 'grounding' | 'safety-protocol' | 'crisis-response';
  groundingType?: 'breathing' | '5-4-3-2-1' | 'body-scan' | 'safe-place';
}

// Text patterns indicating stress levels
const STRESS_TEXT_PATTERNS = {
  crisis: [
    /\b(can'?t.*breathe|panic|help.*me|dying|emergency)\b/i,
    /\b(want.*to.*die|kill.*myself|end.*it)\b/i,
    /\b(hurting.*myself|cutting|self.*harm)\b/i,
  ],
  high: [
    /\b(freaking.*out|losing.*it|can'?t.*cope|overwhelmed)\b/i,
    /\b(scared|terrified|anxious|panicking)\b/i,
    /\b(too.*much|can'?t.*handle|breaking.*down)\b/i,
    /\b(triggered|flashback|nightmare)\b/i,
    /!{3,}/, // Multiple exclamation marks
    /\?{3,}/, // Multiple question marks
  ],
  moderate: [
    /\b(stressed|worried|nervous|upset|frustrated)\b/i,
    /\b(bad.*day|hard.*time|struggling|difficult)\b/i,
    /\b(angry|irritated|annoyed|tense)\b/i,
    /\b(tired|exhausted|drained|burnt.*out)\b/i,
  ],
  mild: [
    /\b(uncomfortable|uneasy|off|weird)\b/i,
    /\b(not.*great|could.*be.*better|meh)\b/i,
    /\b(thinking.*about|wondering|confused)\b/i,
  ],
};

// Voice characteristics that indicate stress
export interface VoiceMetrics {
  speed: 'slow' | 'normal' | 'fast' | 'very-fast';
  volume: 'quiet' | 'normal' | 'loud' | 'yelling';
  pitch: 'low' | 'normal' | 'high' | 'shaky';
  breathing: 'deep' | 'normal' | 'shallow' | 'rapid' | 'gasping';
  pauses: 'long' | 'normal' | 'short' | 'none';
}

// Behavioral patterns over time
export interface BehavioralPattern {
  messageFrequency: number; // messages per minute
  averageMessageLength: number;
  repetitiveContent: boolean;
  allCaps: boolean;
  fragmentedSentences: boolean;
  timestamp: number;
}

// Analyze text content for stress indicators
export function analyzeTextStress(text: string): { score: number; triggers: string[] } {
  let score = 0;
  const triggers: string[] = [];

  // Check for crisis patterns (highest priority)
  for (const pattern of STRESS_TEXT_PATTERNS.crisis) {
    if (pattern.test(text)) {
      score += 40;
      triggers.push('crisis-language');
      break;
    }
  }

  // Check for high stress patterns
  for (const pattern of STRESS_TEXT_PATTERNS.high) {
    if (pattern.test(text)) {
      score += 25;
      triggers.push('high-stress-language');
      break;
    }
  }

  // Check for moderate stress patterns
  for (const pattern of STRESS_TEXT_PATTERNS.moderate) {
    if (pattern.test(text)) {
      score += 15;
      triggers.push('stress-indicators');
      break;
    }
  }

  // Check for mild stress patterns
  for (const pattern of STRESS_TEXT_PATTERNS.mild) {
    if (pattern.test(text)) {
      score += 8;
      triggers.push('mild-concern');
      break;
    }
  }

  // Additional text analysis
  if (/[A-Z]{5,}/.test(text)) {
    score += 10;
    triggers.push('caps-lock');
  }

  if (text.length < 10 && /^[!?.\s]*$/.test(text.replace(/\w+/, ''))) {
    score += 5;
    triggers.push('fragmented-response');
  }

  // Repetitive punctuation
  if (/[!?]{2,}/.test(text)) {
    score += 8;
    triggers.push('emphatic-punctuation');
  }

  return { score: Math.min(score, 100), triggers };
}

// Analyze voice characteristics for stress
export function analyzeVoiceStress(metrics: VoiceMetrics): { score: number; triggers: string[] } {
  let score = 0;
  const triggers: string[] = [];

  // Breathing analysis (most important for stress)
  if (metrics.breathing === 'gasping') {
    score += 35;
    triggers.push('breathing-crisis');
  } else if (metrics.breathing === 'rapid') {
    score += 25;
    triggers.push('rapid-breathing');
  } else if (metrics.breathing === 'shallow') {
    score += 15;
    triggers.push('shallow-breathing');
  }

  // Speed analysis
  if (metrics.speed === 'very-fast') {
    score += 20;
    triggers.push('racing-speech');
  } else if (metrics.speed === 'fast') {
    score += 10;
    triggers.push('fast-speech');
  }

  // Volume analysis
  if (metrics.volume === 'yelling') {
    score += 20;
    triggers.push('elevated-volume');
  } else if (metrics.volume === 'quiet') {
    score += 10;
    triggers.push('withdrawn-voice');
  }

  // Pitch analysis
  if (metrics.pitch === 'shaky') {
    score += 25;
    triggers.push('shaky-voice');
  } else if (metrics.pitch === 'high') {
    score += 12;
    triggers.push('elevated-pitch');
  }

  // Pause analysis
  if (metrics.pauses === 'none') {
    score += 15;
    triggers.push('no-pauses');
  }

  return { score: Math.min(score, 100), triggers };
}

// Analyze behavioral patterns
export function analyzeBehaviorStress(patterns: BehavioralPattern[]): { score: number; triggers: string[] } {
  let score = 0;
  const triggers: string[] = [];

  if (patterns.length < 2) return { score: 0, triggers: [] };

  const recent = patterns.slice(-5);
  const avgFrequency = recent.reduce((sum, p) => sum + p.messageFrequency, 0) / recent.length;
  const hasRepetition = recent.some(p => p.repetitiveContent);
  const hasAllCaps = recent.some(p => p.allCaps);
  const hasFragments = recent.filter(p => p.fragmentedSentences).length > 2;

  // Rapid messaging
  if (avgFrequency > 3) {
    score += 20;
    triggers.push('rapid-messaging');
  } else if (avgFrequency > 2) {
    score += 10;
    triggers.push('frequent-messaging');
  }

  // Repetitive content
  if (hasRepetition) {
    score += 15;
    triggers.push('repetitive-content');
  }

  // All caps usage
  if (hasAllCaps) {
    score += 12;
    triggers.push('caps-usage');
  }

  // Fragmented communication
  if (hasFragments) {
    score += 10;
    triggers.push('fragmented-communication');
  }

  return { score: Math.min(score, 100), triggers };
}

// Get stress level from score
export function getStressLevel(score: number): StressLevel {
  if (score >= 80) return 'crisis';
  if (score >= 60) return 'high';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'mild';
  return 'calm';
}

// Get recommended action based on stress level
export function getRecommendedAction(level: StressLevel): StressAnalysis['recommendedAction'] {
  switch (level) {
    case 'crisis': return 'crisis-response';
    case 'high': return 'safety-protocol';
    case 'moderate': return 'grounding';
    case 'mild': return 'gentle-checkin';
    default: return 'monitor';
  }
}

// Get appropriate grounding technique
export function getGroundingType(level: StressLevel, triggers: string[]): StressAnalysis['groundingType'] {
  if (triggers.includes('breathing-crisis') || triggers.includes('rapid-breathing')) {
    return 'breathing';
  }
  if (level === 'high' || level === 'crisis') {
    return '5-4-3-2-1';
  }
  if (triggers.includes('shaky-voice') || triggers.includes('withdrawn-voice')) {
    return 'body-scan';
  }
  return 'safe-place';
}

// Combine all analyses into final stress assessment
export function analyzeStress(
  text: string,
  voiceMetrics?: VoiceMetrics,
  behaviorPatterns?: BehavioralPattern[]
): StressAnalysis {
  const textAnalysis = analyzeTextStress(text);
  const voiceAnalysis = voiceMetrics ? analyzeVoiceStress(voiceMetrics) : { score: 0, triggers: [] };
  const behaviorAnalysis = behaviorPatterns ? analyzeBehaviorStress(behaviorPatterns) : { score: 0, triggers: [] };

  // Weighted combination (text 40%, voice 40%, behavior 20%)
  const combinedScore = Math.round(
    textAnalysis.score * 0.4 +
    voiceAnalysis.score * 0.4 +
    behaviorAnalysis.score * 0.2
  );

  const allTriggers = [...new Set([
    ...textAnalysis.triggers,
    ...voiceAnalysis.triggers,
    ...behaviorAnalysis.triggers
  ])];

  const level = getStressLevel(combinedScore);
  const recommendedAction = getRecommendedAction(level);
  const groundingType = getGroundingType(level, allTriggers);

  return {
    level,
    score: combinedScore,
    triggers: allTriggers,
    recommendedAction,
    groundingType: recommendedAction === 'grounding' || recommendedAction === 'safety-protocol' 
      ? groundingType 
      : undefined,
  };
}

// Generate SAI response based on stress analysis
export function getStressResponse(analysis: StressAnalysis, saiName: string = 'SAI'): string | null {
  switch (analysis.recommendedAction) {
    case 'crisis-response':
      return `I'm here with you right now. I can hear something's really hard. Let's slow down together. Can you tell me where you are right now?`;
    
    case 'safety-protocol':
      if (analysis.groundingType === 'breathing') {
        return `I'm noticing your breathing sounds different. Let's do this together - breathe in slowly... 2... 3... 4... and out... 2... 3... 4... 5... 6... I'm right here with you.`;
      }
      return `I'm picking up that things feel intense right now. Let's ground together. Tell me 5 things you can see around you right now.`;
    
    case 'grounding':
      if (analysis.groundingType === 'breathing') {
        return `Let's take a moment. Breathe with me - in through your nose... and slowly out. We can take this at your pace.`;
      }
      if (analysis.groundingType === '5-4-3-2-1') {
        return `Let's connect to right now. What's one thing you can touch near you?`;
      }
      return `I'm here. Take a breath when you're ready. There's no rush.`;
    
    case 'gentle-checkin':
      return `I'm noticing something might be on your mind. Want to talk about it, or would you rather we just sit together for a moment?`;
    
    default:
      return null;
  }
}
