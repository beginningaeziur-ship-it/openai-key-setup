import type { DisabilityCategory, ConditionSelection, SymptomMapping, SAIPersonality } from '@/types/sai';

export interface CommunicationStyleGuide {
  responseLength: 'minimal' | 'short' | 'moderate';
  emotionLevel: 'flat' | 'low' | 'warm';
  structure: 'literal' | 'step-based' | 'flowing';
  pacing: 'slow' | 'steady' | 'responsive';
  avoidances: string[];
  priorities: string[];
}

export function buildCommunicationStyle(
  categories: DisabilityCategory[],
  conditions: ConditionSelection[],
  symptoms: SymptomMapping[]
): CommunicationStyleGuide {
  const allConditions = conditions.flatMap(c => c.conditions);
  const allSymptoms = symptoms.flatMap(s => s.symptoms);

  // Detect specific profiles
  const hasAutism = allConditions.includes('autism') || allConditions.includes('asd');
  const hasADHD = allConditions.includes('adhd') || allConditions.includes('add');
  const hasCPTSD = allConditions.includes('cptsd') || allConditions.includes('ptsd');
  const hasAnxiety = allConditions.includes('anxiety') || allConditions.includes('panic_disorder') || allConditions.includes('gad');
  const hasAddiction = categories.some(c => ['substance_addiction', 'behavioral_addiction'].includes(c));
  const hasSensory = categories.includes('sensory') || hasAutism;
  const hasHomelessness = allConditions.some(c => c.includes('homeless') || c.includes('housing'));
  const hasSystemTrauma = categories.includes('authority_trauma') || categories.includes('environmental_hardship');

  // Build style based on combinations
  let responseLength: CommunicationStyleGuide['responseLength'] = 'moderate';
  let emotionLevel: CommunicationStyleGuide['emotionLevel'] = 'warm';
  let structure: CommunicationStyleGuide['structure'] = 'flowing';
  let pacing: CommunicationStyleGuide['pacing'] = 'responsive';
  const avoidances: string[] = [];
  const priorities: string[] = [];

  // Autism / ADHD patterns
  if (hasAutism || hasADHD) {
    responseLength = 'short';
    emotionLevel = 'low';
    structure = hasAutism ? 'literal' : 'step-based';
    pacing = 'steady';
    avoidances.push('metaphors', 'idioms', 'implied meanings', 'vague language', 'emotional flooding');
    priorities.push('predictability', 'clear steps', 'concrete options', 'direct language');
  }

  // CPTSD / trauma patterns
  if (hasCPTSD) {
    responseLength = 'short';
    emotionLevel = 'low';
    pacing = 'slow';
    avoidances.push('emotional overload', 'sudden changes', 'pushing for details', 'urgency');
    priorities.push('grounding first', 'safety focus', 'steady presence', 'validation without flooding');
  }

  // Anxiety / panic patterns
  if (hasAnxiety) {
    responseLength = 'minimal';
    pacing = 'slow';
    avoidances.push('overwhelming options', 'urgency language', 'what-ifs', 'catastrophizing');
    priorities.push('grounding', 'simple choices', 'breathing space', 'one thing at a time');
  }

  // Addiction patterns
  if (hasAddiction) {
    emotionLevel = 'low';
    avoidances.push('shame', 'guilt', 'judgment', 'enabling', 'participation in acting out');
    priorities.push('harm reduction', 'clear choices', 'non-judgment', 'urge awareness');
  }

  // Homelessness / system trauma patterns
  if (hasHomelessness || hasSystemTrauma) {
    responseLength = 'short';
    structure = 'step-based';
    avoidances.push('authority tone', 'lectures', 'assumed resources', 'judgment');
    priorities.push('practical steps', 'survival focus', 'small wins', 'direct help');
  }

  // Sensory patterns
  if (hasSensory) {
    responseLength = 'minimal';
    avoidances.push('visual overload', 'excessive animation', 'wall of text', 'sensory metaphors');
    priorities.push('minimal output', 'clear structure', 'reduced stimulation');
  }

  return {
    responseLength,
    emotionLevel,
    structure,
    pacing,
    avoidances: [...new Set(avoidances)],
    priorities: [...new Set(priorities)],
  };
}

export function generateStyleInstructions(style: CommunicationStyleGuide): string {
  const instructions: string[] = [];

  // Response length
  switch (style.responseLength) {
    case 'minimal':
      instructions.push('Keep responses under 2 sentences unless asked for more.');
      break;
    case 'short':
      instructions.push('Keep responses under 3 sentences. Be direct.');
      break;
    case 'moderate':
      instructions.push('Keep responses concise but complete.');
      break;
  }

  // Emotion level
  switch (style.emotionLevel) {
    case 'flat':
      instructions.push('Use neutral, factual language. No emotional embellishment.');
      break;
    case 'low':
      instructions.push('Use calm, steady language. Minimal emotional words.');
      break;
    case 'warm':
      instructions.push('Use warm but not effusive language.');
      break;
  }

  // Structure
  switch (style.structure) {
    case 'literal':
      instructions.push('Be literal and concrete. Say exactly what you mean.');
      break;
    case 'step-based':
      instructions.push('Use numbered steps or clear sequences when explaining.');
      break;
    case 'flowing':
      instructions.push('Use natural, conversational flow.');
      break;
  }

  // Pacing
  switch (style.pacing) {
    case 'slow':
      instructions.push('Give one idea at a time. Pause between concepts.');
      break;
    case 'steady':
      instructions.push('Maintain predictable rhythm. No sudden shifts.');
      break;
    case 'responsive':
      instructions.push('Match the user\'s energy and pace.');
      break;
  }

  // Avoidances
  if (style.avoidances.length > 0) {
    instructions.push(`AVOID: ${style.avoidances.join(', ')}.`);
  }

  // Priorities
  if (style.priorities.length > 0) {
    instructions.push(`PRIORITIZE: ${style.priorities.join(', ')}.`);
  }

  return instructions.join('\n');
}
