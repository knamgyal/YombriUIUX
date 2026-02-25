// apps/mobile/src/providers/ThemeProvider.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useContext,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from "react-native";

import { resolveTheme, ThemeMode } from "../theme/resolveTheme";

const STORAGE_KEY = "@yombri:themeMode";

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  theme: ReturnType<typeof resolveTheme>;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isThemeMode(v: string | null): v is ThemeMode {
  return v === "system" || v === "light" || v === "dark";
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? "light"
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydrate persisted mode (prevents theme flash + ensures persistence tests pass)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (isThemeMode(raw)) {
          setModeState(raw);
        }
      } catch (e) {
        console.error("Theme mode hydration failed:", e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  // Listen for OS theme changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? "light");
    });
    return () => sub.remove();
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextMode);
    } catch (e) {
      console.error("Theme mode persistence failed:", e);
    }
  }, []);

  const theme = useMemo(() => resolveTheme(mode, systemScheme), [mode, systemScheme]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      theme,
      isReady: isHydrated,
    }),
    [mode, setMode, theme, isHydrated]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
