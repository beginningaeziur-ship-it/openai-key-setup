import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  
  // Limit text length to prevent high TTS costs
  if (obj.text.length > 4096) {
    return { valid: false, error: 'Text too long (max 4096 characters)' };
  }
  
  const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const voice = typeof obj.voice === 'string' && validVoices.includes(obj.voice) 
    ? obj.voice 
    : 'nova';
  
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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    
    console.log('TTS request received:', { textLength: text.length, voice })

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Voice service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate speech from text using OpenAI TTS
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
        speed: 0.92, // Slightly slower for calming effect
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI TTS error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Voice service busy. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Voice generation temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    const base64Audio = btoa(binary)

    console.log('TTS response generated, audio size:', arrayBuffer.byteLength)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('TTS error:', error)
    return new Response(
      JSON.stringify({ error: 'Voice generation temporarily unavailable' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
