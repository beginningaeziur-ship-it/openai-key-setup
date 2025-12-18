import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Input validation
function validateSTTInput(data: unknown): { 
  valid: boolean; 
  error?: string; 
  parsed?: { audio: string } 
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request format' };
  }
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.audio !== 'string') {
    return { valid: false, error: 'Audio data is required' };
  }
  
  if (obj.audio.length < 100) {
    return { valid: false, error: 'Audio data too short' };
  }
  
  // 10MB base64 limit (approximately 7.5MB decoded)
  const MAX_AUDIO_SIZE = 10485760;
  if (obj.audio.length > MAX_AUDIO_SIZE) {
    return { valid: false, error: 'Audio file too large (max 10MB)' };
  }
  
  return { 
    valid: true, 
    parsed: { audio: obj.audio } 
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

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
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
    
    const validation = validateSTTInput(rawData);
    if (!validation.valid || !validation.parsed) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { audio } = validation.parsed;
    
    console.log('STT request received, audio data length:', audio.length)

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Speech recognition service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    
    console.log('Processed audio size:', binaryAudio.length)

    // Prepare form data - cast to ArrayBuffer for Deno compatibility
    const formData = new FormData()
    const blob = new Blob([binaryAudio.buffer as ArrayBuffer], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'en')

    // Send to OpenAI Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Whisper error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Speech recognition service busy. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Speech recognition temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json()
    console.log('Transcription result:', result.text?.substring(0, 50))

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('STT error:', error)
    return new Response(
      JSON.stringify({ error: 'Speech recognition temporarily unavailable' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
