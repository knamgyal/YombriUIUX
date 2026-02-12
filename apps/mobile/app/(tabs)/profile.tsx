// apps/mobile/app/(tabs)/profile.tsx

import { View, Text } from "react-native";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function ProfileScreen() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
      }}
    >
      <Text
        style={{
          fontSize: theme.typography.heading.fontSize,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
        }}
      >
        Legacy Timeline
      </Text>
      <Text style={{ color: theme.colors.textMuted }}>
        Your verified impact moments will appear here.
      </Text>
    </View>
  );
}
