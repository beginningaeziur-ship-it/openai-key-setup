import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'alloy' } = await req.json();

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided');
    }

    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Limit text length
    const truncatedText = text.slice(0, 4096);
    const voiceId = voiceMap[voice] || voiceMap['alloy'];
    
    console.log(`Generating TTS for text length: ${truncatedText.length} voice: ${voice} (${voiceId})`);

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
          text: truncatedText,
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
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Voice service busy. Please try again.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`TTS failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    console.log('TTS generated successfully, audio size:', arrayBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('cy-voice error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Voice generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});