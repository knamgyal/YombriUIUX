/* ============================================================
 * Spacing Tokens
 * ============================================================ */

export type SpacingScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type ScreenSpacing = {
  xs: number;
  sm: number;
  md: number;
};

export type SpacingTokens = {
  // Accessibility
  touch: number;

  // Base unit
  grid: number;

  // General spacing scale
  gap: SpacingScale;

  // Screen / layout padding
  screen: ScreenSpacing;
};

/* ============================================================
 * Spacing Values
 * ============================================================ */

export const spacing: SpacingTokens = {
  // PRD minimum touch target
  touch: 44,

  // Base grid unit
  grid: 4,

  // Component spacing
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },

  // Screen padding
  screen: {
    xs: 20,
    sm: 32,
    md: 44,
  },
} as const;
