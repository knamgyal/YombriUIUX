// apps/mobile/app/+not-found.tsx

import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";
import { useTheme } from "../src/providers/ThemeProvider";

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
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
          This screen doesn't exist.
        </Text>
        <Link href="/" style={{ color: theme.colors.accent, marginTop: theme.spacing.md }}>
          Go to home screen
        </Link>
      </View>
    </>
  );
}
