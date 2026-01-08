import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.12f631fbcef94351be042bfaa89fa8e0',
  appName: 'sai-powered-by-aezuir',
  webDir: 'dist',
  server: {
    url: 'https://12f631fb-cef9-4351-be04-2bfaa89fa8e0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#000000',
    },
  },
};

export default config;
