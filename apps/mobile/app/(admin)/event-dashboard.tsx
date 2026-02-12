// apps/mobile/app/(admin)/event-dashboard.tsx

import { View, Text, ScrollView } from "react-native";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function EventDashboardScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ padding: theme.spacing.md }}
    >
      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.xl,
          borderRadius: theme.radius.lg,
          marginBottom: theme.spacing.md,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.heading.fontSize,
            fontWeight: theme.typography.heading.fontWeight as any,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
          }}
        >
          Visual TOTP Code
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.lg, textAlign: "center" }}>
          30-second rotating code will display here (Phase 3)
        </Text>

        {/* Phase 3: Large, high-contrast TOTP display */}
        <View
          style={{
            width: "100%",
            aspectRatio: 2,
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.md,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 48, color: theme.colors.textMuted, fontWeight: "700" }}>
            ●●●●●●
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          borderRadius: theme.radius.lg,
        }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: theme.spacing.xs }}>
          QR Code
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
          Event token QR for scanner-based check-in (Phase 3)
        </Text>

        <View
          style={{
            width: 200,
            height: 200,
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.md,
            alignSelf: "center",
          }}
        />
      </View>
    </ScrollView>
  );
}
