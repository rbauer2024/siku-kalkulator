// @ts-nocheck

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.siku.kalkulator',
  appName: 'SIKU Heizplatten Empfehlungskalkulator',
  webDir: 'build',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      backgroundColor: "#FFFFFF"
    }
  },
  server: {
    url: 'https://siku-kalkulator.vercel.app/',
    cleartext: true
  }
};

export default config;