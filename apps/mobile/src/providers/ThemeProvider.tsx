import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { resolveTheme } from "../theme/resolveTheme";
import { ThemeMode } from "../../types"; // Adjust path if needed

interface ThemeContextValue {
  mode: ThemeMode | null;
  setMode: (mode: ThemeMode) => void;
  theme: ReturnType<typeof resolveTheme> | null;
  isReady: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode_] = useState<ThemeMode | null>(null);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? "light"
  );
  const [isReady, setIsReady] = useState(false);

  const setMode = (newMode: ThemeMode) => {
    setMode_(newMode);
  };

  useEffect(() => {
    const theme = mode ? resolveTheme(mode, systemScheme) : null;
    setIsReady(Boolean(theme));
  }, [mode, systemScheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? "light");
    });
    return () => subscription.remove();
  }, []);

  const value: ThemeContextValue = {
    mode,
    setMode,
    theme: mode ? resolveTheme(mode, systemScheme) : null,
    isReady,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
