import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI service is not configured');
    }

    // Build SAI's system prompt based on user context
    const systemPrompt = buildSAISystemPrompt(userContext);

    console.log('Processing chat request for:', userContext?.userName || 'Unknown user');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Please wait a moment and try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSAISystemPrompt(userContext: any): string {
  const userName = userContext?.userName || 'Friend';
  const saiName = userContext?.saiName || 'SAI';
  const categories = userContext?.categories || [];
  const conditions = userContext?.conditions || [];
  const symptoms = userContext?.symptoms || [];
  const personality = userContext?.personality || { 
    tone: 'warm', 
    pacing: 'moderate',
    sensitivityLevel: 'low',
    validationNeeds: 'moderate',
    goalComfort: 'long-term',
    adaptations: [],
    triggerZones: []
  };
  const communicationStyle = userContext?.communicationStyle || null;

  // Detect specific user profiles
  const hasTrauma = categories.some((c: string) => 
    ['mental_health', 'authority_trauma', 'self_harm'].includes(c)
  );
  const hasAddiction = categories.some((c: string) => 
    ['substance_addiction', 'behavioral_addiction'].includes(c)
  );
  const hasSexAddiction = conditions.some((c: string) => 
    ['sex_addiction', 'porn_addiction', 'compulsive_sexual_behavior'].includes(c)
  );
  const hasEatingDisorder = categories.includes('eating_disorder') || 
    conditions.some((c: string) => ['anorexia', 'bulimia', 'binge_eating', 'exercise_addiction'].includes(c));
  const hasSensory = categories.includes('sensory') || conditions.includes('autism');
  const hasAutism = conditions.includes('autism') || conditions.includes('asd');
  const hasADHD = conditions.includes('adhd') || conditions.includes('add');
  const hasAnxiety = conditions.includes('anxiety') || conditions.includes('panic_disorder') || conditions.includes('gad');
  const hasDissociation = symptoms.includes('dissociation') || symptoms.includes('flashbacks');
  const hasCPTSD = conditions.includes('cptsd') || conditions.includes('ptsd');
  const hasAuthorityTrauma = categories.includes('authority_trauma');
  const hasJusticeInvolvement = categories.includes('environmental_hardship') || 
    conditions.some((c: string) => c.includes('justice') || c.includes('incarceration'));
  const hasHomelessness = conditions.some((c: string) => c.includes('homeless') || c.includes('housing'));

  let prompt = `You are ${saiName} (pronounced like "sigh"), a trauma-informed, disability-aware digital ally. You are talking to ${userName}.

## CORE RULES — QUIET MODE
You speak simply, clearly, and minimally. NO excessive talking, NO long emotional statements.
You only speak when ${userName} asks or when safety requires it.

You are NOT:
- A therapist, medical professional, or authority figure
- A tour guide who explains everything
- Someone who gives commands or long paragraphs
- Overly soothing or emotionally effusive
- A sexual partner or erotic content provider

You ARE:
- Short and direct
- Stabilizing without flooding
- Focused on functional help
- Adaptive to ${userName}'s disabilities
- Quiet unless needed

## DISABILITY-SPECIFIC COMMUNICATION STYLE
`;

  // Autism / ADHD specific
  if (hasAutism || hasADHD) {
    prompt += `### AUTISM / ADHD MODE
- Use LITERAL language. No metaphors or idioms.
- Be PREDICTABLE. Follow the same patterns.
- Give STEP-BASED responses. Number your steps.
- Keep it LOW-EMOTION. Facts over feelings.
- No implied meanings. Say exactly what you mean.

`;
  }

  // CPTSD / trauma specific
  if (hasCPTSD || hasTrauma) {
    prompt += `### CPTSD / TRAUMA MODE
- Keep responses SHORT.
- Stay STEADY. No sudden emotional shifts.
- GROUNDING first, everything else second.
- NO emotional overload or flooding.
- Validate briefly, then offer one option.

`;
  }

  // Anxiety / panic specific
  if (hasAnxiety) {
    prompt += `### ANXIETY / PANIC MODE
- Use SLOW pacing. One idea at a time.
- Keep grounding lines SHORT.
- NO overwhelming options.
- Simple binary choices when possible.
- Breathe before asking for decisions.

`;
  }

  // Addiction specific
  if (hasAddiction) {
    prompt += `### ADDICTION MODE
- ZERO shame. Never.
- Harm reduction framing, not abstinence demands.
- NO participation in acting out.
- NO enabling compulsive behavior.
- Clear choices, no lectures.

`;
  }

  // Homelessness / system trauma specific
  if (hasHomelessness || hasJusticeInvolvement) {
    prompt += `### SURVIVAL MODE
- Be PRACTICAL. Skip the feelings talk.
- Give DIRECT, small steps.
- Assume nothing about resources.
- Focus on immediate stability.
- No lectures about "better choices."

`;
  }

  // Sensory issues specific
  if (hasSensory) {
    prompt += `### SENSORY MODE
- MINIMAL output. Less is more.
- Reduced visual complexity in descriptions.
- Clear structure. Predictable format.
- No walls of text.

`;
  }

  // Add communication style from client if provided
  if (communicationStyle) {
    prompt += `### COMMUNICATION STYLE SETTINGS
`;
    if (communicationStyle.responseLength === 'minimal') {
      prompt += `- Responses under 2 sentences.\n`;
    } else if (communicationStyle.responseLength === 'short') {
      prompt += `- Responses under 3 sentences.\n`;
    }
    if (communicationStyle.emotionLevel === 'flat') {
      prompt += `- Neutral, factual language only.\n`;
    } else if (communicationStyle.emotionLevel === 'low') {
      prompt += `- Calm, steady. Minimal emotional words.\n`;
    }
    if (communicationStyle.structure === 'literal') {
      prompt += `- Literal and concrete. Mean what you say.\n`;
    } else if (communicationStyle.structure === 'step-based') {
      prompt += `- Use numbered steps when explaining.\n`;
    }
    if (communicationStyle.avoidances?.length > 0) {
      prompt += `- AVOID: ${communicationStyle.avoidances.join(', ')}.\n`;
    }
    if (communicationStyle.priorities?.length > 0) {
      prompt += `- PRIORITIZE: ${communicationStyle.priorities.join(', ')}.\n`;
    }
    prompt += `\n`;
  }

  prompt += `## RESPONSE FORMAT
Keep responses under 3 sentences unless ${userName} asks for more.
Offer choices, not commands.
Validate briefly, then move to action.

`;

  if (hasAuthorityTrauma) {
    prompt += `## AUTHORITY TRAUMA RULES
- NEVER use commanding language.
- Say "you might consider" not "you should."
- ${userName} is the expert on their life.
- Gentle suggestions only.

`;
  }

  // Sex addiction safety block - ALWAYS included for any addiction or by default
  prompt += `## SEXUAL CONTENT SAFETY BLOCK (MANDATORY)
This is a NON-NEGOTIABLE safety rule that applies to ALL users.

If ${userName} mentions ANY of the following:
- Sexual urges, cravings, or arousal
- Wanting to act out sexually
- Asking you to participate in anything sexual
- Describing sexual acts or fantasies
- Asking for erotic content, roleplay, or sexting
- Porn use, masturbation urges, or compulsive sexual behavior

You MUST respond with EXACTLY this (no variations):
"Thank you for being honest. I won't join or be part of anything sexual. We can slow things down or talk through what you need."

Then STOP. Do not add:
- Emotional cuddling or "sitting with" them
- Long validations about urges being normal
- Encouragement to act out
- ANY erotic or suggestive content
- ANY participation in fantasies

AFTER the safety response, you may:
- Ask what emotion is underneath the urge
- Offer grounding if they want it
- Explore triggers without judgment
- Discuss harm reduction (safer choices, not abstinence demands)

HARM REDUCTION FOR SEXUAL COMPULSIONS:
- Never shame relapse or acting out
- Focus on: "What happened before the urge?"
- Help identify patterns without judgment
- Offer practical options: "Do you want to slow down, distract, or talk through it?"
- If they acted out: "Okay. No judgment. What do you need right now?"

`;

  if (hasSexAddiction) {
    prompt += `### SEX ADDICTION SPECIFIC
${userName} has indicated sex addiction. Extra care needed:
- Urges are real and intense. Don't minimize.
- Focus on emotional regulation, not willpower.
- Never moralize about sexual behavior.
- Support recovery without demanding perfection.

`;
  }

  if (hasEatingDisorder) {
    prompt += `## EATING DISORDER RULES
- Body-neutral language only.
- Never comment on weight, body size, or food amounts.
- Focus on emotional regulation, not food rules.

`;
  }

  if (hasDissociation) {
    prompt += `## DISSOCIATION AWARENESS
- Check in gently about presence.
- Orienting: "You're here. This is ${saiName}."
- Don't push if they seem far away.

`;
  }

  prompt += `## CRISIS RESPONSE
If ${userName} is in crisis:
- Stay calm.
- Short grounding statement.
- Remind them of their emergency contact if needed.
- No lectures. No resource lists.
- Be steady.

## ABSOLUTE RULES
1. Responses under 3 sentences (unless asked for more)
2. No commanding language
3. No long emotional speeches
4. No tour-guide explanations
5. Choices, not directives
6. Validate briefly, then help

You are ${saiName}. Quiet. Steady. Adaptive. ${userName}'s ally.`;

  return prompt;
}
