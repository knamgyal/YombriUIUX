export type ThemeMode = 'system' | 'light' | 'dark';

export interface TokenColors {
  background: string;
  text: string;
  primary: string;
  outline?: string;
}

export interface ThemeTokens {
  colors: TokenColors;
}

export interface ResolveThemeParams {
  themeMode: ThemeMode;
  systemScheme: 'light' | 'dark';
  lightTokens: ThemeTokens;
  darkTokens: ThemeTokens;
  overrides?: Partial<ThemeTokens>;
}

export function resolveTheme({
  themeMode,
  systemScheme,
  lightTokens,
  darkTokens,
  overrides,
}: ResolveThemeParams): ThemeTokens {
  const base =
    themeMode === 'system'
      ? systemScheme === 'dark'
        ? darkTokens
        : lightTokens
      : themeMode === 'dark'
      ? darkTokens
      : lightTokens;

  const merged: ThemeTokens = {
    colors: {
      ...base.colors,
      ...(overrides?.colors ?? {}),
    },
  };

  if (!merged.colors.background || !merged.colors.text || !merged.colors.primary) {
    throw new Error('Missing required color tokens');
  }

  return merged;
}
