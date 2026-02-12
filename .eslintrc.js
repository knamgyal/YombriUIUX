module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended"],
  rules: {
    "yombri/no-raw-pressable": "error"
  },
  plugins: ["yombri"],
  overrides: [
    {
      files: ["apps/mobile/**/*.{ts,tsx}"],
      rules: {
        "yombri/no-raw-pressable": "error"
      }
    }
  ]
};
