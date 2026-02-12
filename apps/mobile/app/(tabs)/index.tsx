// apps/mobile/app/(tabs)/index.tsx

import { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function HomeScreen() {
  const { theme, mode, setMode } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.md }}
    >
      <Text
        style={{
          fontSize: theme.typography.heading.fontSize,
          fontWeight: theme.typography.heading.fontWeight as any,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
        }}
      >
        Impact Feed
      </Text>

      <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.lg }}>
        Current mode: {mode} (resolved: {theme.mode})
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.md,
          borderRadius: theme.radius.md,
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text style={{ color: theme.colors.text }}>
          No events yet. Signal that you're ready for action.
        </Text>
      </View>

      {/* Theme switcher for testing */}
      <View style={{ flexDirection: "row", gap: theme.spacing.xs, marginTop: theme.spacing.lg }}>
        <Text
          style={{ color: theme.colors.accent, padding: theme.spacing.xs }}
          onPress={() => setMode("light")}
        >
          Light
        </Text>
        <Text
          style={{ color: theme.colors.accent, padding: theme.spacing.xs }}
          onPress={() => setMode("dark")}
        >
          Dark
        </Text>
        <Text
          style={{ color: theme.colors.accent, padding: theme.spacing.xs }}
          onPress={() => setMode("system")}
        >
          System
        </Text>
      </View>
    </ScrollView>
  );
}
