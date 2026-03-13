// apps/mobile/app/+not-found.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../src/providers/ThemeProvider";
import { spacing, typography } from "@yombri/design-tokens";
import { Button } from "../src/components/primitives/Button";

import { BackgroundLayer } from "../src/components/layout/BackgroundLayer";
import { GlassCard } from "../src/components/layout/GlassCard";

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />

      <BackgroundLayer
        // Keep undefined unless asset exists:
        // source={require("../assets/backgrounds/home.jpg")}
      >
        <View style={[styles.container, { paddingTop: spacing.gap.lg }]}>
          <GlassCard padding={spacing.gap.lg}>
            <View style={styles.row}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={c.onSurfaceVariant}
              />
              <Text style={[styles.title, { color: c.onSurface }]}>
                Route not found
              </Text>
            </View>

            <Text style={[styles.body, { color: c.onSurfaceVariant }]}>
              This path doesn’t exist yet in Phase 1. Use the audit screen to navigate.
            </Text>

            <View style={{ height: spacing.gap.md }} />

            <Button onPress={() => router.replace("/(debug)/phase1-audit")}>
              Back to Phase 1 Audit
            </Button>

            <Button onPress={() => router.replace("/home")}>Go to Home</Button>
          </GlassCard>
        </View>
      </BackgroundLayer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen.xs,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gap.sm,
    marginBottom: spacing.gap.sm,
  },
  title: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize,
    lineHeight: typography.heading.md.lineHeight,
    fontWeight: "700",
  },
  body: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: "400",
  },
});
