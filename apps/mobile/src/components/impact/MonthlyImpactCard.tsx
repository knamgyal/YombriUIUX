// apps/mobile/src/components/impact/MonthlyImpactCard.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { GlassCard } from '../layout/GlassCard';
import { RadialProgress } from './RadialProgress';
import { useTheme } from '../../providers/ThemeProvider';
import { spacing, radius, typography, radiusExtensions } from '@yombri/design-tokens';

interface Chip {
  key: string;
  label: string;
}

const DEFAULT_CHIPS: Chip[] = [
  { key: 'all',        label: 'All' },
  { key: 'events',     label: 'Events' },
  { key: 'volunteer',  label: 'Volunteer' },
  { key: 'donations',  label: 'Donations' },
];

interface MonthlyImpactCardProps {
  title?:        string;
  subtitle?:     string;
  progress?:     number;
  chips?:        Chip[];
  activeChip?:   string;
  onChipPress?:  (key: string) => void;
  style?:        ViewStyle;
}

export function MonthlyImpactCard({
  title      = 'Monthly Impact',
  subtitle   = 'February 2026',
  progress   = 0,
  chips      = DEFAULT_CHIPS,
  activeChip = 'all',
  onChipPress,
  style,
}: MonthlyImpactCardProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const chipPillRadius = radiusExtensions.full;

  return (
    <GlassCard padding={spacing.gap.lg} style={style}>
      {/* Header row: title + progress ring */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.onSurface }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: c.onSurfaceVariant }]}>{subtitle}</Text>
        </View>
        <RadialProgress progress={progress} size={72} strokeWidth={7} />
      </View>

      {/* Progress label — uses progressActive with primary fallback */}
      <Text style={[styles.progressLabel, { color: c.progressActive ?? c.primary }]}>
        {progress}% complete
      </Text>

      {/* Chip filter row */}
      <View style={styles.chipRow}>
        {chips.map((chip) => {
          const active = chip.key === activeChip;
          return (
            <Pressable
              key={chip.key}
              onPress={() => onChipPress?.(chip.key)}
              style={[
                styles.chip,
                {
                  borderRadius:    chipPillRadius,
                  backgroundColor: active ? c.primary     : (c.surfaceVariant ?? c.surface),
                  borderColor:     active ? c.primary     : (c.borderSubtle   ?? c.outline),
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? (c.onPrimary ?? c.onSurface) : c.onSurfaceVariant },
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   spacing.gap.sm,
  },
  headerText: {
    flex:        1,
    marginRight: spacing.gap.md,
  },
  title: {
    fontFamily:  typography.heading.md.fontFamily,
    fontSize:    typography.heading.md.fontSize,
    lineHeight:  typography.heading.md.lineHeight,
    fontWeight:  '600',
  },
  subtitle: {
    fontFamily:  typography.label.md.fontFamily,
    fontSize:    typography.label.md.fontSize,
    lineHeight:  typography.label.md.lineHeight,
    fontWeight:  '400',
    marginTop:   spacing.gap.xs,
  },
  progressLabel: {
    fontFamily:   typography.label.md.fontFamily,
    fontSize:     typography.label.md.fontSize,
    lineHeight:   typography.label.md.lineHeight,
    fontWeight:   '600',
    marginBottom: spacing.gap.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.gap.xs,
  },
  chip: {
    paddingHorizontal: spacing.gap.md,
    paddingVertical:   spacing.gap.xs,
    borderWidth:       1,
  },
  chipLabel: {
    fontFamily:  typography.label.md.fontFamily,
    fontSize:    typography.label.md.fontSize,
    fontWeight:  '500',
  },
});
