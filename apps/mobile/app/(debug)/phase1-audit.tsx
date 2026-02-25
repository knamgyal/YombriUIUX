// apps/mobile/app/(debug)/phase1-audit.tsx
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";

import { useTheme } from "../../src/providers/ThemeProvider";
import { spacing, radius, typography } from "@yombri/design-tokens";

import { Button } from "../../src/components/primitives/Button";
import { TextInput } from "../../src/components/primitives/TextInput";
import { ListItem } from "../../src/components/primitives/ListItem";

export default function Phase1AuditScreen() {
  const { theme, mode, setMode } = useTheme();
  const [value, setValue] = useState("");
  const [errorOn, setErrorOn] = useState(false);

  const c = theme.colors;
  const router = useRouter();

  const outline = useMemo(() => c.outline ?? c.surfaceVariant, [c.outline, c.surfaceVariant]);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Phase 1 Audit",
          headerShown: true,
          headerStyle: { backgroundColor: c.surface },
          headerTintColor: c.onSurface,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen.xs,
          paddingVertical: spacing.gap.lg,
          gap: spacing.gap.lg,
        }}
      >
        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: outline,
            padding: spacing.gap.lg,
          }}
        >
          <Text
            style={{
              fontFamily: typography.heading.md.fontFamily,
              fontSize: typography.heading.md.fontSize,
              lineHeight: typography.heading.md.lineHeight,
              fontWeight: typography.heading.md.fontWeight as unknown as "400",
              color: c.onSurface,
              marginBottom: spacing.gap.sm,
            }}
          >
            Runtime snapshot
          </Text>

          <Text style={{ color: c.onSurfaceVariant, marginBottom: spacing.gap.xs }}>
            Platform: {Platform.OS}
          </Text>
          <Text style={{ color: c.onSurfaceVariant, marginBottom: spacing.gap.xs }}>
            Mode (persisted): {mode}
          </Text>
          <Text style={{ color: c.onSurfaceVariant }}>Resolved: {theme.mode}</Text>
        </View>

        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: outline,
            padding: spacing.gap.lg,
            gap: spacing.gap.sm,
          }}
        >
          <Text
            style={{
              fontFamily: typography.label.md.fontFamily,
              fontSize: typography.label.md.fontSize,
              lineHeight: typography.label.md.lineHeight,
              fontWeight: typography.label.md.fontWeight as unknown as "400",
              color: c.onSurface,
            }}
          >
            Theme controls
          </Text>

          <View style={{ flexDirection: "row", gap: spacing.gap.sm }}>
            <View style={{ flex: 1 }}>
              <Button onPress={() => setMode("light")}>Light</Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={() => setMode("dark")}>Dark</Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={() => setMode("system")}>System</Button>
            </View>
          </View>
        </View>


        <View
  style={{
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: outline,
    padding: spacing.gap.lg,
    gap: spacing.gap.sm,
  }}
>
  <Text
    style={{
      fontFamily: typography.label.md.fontFamily,
      fontSize: typography.label.md.fontSize,
      lineHeight: typography.label.md.lineHeight,
      fontWeight: typography.label.md.fontWeight as unknown as "400",
      color: c.onSurface,
    }}
  >
    Navigation smoke tests
  </Text>

  <Text style={{ color: c.onSurfaceVariant }}>
    These buttons should open real routes (Phase 1 placeholders are OK).
  </Text>

  <Button onPress={() => router.push("/home")}>Home</Button>

  {/* Uses your dynamic route: app/(tabs)/events/[id].tsx => /events/:id [web:276] */}
  <Button onPress={() => router.push("/checkin")}>Check-in</Button>
<Button onPress={() => router.push("/chat")}>Chat</Button>

<Button
  onPress={() =>
    router.push({ pathname: "/events/[id]", params: { id: "phase1-test-event" } })
  }
>
  Event detail
</Button>

  {/* Optional: Admin group route example if you keep it */}
  <Button onPress={() => router.push("/(admin)/event-dashboard")}>
    Admin dashboard
  </Button>
</View>


        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: outline,
            padding: spacing.gap.lg,
            gap: spacing.gap.sm,
          }}
        >
          <Text
            style={{
              fontFamily: typography.label.md.fontFamily,
              fontSize: typography.label.md.fontSize,
              lineHeight: typography.label.md.lineHeight,
              fontWeight: typography.label.md.fontWeight as unknown as "400",
              color: c.onSurface,
            }}
          >
            Primitive checks
          </Text>

          <Button>Primary button</Button>
          <Button disabled>Disabled button</Button>

          <ListItem title="List item title" subtitle="Subtitle uses tokens" onPress={() => {}} />

          <TextInput
            label="Text input"
            value={value}
            onChangeText={setValue}
            placeholder="Type to validate spacing + typography"
            autoCapitalize="none"
          />

          <TextInput
            label="Error input"
            value={value}
            onChangeText={setValue}
            placeholder="Toggle error state"
            error={errorOn ? "Example error message" : undefined}
            autoCapitalize="none"
          />

          <Button onPress={() => setErrorOn((v) => !v)}>Toggle error</Button>

          <View
            style={{
              borderWidth: 1,
              borderColor: outline,
              borderRadius: radius.md,
              padding: spacing.gap.md,
              backgroundColor: c.surface,
            }}
          >
            <Text style={{ color: c.onSurfaceVariant }}>
              Outline visibility check (light + dark)
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
