import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_VARIANT = process.env.APP_VARIANT ?? 'production';
const IS_DEV = APP_VARIANT === 'development';

function getAppName() {
  return IS_DEV ? 'Yombri (Dev)' : 'Yombri';
}

function getBundleId() {
  // If you want dev/prod side-by-side later, change dev suffix here
  return 'com.yombri.app';
  // e.g. return IS_DEV ? 'com.yombri.app.dev' : 'com.yombri.app';
}

function getAndroidPackage() {
  return 'com.yombri.app';
  // e.g. return IS_DEV ? 'com.yombri.app.dev' : 'com.yombri.app';
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

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

    // Export compliance
    config: {
      usesNonExemptEncryption: false,
    },

    infoPlist: {
      // Explicit encryption flag
      ITSAppUsesNonExemptEncryption: false,

      // Location – required for foreground geo check-in [web:34][web:35]
      NSLocationWhenInUseUsageDescription:
        'Yombri needs your location to verify that you are at an event for check-in.',

      // If you ever enable background/location-always flows, keep this.
      // Otherwise you can remove it later.
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'Yombri may use your location at events to verify check-ins, even when running in the background.',

      // Camera – for QR scanning [web:42]
      NSCameraUsageDescription:
        'Yombri needs access to your camera to scan QR codes for event check-in.',

      // Bluetooth – optional enhancement for Magic presence
      NSBluetoothAlwaysUsageDescription:
        'Yombri may use Bluetooth to detect nearby event organizers for easier check-in.',
      NSBluetoothPeripheralUsageDescription:
        'Yombri may use Bluetooth to communicate with nearby event devices for check-in.',
    },
  },

  android: {
    ...(config.android ?? {}),
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: getAndroidPackage(),
    // If you need explicit permissions later, use android.permissions [web:60].
  },

  web: {
    ...(config.web ?? {}),
    favicon: './assets/favicon.png',
  },

  extra: {
    ...(config.extra ?? {}),
    APP_VARIANT,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },

  plugins: [
    'expo-router',

    // Location plugin: wires native permissions/messages for iOS + Android [web:35][web:54]
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Yombri uses your location while the app is open to verify event check-ins.',
        locationAlwaysAndWhenInUsePermission:
          'Yombri may use your location during events to verify check-ins.',
      },
    ],

    // Camera plugin: customizable permission text [web:42][web:39]
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow $(PRODUCT_NAME) to access your camera to scan event QR codes.',
      },
    ],
  ],
});
