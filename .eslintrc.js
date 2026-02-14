module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./apps/*/tsconfig.json"]
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  plugins: ["yombri", "@typescript-eslint"],
  rules: {
    "yombri/no-raw-pressable": "error",
    "@typescript-eslint/semi": ["error", "always"],
    "semi": ["error", "always"],
    "react/react-in-jsx-scope": "off"
  },
  overrides: [
    {
      files: ["apps/mobile/**/*.{ts,tsx}"],
      rules: {
        "yombri/no-raw-pressable": "error"
      }
    }
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};
