// packages/design-tokens/src/uiExtensions.ts
// Static UI extension tokens for glass layout, radial progress, and elevation.
// No runtime logic. All exports are const.

export const progressTokens = {
  light: {
    track: 'rgba(108,99,255,0.12)',
    active: '#6C63FF',
  },
  dark: {
    track: 'rgba(108,99,255,0.22)',
    active: '#8B82FF',
  },
} as const;

export const glassTokens = {
  light: {
    backgroundOverlay: 'rgba(255,255,255,0.18)',
    imageOverlay:      'rgba(240,238,255,0.42)',
    border:            'rgba(255,255,255,0.55)',
  },
  dark: {
    backgroundOverlay: 'rgba(28,22,56,0.58)',
    imageOverlay:      'rgba(12,9,28,0.64)',
    border:            'rgba(255,255,255,0.12)',
  },
} as const;

export const elevationTokens = {
  glass: {
    shadowColor:   '#000000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius:  24,
    elevation:     8,
  },
  fab: {
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
    elevation:     10,
  },
} as const;

// Extend radius with pill value
export const radiusExtensions = {
  full: 999,
} as const;
