// apps/mobile/app/(tabs)/checkin.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { useTheme } from "../../src/providers/ThemeProvider";
import { spacing, typography, radius } from "@yombri/design-tokens";

import { GlassCard } from "../../src/components/layout/GlassCard";
import { Button } from "../../src/components/primitives/Button";

type Params = { eventId?: string | string[] };

function normalizeParam(v?: string | string[]) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default function CheckInScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.colors;

  const params = useLocalSearchParams<Params>();
  const eventId = normalizeParam(params.eventId);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Check In",
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.onSurface,
          headerShadowVisible: false,
        }}
      />

      <View style={[styles.container, { backgroundColor: c.background }]}>
        <GlassCard padding={spacing.gap.lg} style={styles.card}>
          <Text style={[styles.title, { color: c.onSurface }]}>Check-in</Text>

          <Text style={[styles.body, { color: c.onSurfaceVariant }]}>
            Phase 1 stub screen to validate navigation + theming.
          </Text>

          <View style={{ height: spacing.gap.sm }} />

          <View
            style={[
              styles.metaBox,
              {
                backgroundColor: c.surfaceVariant,
                borderColor: c.borderSubtle ?? c.outline ?? c.surfaceVariant,
              },
            ]}
          >
            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              eventId: {eventId ?? "(missing)"}
            </Text>
            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Phase 3 will implement Magic + Manual verification.
            </Text>
          </View>

          <View style={{ height: spacing.gap.md }} />

          <Button variant="secondary" onPress={() => router.back()}>
            Back
          </Button>

          <View style={{ height: spacing.gap.sm }} />

          <Button onPress={() => router.replace("/(debug)/phase1-audit")}>
            Back to Phase 1 Audit
          </Button>
        </GlassCard>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen.xs,
    justifyContent: "center",
  },
  card: {
    borderRadius: radius.lg,
  },
  title: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize,
    lineHeight: typography.heading.md.lineHeight,
    fontWeight: "700",
    marginBottom: spacing.gap.xs,
  },
  body: {
    fontFamily: typography.body.md.fontFamily,
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    fontWeight: "400",
  },
  metaBox: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.gap.md,
    gap: spacing.gap.xs,
  },
  meta: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: "400",
  },
});
