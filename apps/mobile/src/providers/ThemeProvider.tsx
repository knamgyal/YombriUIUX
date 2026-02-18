// apps/mobile/src/providers/ThemeProvider.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useContext,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { resolveTheme } from "../theme/resolveTheme";
import { ThemeMode } from "../../types";

/**
 * ============================================================
 * 1️⃣ Define the Context VALUE shape
 * ============================================================
 */
type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  theme: ReturnType<typeof resolveTheme> | null;
  isReady: boolean;
};

/**
 * ============================================================
 * 2️⃣ Create the Context (MISSING PIECE)
 * This MUST exist at module scope.
 * ============================================================
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

/**
 * ============================================================
 * 3️⃣ ThemeProvider Component
 * ============================================================
 */
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? "light"
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? "light");
    });
    return () => sub.remove();
  }, []);

  const theme = useMemo(() => {
    try {
      return resolveTheme(mode, systemScheme);
    } catch (e) {
      console.error("resolveTheme failed:", e);
      return null;
    }
  }, [mode, systemScheme]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      theme,
      isReady: Boolean(theme),
    }),
    [mode, theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * ============================================================
 * 4️⃣ Safe Hook for Consuming Context
 * ============================================================
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
