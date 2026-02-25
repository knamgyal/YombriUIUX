// apps/mobile/src/components/primitives/ListItem.tsx
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
import { spacing, radius, typography } from "@yombri/design-tokens";
import { useTheme } from "../../providers/ThemeProvider";

export interface ListItemProps extends Omit<PressableProps, "style"> {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export function ListItem({
  title,
  subtitle,
  left,
  right,
  style,
  titleStyle,
  subtitleStyle,
  disabled,
  ...pressableProps
}: ListItemProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed && !disabled ? c.surfaceVariant : c.surface,
          borderColor: c.outline ?? c.surfaceVariant,
        },
        disabled ? styles.disabled : null,
        style,
      ]}
      {...pressableProps}
    >
      {left ? <View style={styles.left}>{left}</View> : null}

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: c.onSurface },
            titleStyle,
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.subtitle,
              { color: c.onSurfaceVariant },
              subtitleStyle,
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: spacing.touch,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.gap.md,
    paddingVertical: spacing.gap.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  disabled: {
    opacity: 0.5,
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
    fontFamily: typography.body.md.fontFamily,
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    fontWeight: typography.body.md.fontWeight as any,
  },
  subtitle: {
    marginTop: spacing.gap.xs,
    fontFamily: typography.body.sm.fontFamily,
    fontSize: typography.body.sm.fontSize,
    lineHeight: typography.body.sm.lineHeight,
    fontWeight: typography.body.sm.fontWeight as any,
  },
});
