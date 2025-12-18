import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Input validation
function validateTTSInput(data: unknown): { 
  valid: boolean; 
  error?: string; 
  parsed?: { text: string; voice: string } 
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request format' };
  }
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.text !== 'string') {
    return { valid: false, error: 'Text is required and must be a string' };
  }
  
  if (obj.text.trim().length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }
  
  if (obj.text.length > 4096) {
    return { valid: false, error: 'Text too long (max 4096 characters)' };
  }
  
  const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const voice = typeof obj.voice === 'string' && validVoices.includes(obj.voice) 
    ? obj.voice 
    : 'alloy';
  
  return { 
    valid: true, 
    parsed: { text: obj.text.trim(), voice } 
  };
}

// CORS configuration with origin restriction
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://www.lovable.dev',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isLovablePreview = origin && (
    origin.endsWith('.lovableproject.com') || 
    origin.endsWith('.lovable.app') ||
    origin.includes('hypccwbfzuefwxlccxye')
  );
  
  const allowedOrigin = origin && (ALLOWED_ORIGINS.includes(origin) || isLovablePreview)
    ? origin
    : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Map SAI voice preferences to ElevenLabs voices
const voiceMap: Record<string, string> = {
  'alloy': 'EXAVITQu4vr4xnSDxMaL',    // Sarah - warm, steady
  'echo': 'JBFqnCBsd6RMkjVDRZzb',      // George - calm
  'fable': 'XrExE9yKIg1WjnnlVkGX',     // Matilda - gentle
  'onyx': 'N2lVS1w4EtoT3dr4eOWO',      // Callum - grounding
  'nova': 'pFZP5JQG7iQjIQuC4Bku',      // Lily - soft
  'shimmer': 'cgSgspJ2msm6clMCkdW9',   // Jessica - warm
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate input
    let rawData: unknown;
    try {
      rawData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const validation = validateTTSInput(rawData);
    if (!validation.valid || !validation.parsed) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, voice } = validation.parsed;

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsKey) {
      console.error('ElevenLabs API key not configured');
      return new Response(
        JSON.stringify({ error: 'Voice service temporarily unavailable', fallbackToBrowser: true }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const voiceId = voiceMap[voice] || voiceMap['alloy'];
    
    console.log(`Generating TTS for text length: ${text.length} voice: ${voice} (${voiceId})`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', response.status, errorText);
      
      // Check for quota exceeded
      if (errorText.includes('quota_exceeded') || response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Voice service quota reached', fallbackToBrowser: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Voice service busy. Please try again.', fallbackToBrowser: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Voice generation temporarily unavailable', fallbackToBrowser: true }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    console.log('TTS generated successfully, audio size:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('sai-voice error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Voice generation temporarily unavailable', fallbackToBrowser: true }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
