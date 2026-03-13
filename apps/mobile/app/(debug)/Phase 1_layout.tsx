// apps/mobile/app/(debug)/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "../../src/providers/ThemeProvider";
import { typography } from "@yombri/design-tokens";

export default function DebugLayout() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Stack
      screenOptions={{
        headerShown: true,

        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.onSurface,
        headerShadowVisible: false,

        contentStyle: { backgroundColor: c.background },

        headerTitleStyle: {
          fontFamily: typography.heading.md.fontFamily,
          fontSize: typography.heading.md.fontSize,
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen name="tokens" options={{ title: "Tokens" }} />
      <Stack.Screen name="phase1-audit" options={{ title: "Phase 1 Audit" }} />
    </Stack>
  );
}
