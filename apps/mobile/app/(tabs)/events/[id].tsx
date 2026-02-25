// apps/mobile/app/(tabs)/events/[id].tsx
import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";

import { useTheme } from "../../../src/providers/ThemeProvider";
import EventDetailScreen from "../../../src/screens/EventDetailScreen";

export default function EventDetailRoute() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: id ? "Event" : "Event",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          headerShadowVisible: false,
        }}
      />
      <EventDetailScreen />
    </>
  );
}
