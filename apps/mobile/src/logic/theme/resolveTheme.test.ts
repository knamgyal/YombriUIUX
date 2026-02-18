import { resolveTheme, ThemeTokens } from './resolveTheme';

const light: ThemeTokens = {
  colors: {
    background: '#ffffff',
    text: '#111111',
    primary: '#00ff00',
    outline: '#dddddd',
  },
};

const dark: ThemeTokens = {
  colors: {
    background: '#000000',
    text: '#ffffff',
    primary: '#00ff00',
    outline: '#333333',
  },
};

describe('resolveTheme', () => {
  it('uses system scheme when themeMode=system', () => {
    const resLight = resolveTheme({
      themeMode: 'system',
      systemScheme: 'light',
      lightTokens: light,
      darkTokens: dark,
    });
    expect(resLight.colors.background).toBe('#ffffff');

    const resDark = resolveTheme({
      themeMode: 'system',
      systemScheme: 'dark',
      lightTokens: light,
      darkTokens: dark,
    });
    expect(resDark.colors.background).toBe('#000000');
  });

  it('respects manual override', () => {
    const res = resolveTheme({
      themeMode: 'dark',
      systemScheme: 'light',
      lightTokens: light,
      darkTokens: dark,
      overrides: { 
       colors: { 
       primary: '#ff00ff',
       background: dark.colors.background,  // reuse existing
       text: dark.colors.text,
       outline: dark.colors.outline,
      } 
     },

    });
    expect(res.colors.background).toBe('#000000');
    expect(res.colors.primary).toBe('#ff00ff');
  });

  it('preserves base tokens when no overrides', () => {
    const res = resolveTheme({
      themeMode: 'light',
      systemScheme: 'dark',
      lightTokens: light,
      darkTokens: dark,
    });
    expect(res.colors.outline).toBe('#dddddd');
  });

  it('throws if required tokens missing after merge', () => {
    const badDark: ThemeTokens = {
      colors: {
        background: '',
        text: '#fff',
        primary: '#0f0',
      },
    };
    expect(() =>
      resolveTheme({
        themeMode: 'dark',
        systemScheme: 'light',
        lightTokens: light,
        darkTokens: badDark,
      }),
    ).toThrow('Missing required color tokens');
  });
});
