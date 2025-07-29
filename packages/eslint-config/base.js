const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const baseConfig = [
  // Global ignores - must be first
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/prisma/generated/**",
      "**/generated/**",
    ],
  },
  js.configs.recommended,
  ...compat.extends("turbo"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-console": "off",
    },
  },
];

module.exports = { baseConfig };
