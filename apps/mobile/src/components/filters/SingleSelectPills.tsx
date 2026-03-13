// apps/mobile/src/components/filters/SingleSelectPills.tsx
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { spacing } from "@yombri/design-tokens";
import { Chip } from "../primitives/Chip";

export type PillItem = { key: string; label: string };

type Props = {
  items: PillItem[];
  selectedKeys: string[]; // Phase 1: enforce length 1; future: multi-select
  onChange: (nextKeys: string[]) => void;
};

export function SingleSelectPills({ items, selectedKeys, onChange }: Props) {
  const selected = selectedKeys[0] ?? "all";

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((it) => (
          <Chip
            key={it.key}
            label={it.label}
            selected={it.key === selected}
            onPress={() => onChange([it.key])}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  row: { gap: spacing.gap.xs, paddingVertical: spacing.gap.xs },
});
