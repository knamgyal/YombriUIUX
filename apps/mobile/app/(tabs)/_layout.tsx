// apps/mobile/app/(tabs)/_layout.tsx

import { Tabs } from "expo-router";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline ?? theme.colors.surfaceVariant ?? theme.colors.surfaceMuted,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.typography.label.fontFamily,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Impact",
          tabBarTestID: "impact-tab",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarTestID: "profile-tab",
        }}
      />

      {/* Hidden routes - no tab button */}
      <Tabs.Screen
        name="events/[id]"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="checkin"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
