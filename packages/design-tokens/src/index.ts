// packages/design-tokens/src/index.ts
export * from "./colors";
export * from "./spacing";
export * from "./radius";
export * from "./typography";

// ✅ Default export for resolveTheme
export const Theme = {
  color: {
    light: {
      // Your actual tokens here - placeholder for now
      background: "#ffffff",
      surface: "#f8f9fa",
      // ...fill from your actual tokens
    },
    dark: {
      background: "#121212",
      surface: "#1e1e1e",
      // ...
    },
  },
} as const;
