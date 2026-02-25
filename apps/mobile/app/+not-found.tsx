import React from "react";
import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "../src/providers/ThemeProvider";
import { spacing, typography } from "@yombri/design-tokens";
import { Button } from "../src/components/primitives/Button";

export default function NotFoundScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={{ flex: 1, backgroundColor: c.background, padding: spacing.gap.lg }}>
        <Text
          style={{
            fontFamily: typography.heading.md.fontFamily,
            fontSize: typography.heading.md.fontSize,
            lineHeight: typography.heading.md.lineHeight,
            fontWeight: typography.heading.md.fontWeight as unknown as "700",
            color: c.onBackground,
            marginBottom: spacing.gap.md,
          }}
        >
          Route not found
        </Text>

        <Button onPress={() => router.replace("/(debug)/phase1-audit")}>
          Back to Phase 1 Audit
        </Button>
      </View>
    </>
  );
}
