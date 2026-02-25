// apps/mobile/src/components/layout/BackgroundLayer.tsx
import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

interface BackgroundLayerProps {
  source?: ImageSourcePropType;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BackgroundLayer({
  source,
  children,
  style,
}: BackgroundLayerProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  // backgroundOverlay comes from runtime theme (resolved from glassTokens).
  // If not yet added to runtime theme, overlay is skipped — no crash, no hardcoded value.
  const overlayColor: string | undefined = c.backgroundOverlay;

  const inner = (
    <View style={styles.fill}>
      {/* Token-driven overlay tint — renders only when token is resolved */}
      {overlayColor ? (
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: overlayColor }]}
          pointerEvents="none"
        />
      ) : null}

      {/* Content layer */}
      <View style={[styles.fill, style]}>{children}</View>
    </View>
  );

  if (!source) {
    return (
      <View style={[styles.fill, { backgroundColor: c.background }]}>
        {inner}
      </View>
    );
  }

  return (
    <ImageBackground source={source} style={styles.fill} resizeMode="cover">
      {inner}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
