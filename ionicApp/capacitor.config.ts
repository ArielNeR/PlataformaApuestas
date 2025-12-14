import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.singleseven.betpro',
  appName: 'BetPro',
  webDir: 'www',
  server: {
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;