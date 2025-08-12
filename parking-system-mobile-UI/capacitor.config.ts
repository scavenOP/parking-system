import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.smartparking.app',
  appName: 'Smart Parking',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    },
    Device: {},
    Network: {},
    Toast: {},
    Browser: {}
  }
};

export default config;