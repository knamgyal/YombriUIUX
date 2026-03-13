// apps/mobile/src/theme/resolveTheme.ts
import { ColorSchemeName } from "react-native";
import {
  colors as tokenColors,
  progressTokens,
  glassTokens,
} from "@yombri/design-tokens";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = Exclude<ThemeMode, "system">;

type TokenGroups = "light" | "dark";
type Semantic = (typeof tokenColors)[TokenGroups];

export interface ThemeColorShape {
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

  // Phase 1 extensions (Option B)
  progressTrack: string;
  progressActive: string;

  backgroundGlass: string;
  backgroundOverlay: string;
  borderSubtle: string;
}

export interface ThemeShape {
  // Resolved mode (light/dark) — persisted mode lives in ThemeProvider as `mode`
  mode: ResolvedThemeMode;

  // What the OS reported (useful for debugging)
  systemScheme: NonNullable<ColorSchemeName>;

  colors: ThemeColorShape;
}

function resolveEffectiveMode(
  mode: ThemeMode,
  systemScheme: ColorSchemeName = "light"
): ResolvedThemeMode {
  const safeSystem: ResolvedThemeMode = systemScheme === "dark" ? "dark" : "light";
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  return safeSystem; // mode === "system"
}

function mapSemantic(semantic: Semantic, effectiveMode: ResolvedThemeMode): ThemeColorShape {
  const defaultOn = semantic.onBackground ?? semantic.text;

  return {
    background: semantic.background,
    surface: semantic.surface,
    surfaceVariant: semantic.surfaceVariant ?? semantic.surfaceMuted ?? semantic.surface,

    onBackground: semantic.onBackground ?? semantic.text,
    onSurface: semantic.onSurface ?? semantic.text,
    onSurfaceVariant:
      semantic.onSurfaceVariant ?? semantic.textMuted ?? (semantic.onSurface ?? semantic.text),

    primary: semantic.primary ?? semantic.accent,
    onPrimary: semantic.onPrimary ?? defaultOn,

    secondary: semantic.secondary ?? semantic.accent,
    onSecondary: semantic.onSecondary ?? defaultOn,

    tertiary: semantic.tertiary ?? semantic.primaryContainer ?? semantic.accent,
    onTertiary: semantic.onTertiary ?? semantic.onPrimaryContainer ?? defaultOn,

    error: semantic.danger,
    onError: semantic.onDanger ?? defaultOn,

    success: semantic.success,
    onSuccess: semantic.onSuccess ?? defaultOn,

    outline: semantic.outline, // optional remains optional

    // Phase 1: progress + glass extensions sourced from design-tokens
    progressTrack: progressTokens[effectiveMode].track,
    progressActive: progressTokens[effectiveMode].active,

    backgroundGlass: glassTokens[effectiveMode].backgroundOverlay,
    backgroundOverlay: glassTokens[effectiveMode].imageOverlay,
    borderSubtle: glassTokens[effectiveMode].border,
  };
}

export function resolveTheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName = "light"
): ThemeShape {
  const safeSystem: NonNullable<ColorSchemeName> = systemScheme ?? "light";
  const effectiveMode = resolveEffectiveMode(mode, safeSystem);

  const semantic = tokenColors[effectiveMode];

  return {
    mode: effectiveMode,
    systemScheme: safeSystem,
    colors: mapSemantic(semantic, effectiveMode),
  };
}

export function getDefaultMode(): ThemeMode {
  return "system";
}
