// apps/mobile/app/(debug)/tokens.tsx
import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function TokenScreen() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        padding: 16,
      }}
    >
      <Text
        style={{
          color: theme.colors.onSurface,
          fontSize: 16,
        }}
      >
        Mode: {theme.mode} – system: {theme.systemScheme}
      </Text>
      <Text
        style={{
          color: theme.colors.onSurface,
          fontSize: 14,
          marginTop: 4,
        }}
      >
        Background: {theme.colors.background} (test view)
      </Text>
    </View>
  );
}
