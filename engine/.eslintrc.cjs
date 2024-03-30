/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-floating-promises": ["off"],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};

module.exports = config;
