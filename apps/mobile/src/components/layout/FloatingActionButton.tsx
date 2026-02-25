// apps/mobile/src/components/layout/FloatingActionButton.tsx
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { elevationTokens } from '@yombri/design-tokens';
import { useTheme } from '../../providers/ThemeProvider';

interface FloatingActionButtonProps {
  onPress?:      () => void;
  icon:          React.ReactNode;
  size?:         number;
  /** Extra bottom offset in px — use to clear absolute tab bars */
  bottomOffset?: number;
  style?:        ViewStyle;
}

export function FloatingActionButton({
  onPress,
  icon,
  size         = 56,
  bottomOffset = 96,
  style,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          width:        size,
          height:       size,
          borderRadius: size / 2,
          backgroundColor: c.primary,
          // Elevation uses static token + dynamic primary shadow color
          ...elevationTokens.fab,
          shadowColor: c.primary,
          bottom:      bottomOffset,
          opacity:     pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.inner}>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position:       'absolute',
    right:          24,
    justifyContent: 'center',
    alignItems:     'center',
  },
  inner: {
    justifyContent: 'center',
    alignItems:     'center',
  },
});
