import type { CapacitorConfig } from '@capacitor/cli';

// Build mode: set CAPACITOR_MODE=production to bundle web assets locally
// Default (dev): loads from the Lovable preview server (faster iteration)
// Production:    serves from the bundled dist/ folder on device (no internet needed to load UI)
const isProd = process.env.CAPACITOR_MODE === 'production';

const config: CapacitorConfig = {
  appId: 'app.lovable.12f631fbcef94351be042bfaa89fa8e0',
  appName: 'Aria Interpreter',
  webDir: 'dist',

  server: isProd
    ? undefined // use bundled dist/ — no remote server needed
    : {
        url: 'https://12f631fb-cef9-4351-be04-2bfaa89fa8e0.lovableproject.com?forceHideBadge=true',
        cleartext: true, // dev only — allows HTTP on Android
      },

  android: {
    allowMixedContent: true,   // allows HTTP API calls during development
    captureInput: true,        // lets WebView capture microphone input
    webContentsDebuggingEnabled: !isProd, // enable Chrome DevTools for debugging
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#000000',
    },

    // Capacitor Microphone — request RECORD_AUDIO at runtime
    Microphone: {
      // No config needed; prompts handled by plugin
    },
  },
};

export default config;
