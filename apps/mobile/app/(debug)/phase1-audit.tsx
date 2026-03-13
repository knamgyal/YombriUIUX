// apps/mobile/app/(debug)/phase1-audit.tsx
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../src/providers/ThemeProvider";
import { spacing, radius, typography } from "@yombri/design-tokens";

import { Button } from "../../src/components/primitives/Button";
import { BackgroundLayer } from "../../src/components/layout/BackgroundLayer";
import { GlassCard } from "../../src/components/layout/GlassCard";
import { RadialProgress } from "../../src/components/impact/RadialProgress";
import { MonthlyImpactCard } from "../../src/components/impact/MonthlyImpactCard";
import { FloatingActionButton } from "../../src/components/layout/FloatingActionButton";

const PHASE1_TEST_EVENT_ID = "evt_community_cleanup";

export default function Phase1AuditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { theme, mode, setMode } = useTheme();
  const c = theme.colors;

  const [impact, setImpact] = useState(68);
  const [activeChip, setActiveChip] = useState("all");

  const outline = useMemo(() => c.outline ?? c.surfaceVariant, [c.outline, c.surfaceVariant]);

  const tabBarClearance = 64 + insets.bottom + 16;

  const hasGlassTokens = Boolean(c.backgroundGlass && c.borderSubtle);
  const hasProgressTokens = Boolean(c.progressTrack && c.progressActive);
  const hasOverlayToken = Boolean(c.backgroundOverlay);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <BackgroundLayer
        // Optional: add later if you want the audit to match the home vibe.
        // source={require("../../assets/backgrounds/home.jpg")}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + spacing.gap.md,
              paddingBottom: tabBarClearance + spacing.gap.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top header (glass) */}
          <GlassCard padding={spacing.gap.lg}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.kicker, { color: c.onSurfaceVariant }]}>
                  Phase 1 Audit
                </Text>
                <Text style={[styles.title, { color: c.onSurface }]}>
                  Production-safe UI validation
                </Text>
              </View>

              <View style={[styles.platformPill, { borderColor: outline }]}>
                <Ionicons
                  name={Platform.OS === "ios" ? "logo-apple" : "logo-android"}
                  size={16}
                  color={c.onSurfaceVariant}
                />
                <Text style={[styles.pillText, { color: c.onSurfaceVariant }]}>
                  {Platform.OS}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Runtime snapshot */}
          <GlassCard padding={spacing.gap.lg}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Runtime snapshot
            </Text>

            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Mode (persisted): {mode}
            </Text>
            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Resolved: {theme.mode}
            </Text>

            <View style={{ height: spacing.gap.sm }} />

            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Glass tokens present: {hasGlassTokens ? "yes" : "no"}
            </Text>
            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Progress tokens present: {hasProgressTokens ? "yes" : "no"}
            </Text>
            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Background overlay token present: {hasOverlayToken ? "yes" : "no"}
            </Text>
          </GlassCard>

          {/* Theme controls */}
          <GlassCard padding={spacing.gap.lg}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Theme controls
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Button onPress={() => setMode("light")}>Light</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button onPress={() => setMode("dark")}>Dark</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button onPress={() => setMode("system")}>System</Button>
              </View>
            </View>

            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              Expectation: dark mode remains dusk-toned (not pure black).
            </Text>
          </GlassCard>

          {/* Navigation smoke tests */}
          <GlassCard padding={spacing.gap.lg}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Navigation smoke tests
            </Text>

            <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
              These should open real routes. Missing routes should render Not Found without
              crashing.
            </Text>

            <View style={{ marginTop: spacing.gap.sm }}>
              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button onPress={() => router.push("/home")}>Home (Impact)</Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button onPress={() => router.push("/search")}>Discovery</Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button onPress={() => router.push("/calendar")}>Events</Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button onPress={() => router.push("/notifications")}>Groups</Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button onPress={() => router.push("/profile")}>Profile</Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button
                  onPress={() =>
                    router.push({
                      pathname: "/events/[id]",
                      params: { id: PHASE1_TEST_EVENT_ID },
                    })
                  }
                >
                  Event detail (Phase 1 id)
                </Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button
                  onPress={() =>
                    router.push(`/checkin?eventId=${PHASE1_TEST_EVENT_ID}`)
                  }
                >
                  Check-in (direct)
                </Button>
              </View>

              <View style={{ marginBottom: spacing.gap.sm }}>
                <Button onPress={() => router.push("/__phase1_missing_route__")}>
                  Missing route (should show Not Found)
                </Button>
              </View>
            </View>
          </GlassCard>

          {/* Glass + progress validation */}
          <GlassCard padding={spacing.gap.lg}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Glass + radial progress
            </Text>

            <View style={styles.progressRow}>
              <RadialProgress progress={impact} size={72} strokeWidth={7} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.metric, { color: c.onSurface }]}>Impact score</Text>
                <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
                  Ring is static (no animation). Uses semantic progress colors.
                </Text>
              </View>
            </View>

            <View style={{ height: spacing.gap.md }} />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Button onPress={() => setImpact((v) => Math.max(0, v - 10))}>-10</Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button onPress={() => setImpact((v) => Math.min(100, v + 10))}>+10</Button>
              </View>
            </View>

            <View style={{ height: spacing.gap.md }} />

            <MonthlyImpactCard
              progress={impact}
              activeChip={activeChip}
              onChipPress={setActiveChip}
            />
          </GlassCard>

          {/* Primitive sanity checks */}
          <GlassCard padding={spacing.gap.lg}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Primitive sanity checks
            </Text>

            <Button>Primary button</Button>
            <Button disabled>Disabled button</Button>

            <View
              style={{
                borderWidth: 1,
                borderColor: c.borderSubtle ?? outline,
                borderRadius: radius.md,
                padding: spacing.gap.md,
                backgroundColor: c.surface,
              }}
            >
              <Text style={[styles.meta, { color: c.onSurfaceVariant }]}>
                Border/contrast check (light + dark)
              </Text>
            </View>
          </GlassCard>
        </ScrollView>

        {/* Visual-only FAB for Phase 1 validation */}
        <FloatingActionButton
          bottomOffset={tabBarClearance}
          onPress={() => {}}
          icon={<Ionicons name="add" size={28} color={c.onPrimary ?? c.onSurface} />}
        />
      </BackgroundLayer>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen.xs,
    gap: spacing.gap.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gap.md,
  },
  kicker: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: "500",
    opacity: 0.9,
  },
  title: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize * 1.25,
    lineHeight: typography.heading.md.lineHeight * 1.15,
    fontWeight: "700",
    marginTop: spacing.gap.xs,
  },
  platformPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gap.xs,
    paddingHorizontal: spacing.gap.md,
    paddingVertical: spacing.gap.xs,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  pillText: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: "500",
  },
  sectionTitle: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize,
    lineHeight: typography.heading.md.lineHeight,
    fontWeight: "600",
    marginBottom: spacing.gap.sm,
  },
  meta: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: "400",
  },
  row: {
    flexDirection: "row",
    gap: spacing.gap.sm,
    marginTop: spacing.gap.sm,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.gap.md,
  },
  metric: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize,
    lineHeight: typography.heading.md.lineHeight,
    fontWeight: "700",
  },
});
