// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const nodeGlobals = {
  module: "readonly",
  require: "readonly",
  __dirname: "readonly",
  process: "readonly",
  console: "readonly",
  global: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
};

export default tseslint.config(
  // 0) Ignore generated + non-critical folders
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.expo/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/build/**",
      "**/.eslintcache",
      "**/.env*",
      "**/*.bak.*",
      "supabase/tests/**",
      "packages/eslint-plugin-yombri/**",
          "**/.expo-export-*/**",
      "**/_expo/static/**",

    // Optional: other generated JS artifacts
      "**/*.jsbundle",
        "**/*.bundle",
      "**/*.min.js",
    "**/*.map",
    ],
  },

  // 1) Base configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 2) React + baseline rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: { react: { version: "detect" } },
    rules: {
      semi: "off",

      // Avoid double-reporting; use TS rule instead
      "no-unused-vars": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      "react/react-in-jsx-scope": "off",

      // Only the two classic hook rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Disable React compiler-related rules to avoid repo-wide explosions
      "react-hooks/immutability": "off",
      "react-hooks/globals": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/static-components": "off",
      "react-hooks/unsupported-syntax": "off",
      "react-hooks/use-memo": "off",
    },
  },

  // 3) Node/CJS/MJS/tooling files
  {
    files: [
      "**/*.cjs",
      "**/*.mjs",
      "**/*.config.js",
      "**/*.config.cjs",
      "**/metro.config.js",
      "**/metro.config.cjs",
      "**/tailwind.config.js",
      "**/babel.config.js",
      "**/jest.config.cjs",
      "apps/mobile/index.js",
      "apps/mobile/metro.config.js",
      "apps/mobile/metro.config.cjs",
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // 4) Tests: relax further
  {
    files: ["**/*.test.{ts,tsx,js,jsx}", "**/__tests__/**/*.{ts,tsx,js,jsx,cjs,mjs}"],
    languageOptions: { globals: nodeGlobals },
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  // 5) apps/mobile enforcement (feature code)
  {
    files: ["apps/mobile/**/*.{ts,tsx}"],
    rules: {
      // Error: no raw pressables imported in feature code. [web:160]
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["Pressable", "TouchableOpacity", "TouchableHighlight"],
              message:
                "Do not import Pressable/Touchable* in apps/mobile feature code. Use apps/mobile/src/components/primitives/*.",
            },
          ],
        },
      ],

      // Warn: migrate off native-runtime value imports; allow type-only. [web:173]
      "@typescript-eslint/no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "@yombri/native-runtime",
              allowTypeImports: true,
              message:
                "Migrate to app primitives: apps/mobile/src/components/primitives/* (type-only imports allowed).",
            },
          ],
        },
      ],

      // Prevent bypass: import * as RN from "react-native"
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value='react-native'] ImportNamespaceSpecifier",
          message:
            "Do not namespace-import react-native in apps/mobile; it can bypass Pressable restrictions.",
        },
      ],
    },
  },

  // 6) apps/mobile primitives implementation layer
  {
    files: ["apps/mobile/src/components/primitives/**/*.{ts,tsx}"],
    rules: {
      // Allow Pressable import inside primitives (this is the point of the folder). [web:160]
      "no-restricted-imports": "off",
      "no-restricted-syntax": "off",

      // But keep native-runtime banned inside app primitives (hard error)
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@yombri/native-runtime",
              message:
                "Do not import from @yombri/native-runtime inside app primitives. These wrappers must stay theme-aware and app-owned.",
            },
          ],
        },
      ],

      "@typescript-eslint/no-explicit-any": "off",
    },
  }
);
