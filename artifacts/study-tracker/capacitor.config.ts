import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyx.app',
  appName: 'Study X',
  webDir: 'dist/public',
  android: {
    // Allow the WebView to load the web assets correctly
    allowMixedContent: true,
  },
  server: {
    // Needed in dev/testing so you can point to a local IP API server.
    // In production with HTTPS this is not required.
    cleartext: true,
    // Android loopback address mapped to your PC's 23521 port when using
    // "adb reverse tcp:23521 tcp:23521" during local dev.
    // Remove or override this for production — use VITE_API_BASE_URL instead.
    androidScheme: 'https',
  },
};

export default config;
