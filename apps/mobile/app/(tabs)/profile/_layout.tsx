import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/providers/ThemeProvider';

export default function ProfileLayout() {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: c.surface },
        headerTintColor: c.onSurface,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit profile',
        }}
      />
    </Stack>
  );
}
