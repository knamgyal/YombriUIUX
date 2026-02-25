// apps/mobile/app/(tabs)/_layout.tsx
import React, { useMemo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/providers/ThemeProvider';

// ─── Elevated center tab button ──────────────────────────────────────────────

function ImpactTabButton({ onPress, accessibilityState }: BottomTabBarButtonProps) {
  const { theme } = useTheme();
  const c = theme.colors;
  const focused = accessibilityState?.selected ?? false;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.centerWrapper}
    >
      <View
        style={[
          styles.centerCircle,
          {
            backgroundColor: c.primary,
            shadowColor:     c.primary,
            borderColor:     focused
              ? (c.borderSubtle ?? 'rgba(255,255,255,0.25)')
              : 'transparent',
          },
        ]}
      >
        <Ionicons
          name="flash"
          size={26}
          color={c.onPrimary ?? c.onSurface}
        />
      </View>
    </Pressable>
  );
}

// ─── Tab layout ───────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { theme } = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const outline = useMemo(
    () => c.outline ?? c.surfaceVariant,
    [c.outline, c.surfaceVariant],
  );

  const tabBarBackground = useMemo(
    () => () =>
      Platform.OS === 'ios' ? (
        <BlurView
          intensity={88}
          tint={theme.mode === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        // Android: solid surface fallback (blur unreliable on emulator)
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: c.surface }]}
        />
      ),
    [theme.mode, c.surface],
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle:        { backgroundColor: c.surface },
        headerTintColor:    c.onSurface,
        headerShadowVisible: false,
        tabBarShowLabel:    false,
        tabBarActiveTintColor:   c.primary,
        tabBarInactiveTintColor: c.onSurfaceVariant,
        tabBarBackground,
        tabBarStyle: {
          backgroundColor:  Platform.OS === 'ios' ? 'transparent' : c.surface,
          borderTopColor:   outline,
          borderTopWidth:   StyleSheet.hairlineWidth,
          height:           64 + insets.bottom,
          paddingBottom:    insets.bottom,
          position:         'absolute',
        },
      }}
    >
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Center elevated tab */}
      <Tabs.Screen
        name="index"
        options={{
          title:         'Impact',
          tabBarButton:  (props) => <ImpactTabButton {...props} />,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerWrapper: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
  },
  centerCircle: {
    width:          56,
    height:         56,
    borderRadius:   28,
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   20,  // lifts circle above the tab bar line
    borderWidth:    1.5,
    shadowOffset:   { width: 0, height: 6 },
    shadowOpacity:  0.35,
    shadowRadius:   12,
    elevation:      10,
  },
});
