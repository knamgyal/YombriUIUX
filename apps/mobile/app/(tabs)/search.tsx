// apps/mobile/app/(tabs)/search.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/providers/ThemeProvider';
import { spacing, typography } from '@yombri/design-tokens';

export default function SearchScreen() {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <>
      <Stack.Screen options={{ title: 'Search' }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.label, { color: c.onSurfaceVariant }]}>
          Search — Phase 2
        </Text>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: {
    fontFamily: typography.label.md.fontFamily,
    fontSize:   typography.label.md.fontSize,
    padding:    spacing.gap.lg,
  },
});
