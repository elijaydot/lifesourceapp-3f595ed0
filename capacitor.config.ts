import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.948ab92dfaee4d989842acbf570f2e18',
  appName: 'LifeSourceApp',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://948ab92d-faee-4d98-9842-acbf570f2e18.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;