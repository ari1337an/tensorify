const { baseConfig } = require("./base.js");

const libraryConfig = [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      globals: {
        node: true,
        jest: true,
      },
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-var-requires": "off", // Needed for dynamic imports
    },
    ignores: ["dist/", "lib/", "build/", "coverage/", "**/*.d.ts"],
  },
];

module.exports = { libraryConfig };
