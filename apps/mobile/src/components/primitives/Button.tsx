// apps/mobile/src/components/primitives/Button.tsx
import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from "react-native";
import { spacing, radius, typography } from "@yombri/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  textStyle,
  disabled,
  ...pressableProps
}: ButtonProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const containerStyle: ViewStyle = {
    backgroundColor:
      variant === "primary"
        ? c.primary
        : variant === "secondary"
          ? c.surface
          : "transparent",
    borderWidth: variant === "secondary" ? 1 : 0,
    borderColor:
      variant === "secondary"
        ? c.outline ?? c.surfaceVariant
        : "transparent",
  };

  const labelStyle: TextStyle = {
    color:
      variant === "primary"
        ? c.onPrimary
        : variant === "secondary"
          ? c.onSurface
          : c.primary,
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[`size_${size}`],
        containerStyle,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
      {...pressableProps}
    >
      <Text style={[styles.textBase, labelStyle, textStyle]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: spacing.touch,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.45,
  },

  size_sm: {
    paddingVertical: spacing.gap.xs,
    paddingHorizontal: spacing.gap.sm,
  },
  size_md: {
    paddingVertical: spacing.gap.sm,
    paddingHorizontal: spacing.gap.md,
  },
  size_lg: {
    paddingVertical: spacing.gap.md,
    paddingHorizontal: spacing.gap.lg,
  },

  textBase: {
    fontFamily: typography.label.md.fontFamily,
    fontSize: typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: typography.label.md.fontWeight as any,
  },
});
