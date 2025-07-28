const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const nextJsConfig = [
  // Global ignores for Prisma generated files - must be first
  {
    ignores: [
      "**/prisma/generated/**",
      "**/generated/client/**",
      "src/server/database/prisma/generated/**",
      "src/lib/prisma/generated/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
    ],
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
    rules: {
      "react/no-unescaped-entities": "error",
      "react-hooks/exhaustive-deps": "error",
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          caughtErrors: "all",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-console": "off",
    },
  }),
  // Disable reporting of unused eslint-disable directives globally
  {
    linterOptions: {
      // Allow developers to keep eslint-disable comments without triggering warnings
      reportUnusedDisableDirectives: "off",
    },
  },
];

module.exports = { nextJsConfig };
