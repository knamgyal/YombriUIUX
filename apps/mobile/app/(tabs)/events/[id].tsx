// apps/mobile/app/(tabs)/events/[id].tsx

import { View, Text, ScrollView } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useTheme } from "../../../src/providers/ThemeProvider";

export default function EventDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Event Details",
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: theme.spacing.md }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.lg,
            borderRadius: theme.radius.lg,
            marginBottom: theme.spacing.md,
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
            Event #{id}
          </Text>
          <Text
            style={{
              color: theme.colors.textMuted,
              marginBottom: theme.spacing.md,
            }}
          >
            Event details screen placeholder
          </Text>

          {/* PRD requirement: "Must answer: Is this real? Who's organizing? What do I bring? What happens if I don't show?" */}
          <View style={{ marginTop: theme.spacing.md }}>
            <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: theme.spacing.xs }}>
              Organizer
            </Text>
            <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
              (Organizer identity will display here)
            </Text>

            <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: theme.spacing.xs }}>
              What to Bring
            </Text>
            <Text style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md }}>
              (Logistics will display here)
            </Text>

            <Text style={{ color: theme.colors.text, fontWeight: "600", marginBottom: theme.spacing.xs }}>
              Attendance Policy
            </Text>
            <Text style={{ color: theme.colors.textMuted }}>
              (Consequences of no-show will display here)
            </Text>
          </View>
        </View>

        {/* Placeholder for Check-In CTA - Phase 3 */}
        <View
          style={{
            backgroundColor: theme.colors.primaryContainer,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            alignItems: "center",
          }}
        >
          <Text style={{ color: theme.colors.onPrimaryContainer }}>
            Check-in flow will appear here (Phase 3)
          </Text>
        </View>
      </ScrollView>
    </>
  );
}
