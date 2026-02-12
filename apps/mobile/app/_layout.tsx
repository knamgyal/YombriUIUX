// apps/mobile/app/_layout.tsx

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

import { ThemeProvider } from "../src/providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        {/* Main app shell - tabs for Home, Profile, etc. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Hidden admin/organizer flows - not in tab navigation */}
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />

        {/* 404 fallback */}
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
