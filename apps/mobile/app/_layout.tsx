import '../global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';

import { ThemeProvider, useTheme } from '../src/providers/ThemeProvider';
import { DataProvider } from '../src/providers/DataProvider';
import { initializeSupabase } from '@yombri/supabase-client';

void SplashScreen.preventAutoHideAsync();

function SupabaseBootstrap({ children }: { children: React.ReactNode }) {
  useMemo(() => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (url && anonKey) {
      initializeSupabase(url, anonKey);
    }
  }, []);

  return <>{children}</>;
}

function RootLayoutInner() {
  const { isReady } = useTheme();

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="checkin" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(debug)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SupabaseBootstrap>
        <DataProvider>
          <RootLayoutInner />
        </DataProvider>
      </SupabaseBootstrap>
    </ThemeProvider>
  );
}
