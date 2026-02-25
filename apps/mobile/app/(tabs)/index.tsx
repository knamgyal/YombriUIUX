// apps/mobile/app/(tabs)/index.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundLayer }    from '../../src/components/layout/BackgroundLayer';
import { GlassCard }          from '../../src/components/layout/GlassCard';
import { MonthlyImpactCard }  from '../../src/components/impact/MonthlyImpactCard';
import { FloatingActionButton } from '../../src/components/layout/FloatingActionButton';

import { useTheme }                  from '../../src/providers/ThemeProvider';
import { spacing, typography }       from '@yombri/design-tokens';

// ─── Phase 1 static placeholder data ─────────────────────────────────────────

const IMPACT_STUB = {
  eventsAttended:    3,
  volunteeredHours: 12,
  impactScore:      68,
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ImpactHomeScreen() {
  const { theme }                   = useTheme();
  const c                           = theme.colors;
  const insets                      = useSafeAreaInsets();
  const [activeChip, setActiveChip] = useState('all');

  // Tab bar is position:absolute (height ~64 + safeArea bottom).
  const tabBarClearance = 64 + insets.bottom + 16;

  return (
    <>
      {/* Hide the stack header — BackgroundLayer fills the full screen */}
      <Stack.Screen options={{ headerShown: false }} />

      <BackgroundLayer
        // Drop home.jpg in apps/mobile/assets/backgrounds/home.jpg
        // Remove this source prop until the image file exists:
        source={require('../../assets/backgrounds/home.jpg')}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarClearance + spacing.gap.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Page header — padded for status bar since header is hidden */}
          <View style={[styles.pageHeader, { paddingTop: insets.top + spacing.gap.md }]}>
            <Text style={[styles.greeting, { color: c.onBackground }]}>
              Good evening 👋
            </Text>
            <Text style={[styles.headline, { color: c.onBackground }]}>
              Your Impact
            </Text>
          </View>

          {/* Monthly Impact Card (glass + radial progress + chips) */}
          <MonthlyImpactCard
            progress={IMPACT_STUB.impactScore}
            activeChip={activeChip}
            onChipPress={setActiveChip}
          />

          {/* Stats row */}
          <View style={styles.statsRow}>
            <GlassCard style={styles.statCard} padding={spacing.gap.md}>
              <Text style={[styles.statValue, { color: c.onSurface }]}>
                {IMPACT_STUB.eventsAttended}
              </Text>
              <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>
                Events
              </Text>
            </GlassCard>

            <GlassCard style={styles.statCard} padding={spacing.gap.md}>
              <Text style={[styles.statValue, { color: c.onSurface }]}>
                {IMPACT_STUB.volunteeredHours}h
              </Text>
              <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>
                Volunteer
              </Text>
            </GlassCard>

            <GlassCard style={styles.statCard} padding={spacing.gap.md}>
              <Text style={[styles.statValue, { color: c.progressActive ?? c.primary }]}>
                {IMPACT_STUB.impactScore}
              </Text>
              <Text style={[styles.statLabel, { color: c.onSurfaceVariant }]}>
                Score
              </Text>
            </GlassCard>
          </View>

          {/* Upcoming events — Phase 2 placeholder */}
          <GlassCard padding={spacing.gap.lg}>
            <Text style={[styles.sectionTitle, { color: c.onSurface }]}>
              Upcoming Events
            </Text>
            <Text style={[styles.placeholderBody, { color: c.onSurfaceVariant }]}>
              Event feed connects here in Phase 2.
            </Text>
          </GlassCard>
        </ScrollView>

        {/* Floating action button — anchored above tab bar */}
        <FloatingActionButton
          bottomOffset={tabBarClearance}
          onPress={() => {
            /* Phase 2: quick check-in / create event */
          }}
          icon={
            <Ionicons
              name="add"
              size={28}
              color={c.onPrimary ?? c.onSurface}
            />
          }
        />
      </BackgroundLayer>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.screen.xs,
    gap:               spacing.gap.md,
  },
  pageHeader: {
    marginBottom: spacing.gap.sm,
  },
  greeting: {
    fontFamily: typography.label.md.fontFamily,
    fontSize:   typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
    fontWeight: '400',
    opacity:    0.80,
    marginBottom: spacing.gap.xs,
  },
  headline: {
    fontFamily: typography.heading.md.fontFamily,
    fontSize:   typography.heading.md.fontSize * 1.5,
    lineHeight: typography.heading.md.lineHeight * 1.3,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap:           spacing.gap.sm,
  },
  statCard: {
    flex:       1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily:  typography.heading.md.fontFamily,
    fontSize:    typography.heading.md.fontSize,
    fontWeight:  '700',
    lineHeight:  typography.heading.md.lineHeight,
    textAlign:   'center',
  },
  statLabel: {
    fontFamily:  typography.label.md.fontFamily,
    fontSize:    typography.label.md.fontSize,
    lineHeight:  typography.label.md.lineHeight,
    fontWeight:  '400',
    textAlign:   'center',
    marginTop:   spacing.gap.xs,
  },
  sectionTitle: {
    fontFamily:   typography.heading.md.fontFamily,
    fontSize:     typography.heading.md.fontSize,
    fontWeight:   '600',
    lineHeight:   typography.heading.md.lineHeight,
    marginBottom: spacing.gap.sm,
  },
  placeholderBody: {
    fontFamily: typography.label.md.fontFamily,
    fontSize:   typography.label.md.fontSize,
    lineHeight: typography.label.md.lineHeight,
  },
});
