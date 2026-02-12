// packages/native-runtime/src/primitives/ListItem.tsx

import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  PressableProps,
} from "react-native";
import { colors, spacing, typography } from "@yombri/design-tokens";

export interface ListItemProps extends Omit<PressableProps, "style"> {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  left,
  right,
  style,
  titleStyle,
  subtitleStyle,
  disabled,
  ...pressableProps
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...pressableProps}
    >
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        )}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: spacing.touch, // 44px minimum
    paddingHorizontal: spacing.gap.md,
    paddingVertical: spacing.gap.sm,
    backgroundColor: colors.light.surface,
  },
  pressed: {
    backgroundColor: colors.light.surfaceMuted,
  },
  disabled: {
    opacity: 0.4,
  },
  left: {
    marginRight: spacing.gap.sm,
  },
  content: {
    flex: 1,
  },
  right: {
    marginLeft: spacing.gap.sm,
  },
  title: {
    fontSize: typography.body.md.fontSize,
    fontWeight: typography.body.md.fontWeight as any,
    fontFamily: typography.body.md.fontFamily,
    color: colors.light.text,
  },
  subtitle: {
    fontSize: typography.label.sm.fontSize,
    fontFamily: typography.label.sm.fontFamily,
    color: colors.light.textMuted,
    marginTop: spacing.gap.xs,
  },
});
