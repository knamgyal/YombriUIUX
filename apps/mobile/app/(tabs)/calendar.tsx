// apps/mobile/app/(tabs)/calendar.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../src/providers/ThemeProvider";
import { spacing, typography } from "@yombri/design-tokens";

import { GlassCard } from "../../src/components/layout/GlassCard";
import { ListItem } from "../../src/components/primitives/ListItem";
import { SingleSelectPills, PillItem } from "../../src/components/filters/SingleSelectPills";

import { EVENTS_SEED as PHASE1_EVENTS } from "@yombri/data";

const FILTERS: PillItem[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

export default function EventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const [selectedKeys, setSelectedKeys] = useState<string[]>(["all"]);
  const selected = selectedKeys[0] ?? "all";

  const list = useMemo(() => {
    if (selected === "all") return PHASE1_EVENTS;
    return PHASE1_EVENTS.filter((e) => e.status === selected);
  }, [selected]);

  const tabBarClearance = 64 + insets.bottom + 16;

  return (
    <>
      <Stack.Screen options={{ title: "Events", headerShadowVisible: false }} />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.gap.md,
            paddingBottom: tabBarClearance + spacing.gap.lg,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard padding={spacing.gap.lg}>
          <Text style={[styles.title, { color: c.onSurface }]}>Your events</Text>
          <Text style={[styles.body, { color: c.onSurfaceVariant }]}>
            Phase 1: local list with a stable contract for Phase 2.
          </Text>

          <View style={{ height: spacing.gap.md }} />

          <SingleSelectPills items={FILTERS} selectedKeys={selectedKeys} onChange={setSelectedKeys} />
        </GlassCard>

        <GlassCard padding={spacing.gap.lg}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>List</Text>

          <View style={{ height: spacing.gap.sm }} />

          {list.map((e: Phase1Event) => (
            <View key={e.id} style={{ marginBottom: spacing.gap.sm }}>
              <ListItem
                title={e.title}
                subtitle={`${e.whenLabel} • ${e.whereLabel}`}
                onPress={() => router.push({ pathname: "/events/[id]", params: { id: e.id } })}
              />
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screen.xs, gap: spacing.gap.lg },
  title: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize * 1.15,
    lineHeight: typography.heading.md.lineHeight,
    fontWeight: "700",
  },
  body: {
    marginTop: spacing.gap.xs,
    fontFamily: typography.body.md.fontFamily,
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    fontWeight: "400",
  },
  sectionTitle: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize: typography.heading.md.fontSize,
    lineHeight: typography.heading.md.lineHeight,
    fontWeight: "600",
  },
});
