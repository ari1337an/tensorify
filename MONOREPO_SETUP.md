# Monorepo Setup Guide

## The Problem We Solved

Previously, the monorepo had inconsistent ESLint configurations across packages, leading to:

- Different TypeScript/ESLint versions causing "context.getScope is not a function" errors
- Build failures in production (Coolify) that didn't occur locally
- Dependency resolution conflicts when installing packages individually vs at root
- Maintenance overhead with duplicated ESLint configurations

## Solution: Centralized ESLint Configuration

We've implemented [Turborepo's recommended approach](https://turborepo.com/docs/guides/tools/eslint) using:

- Shared `@repo/eslint-config` package with all ESLint dependencies
- ESLint v9 flat configuration format
- Consistent tooling versions across all packages

## Installation Instructions

### Initial Setup (Clean Install)

```bash
# 1. Clean any existing node_modules and lock files
rm -rf node_modules package-lock.json
find . -name "node_modules" -type d -prune -exec rm -rf {} +
find . -name "package-lock.json" -delete

# 2. Install dependencies from root only
npm install

# 3. Build all packages
pnpm run build
```

### Development Workflow

**✅ CORRECT WAY:**

```bash
# Always install from root
npm install

# Add new dependencies to specific packages
npm install --workspace=services/app.tensorify.io some-package
npm install --workspace=packages/plugin-engine some-dev-package --save-dev
```

**❌ WRONG WAY (causes dependency conflicts):**

```bash
# Don't cd into individual packages and run npm install
cd services/app.tensorify.io
npm install  # This breaks dependency resolution!
```

### Adding New Packages/Services

When creating new packages, use the appropriate ESLint configuration:

#### For Next.js Services:

```json
// package.json
{
  "devDependencies": {
    "@repo/eslint-config": "*"
  }
}
```

```js
// eslint.config.mjs
import { nextJsConfig } from "@repo/eslint-config/nextjs";

export default nextJsConfig;
```

#### For Node.js Libraries:

```json
// package.json
{
  "devDependencies": {
    "@repo/eslint-config": "*"
  }
}
```

```js
// eslint.config.js
import { libraryConfig } from "@repo/eslint-config/library";

export default libraryConfig;
```

#### For API Services:

```js
// eslint.config.js
import { apiConfig } from "@repo/eslint-config/api";

export default apiConfig;
```

## Production Builds (Coolify)

The production builds now work consistently because:

1. All packages use the same ESLint version from `@repo/eslint-config`
2. No more version conflicts between workspace dependencies
3. ESLint rules are consistent across all environments

### Build Process:

```bash
# This will work consistently in any environment
npm install --legacy-peer-deps
pnpm run build
```

## Troubleshooting

### If you see "context.getScope is not a function":

1. Delete all `node_modules` and `package-lock.json` files
2. Run `npm install` from root only
3. Restart your editor/IDE

### If builds fail with ESLint errors:

1. Check that the package uses `@repo/eslint-config`
2. Verify the correct config is imported (nextjs/library/api)
3. Run `pnpm run lint` to see specific errors

### If dependency resolution fails:

1. Never run `npm install` inside individual packages
2. Always use workspace commands from root
3. Clean install if switching between installation methods

## Developer Experience Improvements

### Consistent Linting:

```bash
# Lint all packages
pnpm run lint

# Lint specific workspace
turbo run lint --filter=services/app.tensorify.io
```

### IDE Integration:

- All packages now use the same ESLint version
- No more conflicting rule configurations
- Consistent formatting across the monorepo

## Key Benefits

1. **Consistency**: Same ESLint rules everywhere
2. **Performance**: Shared dependencies, faster installs
3. **Maintainability**: Single source of truth for linting rules
4. **Reliability**: No more environment-specific build failures
5. **Developer Experience**: Consistent tooling across all packages
