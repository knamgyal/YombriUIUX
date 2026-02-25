// apps/mobile/src/components/layout/GlassCard.tsx
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { radius, elevationTokens } from '@yombri/design-tokens';
import { useTheme } from '../../providers/ThemeProvider';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  padding?: number;
}

export function GlassCard({
  children,
  style,
  intensity = 45,
  padding = 0,
}: GlassCardProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  // All fallbacks reference existing runtime theme tokens — no hardcoded hex in app layer.
  const glassOverlay: string = c.backgroundGlass ?? c.surface;
  const borderColor: string  = c.borderSubtle    ?? c.outline ?? c.surfaceVariant;

  const containerStyle: ViewStyle = {
    borderRadius:  radius.lg,
    borderWidth:   1,
    borderColor,
    overflow:      'hidden',
    ...elevationTokens.glass,
    ...style,
  };

  // BlurView is EAS/Hermes safe. On Android emulator blur may render as transparent —
  // the glassOverlay View below ensures the card always has visual depth.
  const canBlur = Platform.OS === 'ios' || Platform.OS === 'android';

  if (canBlur) {
    return (
      <View style={containerStyle}>
        <BlurView
          intensity={intensity}
          tint={theme.mode === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Semi-transparent color overlay on top of blur */}
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: glassOverlay }]}
          pointerEvents="none"
        />
        <View style={{ padding }}>{children}</View>
      </View>
    );
  }

  // Graceful fallback: solid surface, no blur
  return (
    <View style={[containerStyle, { backgroundColor: c.surface }]}>
      <View style={{ padding }}>{children}</View>
    </View>
  );
}
