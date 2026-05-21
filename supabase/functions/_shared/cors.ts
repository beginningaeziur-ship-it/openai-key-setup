// ── Shared CORS utility for all Supabase edge functions ───────────────────────
// Supports: web, Lovable previews, AND Android/iOS Capacitor native apps.

const WEB_ORIGINS = [
  'https://lovable.dev',
  'https://www.lovable.dev',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

// Capacitor WebView origins — Android and iOS native apps
const NATIVE_ORIGINS = [
  'capacitor://localhost',  // Capacitor Android & iOS standard origin
  'ionic://localhost',      // Ionic/Capacitor alternative
  'http://localhost',       // Capacitor sometimes uses bare localhost
  'https://localhost',
];

function isAllowed(origin: string | null): boolean {
  if (!origin) return true; // null origin = file:// or native context — allow
  if (WEB_ORIGINS.includes(origin)) return true;
  if (NATIVE_ORIGINS.includes(origin)) return true;

  // Lovable preview domains
  if (
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app') ||
    origin.includes('hypccwbfzuefwxlccxye')
  ) return true;

  return false;
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Null origin (file:// or WebView with no origin) — use wildcard, no credentials
  if (!origin) {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
  }

  // Native Capacitor app — allow explicitly, no credentials needed (uses API key header)
  if (NATIVE_ORIGINS.includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
  }

  // Web origins — reflect origin with credentials
  const allowedOrigin = isAllowed(origin) ? origin : WEB_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}
