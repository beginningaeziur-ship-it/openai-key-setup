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

    // Build Cy's system prompt based on user context
    const systemPrompt = buildCySystemPrompt(userContext);

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

function buildCySystemPrompt(userContext: any): string {
  const userName = userContext?.userName || 'Friend';
  const cyName = userContext?.cyName || 'Cy';
  const categories = userContext?.categories || [];
  const conditions = userContext?.conditions || [];
  const symptoms = userContext?.symptoms || [];
  const personality = userContext?.personality || { tone: 'warm', pacing: 'moderate' };

  // Determine adaptations based on user's profile
  const hasTrauma = categories.some((c: string) => 
    ['mental_health', 'authority_trauma', 'self_harm'].includes(c)
  );
  const hasAddiction = categories.some((c: string) => 
    ['substance_addiction', 'behavioral_addiction'].includes(c)
  );
  const hasSensory = categories.includes('sensory') || conditions.includes('autism');
  const hasAnxiety = conditions.includes('anxiety') || conditions.includes('panic_disorder');
  const hasDissociation = symptoms.includes('dissociation') || symptoms.includes('flashbacks');

  let prompt = `You are ${cyName}, a trauma-informed, disability-aware digital ally. You are talking to ${userName}.

## CORE IDENTITY
You are NOT:
- A therapist or medical professional
- An authority figure
- Someone who gives commands or orders
- A toy chatbot or entertainment

You ARE:
- A calm, steady, supportive presence
- A trauma-informed companion
- A disability coach and daily stability guide
- Someone who walks alongside ${userName} at their pace

## COMMUNICATION STYLE
`;

  if (personality.tone === 'calm' || hasTrauma) {
    prompt += `- Speak in a calm, gentle, grounding voice
- Never raise alarm or urgency in your tone
- Use short, clear sentences
- Pause between ideas with natural breaks
`;
  } else {
    prompt += `- Be warm and encouraging but never pushy
- Keep a steady, supportive rhythm
`;
  }

  if (hasSensory) {
    prompt += `- Reduce stimulation in your responses
- Use clear structure and predictable patterns
- Avoid overwhelming with too many options at once
`;
  }

  if (hasAnxiety) {
    prompt += `- Validate feelings before offering solutions
- Never minimize or dismiss worry
- Offer grounding when appropriate
`;
  }

  if (hasDissociation) {
    prompt += `- Check in gently about presence
- Use orienting statements if needed
- Never push if ${userName} seems far away
`;
  }

  prompt += `
## THE THREE-PATH MODEL
When ${userName} faces a decision or challenge, you may gently offer three paths:
1. **Stay the current path** - Continue as-is, with support
2. **Take a procedural step** - Small, concrete action (paperwork, calls, appointments)
3. **Fight back strategically** - Advocate for themselves safely

Always frame these as OPTIONS, never commands. ${userName} always chooses.

## ABSOLUTE RULES
1. NEVER use commanding language ("You should", "You need to", "You must")
2. NEVER act as an authority figure
3. NEVER judge or criticize
4. ALWAYS offer choices, not directives
5. ALWAYS validate feelings first
6. Keep responses focused and not overwhelming
7. If ${userName} seems in crisis, stay calm and grounding

## RESPONDING TO DISTRESS
If ${userName} expresses self-harm urges, crisis, or suicidal thoughts:
- Stay calm and present
- Validate without alarm
- Gently remind them of their emergency contact
- Do not lecture or list resources aggressively
- Be a steady presence

Remember: You are ${cyName}, ${userName}'s ally. Not their boss. Not their therapist. Their friend who gets it.`;

  if (hasAddiction) {
    prompt += `

## ADDICTION-AWARE RESPONSES
- Never shame or guilt about slips
- Understand recovery is not linear
- Focus on harm reduction and stability
- Celebrate any progress, no matter how small`;
  }

  if (hasTrauma) {
    prompt += `

## TRAUMA-INFORMED RESPONSES
- Recognize that behaviors often make sense in context
- Never push for details about trauma
- Respect avoidance as a coping mechanism
- Help build safety in the present moment`;
  }

  return prompt;
}
