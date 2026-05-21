import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS configuration with origin restriction
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenlabsApiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Audio service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Cinematic Sound] Generating epic logo reveal sound...')

    // Generate a dramatic cinematic sound effect using ElevenLabs
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Epic cinematic logo reveal with deep bass rumble building slowly to dramatic orchestral hit with brass and strings, then fading with long reverb tail, movie studio style',
        duration_seconds: 6,
        prompt_influence: 0.5,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Cinematic Sound] ElevenLabs error:', response.status, errorText)
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Audio service busy. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Audio generation temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get audio as array buffer and convert to base64
    const audioBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(audioBuffer)
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = ''
    const chunkSize = 0x8000
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    const base64Audio = btoa(binary)

    console.log('[Cinematic Sound] Generated audio, size:', audioBuffer.byteLength)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('[Cinematic Sound] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Audio generation temporarily unavailable' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
