/* ============================================================
 * Radius Tokens
 * ============================================================ */

export type RadiusScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type RadiusTokens = RadiusScale & {
  // Fully rounded (chips, avatars, pills)
  full: number;

  // Alias for legacy usage
  pill: number;
};

/* ============================================================
 * Radius Values
 * ============================================================ */

export const radius: RadiusTokens = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,

  // Fully rounded
  full: 9999,

  // Backwards-compatible alias
  pill: 9999,
} as const;
