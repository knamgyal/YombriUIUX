// packages/native-runtime/src/primitives/Button.tsx

import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from "react-native";
import { colors, spacing, radius, typography } from "@yombri/design-tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  style,
  textStyle,
  disabled,
  ...pressableProps
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${variant}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !disabled && styles.pressed,
      ]}
      disabled={disabled}
      {...pressableProps}
    >
      <Text style={textStyles}>{children}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: spacing.touch, // 44px minimum touch target
  },
  primary: {
    backgroundColor: colors.light.primary,
  },
  secondary: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.outline ?? colors.light.surfaceVariant,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },

  // Size variants
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

  // Text styles
  text: {
    fontSize: typography.body.md.fontSize,
    fontWeight: typography.body.md.fontWeight as any,
    fontFamily: typography.body.md.fontFamily,
  },
  text_primary: {
    color: colors.light.onPrimary,
  },
  text_secondary: {
    color: colors.light.text,
  },
  text_ghost: {
    color: colors.light.primary,
  },
  textDisabled: {
    opacity: 1, // Parent handles opacity
  },
});
