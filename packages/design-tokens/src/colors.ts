// packages/design-tokens/src/colors.ts

/* ============================================================
 * Color Scales
 * ============================================================ */

export type ColorScale = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
};

/* ============================================================
 * Semantic / UI Colors
 * ============================================================ */

export type SemanticColors = {
  // Core surfaces
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceVariant?: string;

  // Text
  text: string;
  textMuted: string;
  onBackground?: string;
  onSurface?: string;
  onSurfaceVariant?: string;

  // Brand accents
  accent: string;
  accentSoft: string;
  primary?: string;
  onPrimary?: string;
  primaryContainer?: string;
  onPrimaryContainer?: string;

  // States
  danger: string;
  success: string;
  warning: string;

  // Borders / outlines
  outline?: string;
  outlineVariant?: string;
};

/* ============================================================
 * Theme Shape
 * ============================================================ */

export type ThemeColors = {
  neutral: ColorScale;
  brand: ColorScale;
  
  // Phase 1: separate light/dark semantic colors
  light: SemanticColors;
  dark: SemanticColors;

  // Optional raw tokens (gradients, etc.)
  tokens?: {
    primaryGradient?: readonly [string, string];
  };
};

/* ============================================================
 * Colors
 * ============================================================ */

export const colors: ThemeColors = {
  /* ---------- Neutral Scale ---------- */
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2933",
    900: "#111827",
  },

  /* ---------- Brand Scale ---------- */
  brand: {
    50: "#EEF5FF",
    100: "#D4E4FF",
    200: "#AFCBFF",
    300: "#7FA9FF",
    400: "#4F84FF",
    500: "#2F63F7",
    600: "#214BD4",
    700: "#1938A8",
    800: "#142A80",
    900: "#0E1D59",
  },

  /* ---------- Light Theme Semantics ---------- */
  light: {
    // Surfaces
    background: "#FFFFFF",
    surface: "#F8F9FA",
    surfaceMuted: "#F1F3F4",
    surfaceVariant: "#F1F3F4",

    // Text
    text: "#1C1E21",
    textMuted: "#4E5666",
    onBackground: "#1C1E21",
    onSurface: "#1C1E21",
    onSurfaceVariant: "#4E5666",

    // Brand
    accent: "#6366F1",
    accentSoft: "rgba(99,102,241,0.15)",
    primary: "#6366F1",
    onPrimary: "#FFFFFF",
    primaryContainer: "#E8E8FF",
    onPrimaryContainer: "#1E1B4B",

    // States
    danger: "#F44336",
    success: "#4CAF50",
    warning: "#FF9800",

    // Outlines
    outline: "#E0E3E7",
    outlineVariant: "#DADDE0",
  },

  /* ---------- Dark Theme Semantics ---------- */
  dark: {
    // Surfaces (inverted)
    background: "#0F1419",
    surface: "#1A1F27",
    surfaceMuted: "#242B35",
    surfaceVariant: "#2A313C",

    // Text (inverted)
    text: "#E8EAED",
    textMuted: "#9CA3AF",
    onBackground: "#E8EAED",
    onSurface: "#E8EAED",
    onSurfaceVariant: "#9CA3AF",

    // Brand (slightly adjusted for dark backgrounds)
    accent: "#818CF8",
    accentSoft: "rgba(129,140,248,0.15)",
    primary: "#818CF8",
    onPrimary: "#0F1419",
    primaryContainer: "#3730A3",
    onPrimaryContainer: "#C7D2FE",

    // States (slightly muted for dark)
    danger: "#EF5350",
    success: "#66BB6A",
    warning: "#FFA726",

    // Outlines (lighter for dark surfaces)
    outline: "#3A4351",
    outlineVariant: "#2E3643",
  },

  /* ---------- Non-semantic Tokens ---------- */
  tokens: {
    primaryGradient: ["#6366F1", "#8B5CF6"],
  },
} as const;

/* ============================================================
 * Type Exports
 * ============================================================ */

export type ColorTokens = SemanticColors & {
  neutral: ColorScale;
  brand: ColorScale;
};
