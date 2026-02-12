// packages/native-runtime/src/primitives/IconButton.tsx

import React from "react";
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from "react-native";
import { spacing, radius } from "@yombri/design-tokens";

export interface IconButtonProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  size?: number;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  size = spacing.touch,
  style,
  disabled,
  ...pressableProps
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          minWidth: spacing.touch,
          minHeight: spacing.touch,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...pressableProps}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
