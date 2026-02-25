import React from "react";
import { Stack } from "expo-router";

export default function DebugLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="tokens" options={{ title: "Tokens" }} />
      <Stack.Screen name="phase1-audit" options={{ title: "Phase 1 Audit" }} />
    </Stack>
  );
}
