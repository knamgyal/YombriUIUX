// apps/mobile/app/(admin)/_layout.tsx

import { Stack } from "expo-router";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function AdminLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Organizer Dashboard",
        }}
      />
      <Stack.Screen
        name="event-dashboard"
        options={{
          title: "Event Dashboard",
        }}
      />
    </Stack>
  );
}
