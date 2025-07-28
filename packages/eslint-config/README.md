# @repo/eslint-config

Shared ESLint configuration for the Tensorify monorepo using ESLint v9 flat configs.

## Usage

### For Next.js Projects

```js
// eslint.config.mjs
import { nextJsConfig } from "@repo/eslint-config/nextjs";

/** @type {import("eslint").Linter.Config} */
export default nextJsConfig;
```

### For Node.js Libraries/Packages

```js
// eslint.config.js
import { libraryConfig } from "@repo/eslint-config/library";

/** @type {import("eslint").Linter.Config} */
export default libraryConfig;
```

### For API Services

```js
// eslint.config.js
import { apiConfig } from "@repo/eslint-config/api";

/** @type {import("eslint").Linter.Config} */
export default apiConfig;
```

### For Custom Configuration

```js
// eslint.config.js
import { baseConfig } from "@repo/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...baseConfig,
  {
    // Your custom rules here
    rules: {
      // Custom overrides
    },
  },
];
```

## What's Included

### Base Configuration

- TypeScript ESLint rules
- Common code quality rules
- Consistent ignore patterns

### Next.js Configuration

- All base rules
- Next.js specific rules
- React hooks rules
- React-specific linting

### Library Configuration

- Base rules optimized for Node.js libraries
- Jest environment support
- Library-specific ignores

### API Configuration

- Base rules optimized for API services
- Node.js and Jest environments
- API-specific rule adjustments

## Installation

This package is automatically installed when you run `npm install` at the monorepo root.

Each package that uses ESLint should include this as a workspace dependency:

```json
{
  "devDependencies": {
    "@repo/eslint-config": "*"
  }
}
```
