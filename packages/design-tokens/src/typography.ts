/* ============================================================
 * Text Style Token
 * ============================================================ */

export type FontWeight = "400" | "500" | "600" | "700";

export type TextStyleToken = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: FontWeight;
  letterSpacing?: number;
};

/* ============================================================
 * Typography Tokens
 * ============================================================ */

export type TypographyScale = {
  sm: TextStyleToken;
  md: TextStyleToken;
  lg?: TextStyleToken;
};

export type TypographyTokens = {
  body: TypographyScale & {
    small: TextStyleToken;
    medium: TextStyleToken;
    large: TextStyleToken;
  };
  label: {
    sm: TextStyleToken;
    md: TextStyleToken;
    large: TextStyleToken;
  };
  heading: TypographyScale & {
    h1: TextStyleToken;
    h2: TextStyleToken;
  };
};

/* ============================================================
 * Base Font
 * ============================================================ */

const baseFont = "system-ui";

/* ============================================================
 * Typography Values
 * ============================================================ */

export const typography: TypographyTokens = {
  /* ---------- Body ---------- */
  body: {
    sm: {
      fontFamily: baseFont,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "400",
    },
    md: {
      fontFamily: baseFont,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "400",
    },

    // Semantic aliases
    small: {
      fontFamily: baseFont,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "400",
    },
    medium: {
      fontFamily: baseFont,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "400",
    },
    large: {
      fontFamily: baseFont,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "400",
    },
  },

  /* ---------- Labels ---------- */
  label: {
    sm: {
      fontFamily: baseFont,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "500",
      letterSpacing: 0.2,
    },
    md: {
      fontFamily: baseFont,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    large: {
      fontFamily: baseFont,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
  },

  /* ---------- Headings ---------- */
  heading: {
    sm: {
      fontFamily: baseFont,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "600",
    },
    md: {
      fontFamily: baseFont,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "600",
    },
    lg: {
      fontFamily: baseFont,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "700",
    },

    // Semantic aliases
    h1: {
      fontFamily: baseFont,
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "700",
    },
    h2: {
      fontFamily: baseFont,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "600",
    },
  },
} as const;
