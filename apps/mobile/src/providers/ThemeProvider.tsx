// apps/mobile/src/providers/ThemeProvider.tsx

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

import { resolveTheme, Theme, ThemeMode } from "@yombri/native-runtime";

const STORAGE_KEY = "@yombri:themeMode";

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) {
  const [mode, setMode_] = useState<ThemeMode | null>(null);
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? "light"
  );
  const [isReady, setIsReady] = useState(false);

  const setMode = useCallback(
    async (nextMode: ThemeMode) => {
      setMode_(nextMode);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, nextMode);
      } catch (err) {
        console.error("Failed to persist theme mode", err);
      }
    },
    []
  );

  // Load persisted mode once at mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw === "light" || raw === "dark" || raw === "system") {
          setMode_(raw);
        } else {
          setMode_("system"); // PRD default: calm, neutral = system
        }
      } catch (err) {
        console.error("Failed to read theme mode, falling back to system", err);
        setMode_("system");
      }
      setIsReady(true);
    })();
  }, []);

  // Subscribe to system appearance changes
  useEffect(() => {
    const listener = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
      setSystemScheme(colorScheme ?? "light");
    };
    const subscription = Appearance.addChangeListener(listener);
    return () => {
      subscription.remove();
    };
  }, []);

  // Compute resolved theme from mode + system
  const theme = useMemo(() => {
    if (!isReady || mode === null) {
      return resolveTheme("system", systemScheme);
    }
    return resolveTheme(mode, systemScheme);
  }, [isReady, mode, systemScheme]);

  // Gate render until storage load completes (avoid flash)
  if (!isReady) {
    return null;
  }

  const value: ThemeContextValue = {
    theme,
    mode: mode as ThemeMode,
    setMode,
    isReady,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
