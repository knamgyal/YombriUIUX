import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_VARIANT = process.env.APP_VARIANT ?? 'production';
const IS_DEV = APP_VARIANT === 'development';

function getAppName() {
  return IS_DEV ? 'Yombri (Dev)' : 'Yombri';
}

function getBundleId() {
  return 'com.yombri.app';
}

function getAndroidPackage() {
  return 'com.yombri.app';
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  jsEngine: 'hermes',
  name: getAppName(),
  slug: 'yombri',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',

  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  assetBundlePatterns: ['**/*'],

  ios: {
    ...(config.ios ?? {}),
    supportsTablet: true,
    bundleIdentifier: getBundleId(),
    config: {
      usesNonExemptEncryption: false,
    },
    infoPlist: {
      ...(config.ios?.infoPlist ?? {}),
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        'Yombri needs your location to verify that you are at an event for check-in.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Yombri may use your location during events to verify check-ins.',
      NSCameraUsageDescription:
        'Yombri needs access to your camera to scan QR codes for event check-in.',
      NSBluetoothAlwaysUsageDescription:
        'Yombri may use Bluetooth to detect nearby event organizers for easier check-in.',
      NSBluetoothPeripheralUsageDescription:
        'Yombri may use Bluetooth to communicate with nearby event devices for check-in.',
    },
  },

  android: {
    ...(config.android ?? {}),
    package: getAndroidPackage(),
    adaptiveIcon: {
      ...(config.android?.adaptiveIcon ?? {}),
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },

  web: {
    ...(config.web ?? {}),
    favicon: './assets/favicon.png',
  },

  extra: {
    ...(config.extra ?? {}),
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    APP_VARIANT,
    eas: {
      projectId: '54d31f85-6ed9-4a64-a55f-f465640cfc40',
    },
  },

  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Yombri uses your location while the app is open to verify event check-ins.',
        locationAlwaysAndWhenInUsePermission:
          'Yombri may use your location during events to verify check-ins.',
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow $(PRODUCT_NAME) to access your camera to scan event QR codes.',
      },
    ],
  ],
});
