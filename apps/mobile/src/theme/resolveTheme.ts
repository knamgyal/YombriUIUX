// apps/mobile/src/theme/resolveTheme.ts

import { Theme as DesignTokens } from "@yombri/design-tokens";
import { Appearance, ColorSchemeName } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColorShape {
  // Known keys for our design tokens (PRD‑aligned).
  // If tokens evolve, update here or import a public interface instead.
  background: string;
  surface: string;
  surfaceVariant: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  primary: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;
  tertiary: string;
  onTertiary: string;
  error: string;
  onError: string;
  success: string;
  onSuccess: string;
  // Optional
  outline?: string; // aligns with PRD: `colors.outline` is optional.
  // Any app‑level semantic colors can go here too (e.g., border, shadow, etc.)
}

export interface ThemeShape {
  mode: ThemeMode;
  systemScheme: NonNullable<ColorSchemeName>;
  colors: ThemeColorShape;
}

type TokenGroups = "light" | "dark";

/**
 * Shape our design‑token export conforms to.
 * If @yombri/design-tokens exports a different type,
 * wire that instead and narrow to what the app needs.
 */
interface DesignTheme {
  color: {
    [K in TokenGroups]: {
      background: string;
      surface: string;
      surfaceVariant: string;
      onBackground: string;
      onSurface: string;
      onSurfaceVariant: string;
      primary: string;
      onPrimary: string;
      secondary: string;
      onSecondary: string;
      tertiary: string;
      onTertiary: string;
      error: string;
      onError: string;
      success: string;
      onSuccess: string;
      outline?: string;
    };
  };
}

function resolveThemeKeys(tokens: DesignTheme["color"][TokenGroups]): ThemeColorShape {
  return {
    background: tokens.background,
    surface: tokens.surface,
    surfaceVariant: tokens.surfaceVariant,
    onBackground: tokens.onBackground,
    onSurface: tokens.onSurface,
    onSurfaceVariant: tokens.onSurfaceVariant,
    primary: tokens.primary,
    onPrimary: tokens.onPrimary,
    secondary: tokens.secondary,
    onSecondary: tokens.onSecondary,
    tertiary: tokens.tertiary,
    onTertiary: tokens.onTertiary,
    error: tokens.error,
    onError: tokens.onError,
    success: tokens.success,
    onSuccess: tokens.onSuccess,
    outline: tokens.outline ?? "transparent", // ✅ PRD: optional → fallback
  };
}

/**
 * Resolve runtime theme from mode and system scheme.
 */
export function resolveTheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName = "light"
): ThemeShape {
  // Fallback to light instead of hoisting undefined.
  const safely: NonNullable<ColorSchemeName> = systemScheme ?? "light";

  const { color }: DesignTheme = DesignTokens;

  // First pick which token group to use based on mode + system.
  let group: TokenGroups = safely === "dark" ? "dark" : "light";
  if (mode === "light") group = "light";
  if (mode === "dark") group = "dark";

  // Ensure every required color key exists (trust‑first UX).
  if (!color[group]) {
    // In practice you should not hit this if token package is correct.
    // Here we fail‑safe to light with minimal style risk rather than blank.
    group = "light";
  }

  return {
    mode,
    systemScheme: safely,
    colors: resolveThemeKeys(color[group]),
  };
}

export function getDefaultMode(): ThemeMode {
  return "system"; // aligned with calm, neutral default.
}
