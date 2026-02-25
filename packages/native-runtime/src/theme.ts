// packages/native-runtime/src/theme.ts

import { ColorSchemeName } from "react-native";
import { progressTokens, glassTokens } from "@yombri/design-tokens";

import {
  colors,
  spacing,
  radius,
  typography,
  type SpacingTokens,
  type RadiusTokens,
  type TypographyTokens,
  type SemanticColors,
} from "@yombri/design-tokens";

/* ============================================================
 * Theme Mode
 * ============================================================ */

export type ThemeMode = "system" | "light" | "dark";

/* ============================================================
 * Runtime Theme Shape
 * ============================================================ */

export type Theme = {
  colors: SemanticColors & {
    neutral: typeof colors.neutral;
    brand: typeof colors.brand;

    // Phase 1 glass + progress extensions (token-driven)
    progressTrack: string;
    progressActive: string;
    backgroundGlass: string;
    backgroundOverlay: string;
    borderSubtle: string;
  };
  spacing: SpacingTokens;
  radius: RadiusTokens;
  typography: TypographyTokens;
  mode: Exclude<ThemeMode, "system">;
};

/* ============================================================
 * Theme Resolver (Phase 1)
 * ============================================================ */

export function resolveTheme(
  themeMode: ThemeMode,
  systemScheme: ColorSchemeName | null | undefined
): Theme {
  const effectiveMode =
    themeMode === "system"
      ? ((systemScheme ?? "light") as Exclude<ThemeMode, "system">)
      : themeMode;

  // Phase 1: switch between light/dark semantic colors
  const semanticColors = effectiveMode === "dark" ? colors.dark : colors.light;

  return {
    colors: {
      ...semanticColors,
      neutral: colors.neutral,
      brand: colors.brand,

      // New semantic slots used by glass surfaces & progress ring
      progressTrack: progressTokens[effectiveMode].track,
      progressActive: progressTokens[effectiveMode].active,
      backgroundGlass: glassTokens[effectiveMode].backgroundOverlay,
      backgroundOverlay: glassTokens[effectiveMode].imageOverlay,
      borderSubtle: glassTokens[effectiveMode].border,
    },
    spacing,
    radius,
    typography,
    mode: effectiveMode,
  };
}
