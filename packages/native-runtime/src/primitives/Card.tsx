// packages/native-runtime/src/primitives/Card.tsx

import React from "react";
import { View, StyleSheet, ViewProps, ViewStyle } from "react-native";
import { colors, spacing, radius } from "@yombri/design-tokens";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  style,
  ...viewProps
}) => {
  return (
    <View
      style={[styles.base, elevated && styles.elevated, style]}
      {...viewProps}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
    padding: spacing.gap.md,
    borderWidth: 1,
    borderColor: colors.light.outline ?? colors.light.surfaceVariant,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0,
  },
});
