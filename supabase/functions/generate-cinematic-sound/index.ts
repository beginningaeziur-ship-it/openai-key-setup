import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!elevenlabsApiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured')
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
      console.error('[Cinematic Sound] ElevenLabs error:', errorText)
      throw new Error(`Failed to generate sound: ${errorText}`)
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Cinematic Sound] Error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
