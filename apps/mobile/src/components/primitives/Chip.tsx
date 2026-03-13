// apps/mobile/src/components/primitives/Chip.tsx
import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle, TextStyle } from "react-native";
import { spacing, typography, radiusExtensions } from "@yombri/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  style,
  textStyle,
}: ChipProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: spacing.touch,
          borderRadius: radiusExtensions.full,
          backgroundColor: selected ? c.primary : (c.surfaceVariant ?? c.surface),
          borderColor: selected ? c.primary : (c.borderSubtle ?? c.outline ?? c.surfaceVariant),
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? (c.onPrimary ?? c.onSurface) : c.onSurfaceVariant },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.gap.md,
    paddingVertical: spacing.gap.xs,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: "600",
  },
});
