// apps/mobile/src/theme/resolveTheme.ts
import { colors as tokenColors } from "@yombri/design-tokens";
import { ColorSchemeName } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

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
}

export interface ThemeShape {
  mode: ThemeMode;
  systemScheme: NonNullable<ColorSchemeName>;
  colors: ThemeColorShape;
}

function mapSemantic(group: TokenGroups, s: Semantic): ThemeColorShape {
  const onDarkBg = "#0F1419";
  const onLightBg = "#FFFFFF";
  const defaultOn = s.onBackground ?? s.text;

  return {
    background: s.background,
    surface: s.surface,
    surfaceVariant: s.surfaceVariant ?? s.surfaceMuted ?? s.surface,

    onBackground: s.onBackground ?? s.text,
    onSurface: s.onSurface ?? s.text,
    onSurfaceVariant: s.onSurfaceVariant ?? s.textMuted,

    primary: s.primary ?? s.accent,
    onPrimary: s.onPrimary ?? defaultOn,

    secondary: s.accent,
    onSecondary: defaultOn,

    tertiary: s.primaryContainer ?? s.accent,
    onTertiary: s.onPrimaryContainer ?? defaultOn,

    error: s.danger,
    onError: group === "dark" ? onDarkBg : onLightBg,

    success: s.success,
    onSuccess: group === "dark" ? onDarkBg : onLightBg,

    outline: s.outline, // optional stays optional
  };
}

export function resolveTheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName = "light"
): ThemeShape {
  const safely: NonNullable<ColorSchemeName> = systemScheme ?? "light";
  let group: TokenGroups = safely === "dark" ? "dark" : "light";
  if (mode === "light") group = "light";
  if (mode === "dark") group = "dark";

  return {
    mode,
    systemScheme: safely,
    colors: mapSemantic(group, tokenColors[group]),
  };
}

export function getDefaultMode(): ThemeMode {
  return "system";
}
