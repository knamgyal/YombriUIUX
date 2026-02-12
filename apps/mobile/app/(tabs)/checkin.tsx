// apps/mobile/app/(tabs)/checkin.tsx

import { View, Text } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "../../src/providers/ThemeProvider";

export default function CheckInScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Check In",
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.md,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.xl,
            borderRadius: theme.radius.lg,
            alignItems: "center",
            maxWidth: 400,
          }}
        >
          <Text
            style={{
              fontSize: theme.typography.heading.fontSize,
              fontWeight: theme.typography.heading.fontWeight as any,
              color: theme.colors.text,
              marginBottom: theme.spacing.sm,
              textAlign: "center",
            }}
          >
            Check-In
          </Text>
          <Text
            style={{
              color: theme.colors.textMuted,
              textAlign: "center",
              marginBottom: theme.spacing.lg,
            }}
          >
            Verification flows (Magic + Manual) will be implemented in Phase 3
          </Text>

          {/* Phase 3 will include:
              - "Searching for check-in signal..." state
              - Magic check-in via Geo/BLE
              - Manual TOTP fallback
              - Offline queue handling
          */}

          <View
            style={{
              width: "100%",
              padding: theme.spacing.md,
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radius.md,
            }}
          >
            <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
              Phase 3 components:{"\n"}
              • Location-based verification{"\n"}
              • Visual TOTP input{"\n"}
              • Offline sync queue{"\n"}
              • Impact moment reveal
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
