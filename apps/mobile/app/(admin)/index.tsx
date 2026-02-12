// apps/mobile/app/(admin)/index.tsx

import { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function OrganizerDashboardScreen() {
  const { theme } = useTheme();

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
        Organizer Dashboard
      </Text>

      <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.lg }}>
        Hidden admin path - not discoverable via tabs
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
          marginBottom: theme.spacing.md,
        }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: theme.spacing.xs }}>
          Your Events
        </Text>
        <Text style={{ color: theme.colors.textMuted }}>
          Event management interface (Phase 3)
        </Text>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
        }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: theme.spacing.xs }}>
          Interest Signals
        </Text>
        <Text style={{ color: theme.colors.textMuted }}>
          Aggregated demand signals (Phase 2 backend, Phase 3 UI)
        </Text>
      </View>
    </ScrollView>
  );
}
