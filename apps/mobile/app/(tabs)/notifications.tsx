// apps/mobile/app/(tabs)/notifications.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../../src/providers/ThemeProvider";
import { spacing, typography } from "@yombri/design-tokens";

import { GlassCard } from "../../src/components/layout/GlassCard";
import { ListItem } from "../../src/components/primitives/ListItem";
import { Button } from "../../src/components/primitives/Button";
import { SingleSelectPills, PillItem } from "../../src/components/filters/SingleSelectPills";

import { GROUPS_SEED as PHASE1_GROUPS } from "@yombri/data";

const FILTERS: PillItem[] = [
  { key: "all", label: "All" },
  { key: "event", label: "Event groups" },
  { key: "requests", label: "Requests" },
];

export default function GroupsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const [selectedKeys, setSelectedKeys] = useState<string[]>(["all"]);
  const selected = selectedKeys[0] ?? "all";

  const list = useMemo(() => {
    if (selected === "all") return PHASE1_GROUPS;
    return PHASE1_GROUPS.filter((g) => g.category === selected);
  }, [selected]);

  const tabBarClearance = 64 + insets.bottom + 16;

  return (
    <>
      <Stack.Screen options={{ title: "Groups", headerShadowVisible: false }} />

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
          <Text style={[styles.title, { color: c.onSurface }]}>Groups</Text>
          <Text style={[styles.body, { color: c.onSurfaceVariant }]}>
            Phase 1 local shell. Phase 2 will enforce membership + blocking rules.
          </Text>

          <View style={{ height: spacing.gap.md }} />

          <SingleSelectPills items={FILTERS} selectedKeys={selectedKeys} onChange={setSelectedKeys} />
        </GlassCard>

        <GlassCard padding={spacing.gap.lg}>
          <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Your groups</Text>

          <View style={{ height: spacing.gap.sm }} />

          {list.map((g: Phase1Group) => (
            <View key={g.id} style={{ marginBottom: spacing.gap.sm }}>
              <ListItem
                title={g.name}
                subtitle={g.subtitle}
                right={<Ionicons name="chevron-forward" size={18} color={c.onSurfaceVariant} />}
                onPress={() => {
                  // Phase 2: route to /groups/[id] or /chat/[id]
                }}
              />
            </View>
          ))}

          {list.length === 0 ? (
            <>
              <Text style={[styles.body, { color: c.onSurfaceVariant }]}>
                No items in this filter (Phase 1 stub).
              </Text>
              <View style={{ height: spacing.gap.md }} />
              <Button variant="secondary" onPress={() => router.push("/search")}>
                Go to Discovery
              </Button>
            </>
          ) : null}
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
