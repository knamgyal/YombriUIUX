import { Stack } from "expo-router";
import { SplashScreen } from "expo-router"; // ← EXPO-ROUTER SPLASHSCREEN
import { useEffect, useState } from "react";

import { ThemeProvider } from "../src/providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Wait for theme
  if (!isReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
