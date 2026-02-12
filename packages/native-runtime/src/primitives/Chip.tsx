// packages/native-runtime/src/primitives/Chip.tsx

import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, PressableProps } from "react-native";
import { colors, spacing, radius, typography } from "@yombri/design-tokens";

export interface ChipProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  selected?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  selected = false,
  style,
  textStyle,
  disabled,
  ...pressableProps
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        selected && styles.selected,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...pressableProps}
    >
      <Text style={[styles.text, selected && styles.textSelected, textStyle]}>
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.gap.sm,
    paddingVertical: spacing.gap.xs,
    borderRadius: radius.full,
    backgroundColor: colors.light.surfaceMuted,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    backgroundColor: colors.light.primaryContainer,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontSize: typography.label.sm.fontSize,
    fontFamily: typography.label.sm.fontFamily,
    fontWeight: typography.label.sm.fontWeight as any,
    color: colors.light.text,
  },
  textSelected: {
    color: colors.light.onPrimaryContainer,
  },
});
