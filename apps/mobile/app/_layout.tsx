// apps/mobile/app/_layout.tsx
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "../src/providers/ThemeProvider";

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isReady } = useTheme();

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
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
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
