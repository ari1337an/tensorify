const { baseConfig } = require("./base.js");

const apiConfig = [
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
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "off", // APIs often need console logging
    },
    ignores: [
      "dist/",
      "build/",
      "coverage/",
      "**/*.config.js",
      "ecosystem.config.js",
    ],
  },
];

module.exports = { apiConfig };
