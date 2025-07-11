# Version Management Scripts

This directory contains scripts for managing versions across the Tensorify monorepo packages.

## Overview

The version management system handles three main packages:

- `packages/cli` - Tensorify CLI
- `packages/sdk` - Tensorify SDK
- `packages/create-tensorify-plugin` - Plugin creation tool

## Usage

### Using npm scripts (recommended)

```bash
# Show current versions
npm run versions

# Bump patch version (0.0.8 → 0.0.9)
npm run versions:patch

# Bump minor version (0.0.8 → 0.1.0)
npm run versions:minor

# Bump major version (0.0.8 → 1.0.0)
npm run versions:major

# Sync all packages to the same version (highest)
npm run versions:sync

# Build all packages
npm run versions:build

# Publish all packages (builds first)
npm run versions:publish

# Release: bump patch version and publish
npm run versions:release
```

### Using the shell script directly

```bash
# Show current versions
./scripts/version-management.sh show

# Bump versions
./scripts/version-management.sh patch
./scripts/version-management.sh minor
./scripts/version-management.sh major

# Sync versions
./scripts/version-management.sh sync

# Build and publish
./scripts/version-management.sh build
./scripts/version-management.sh publish

# Full release workflow
./scripts/version-management.sh release
```

### Legacy npm workspace commands

```bash
# Bump patch version using npm workspaces
npm run version:patch

# Bump minor version using npm workspaces
npm run version:minor

# Bump major version using npm workspaces
npm run version:major

# Publish all packages using npm workspaces
npm run publish:all
```

## Key Features

- **Version Synchronization**: Keeps all three packages at the same version
- **Fallback Support**: Works with or without the `semver` package
- **Colorized Output**: Easy to read terminal output
- **Error Handling**: Stops on errors to prevent inconsistent states
- **Build Integration**: Automatically builds before publishing
- **Flexible Commands**: Multiple ways to achieve the same result

## Workflow Examples

### Development Release

```bash
# Check current versions
npm run versions

# Bump patch version
npm run versions:patch

# Publish (builds automatically)
npm run versions:publish
```

### Quick Release

```bash
# Bump patch and publish in one command
npm run versions:release
```

### Version Sync

```bash
# If packages get out of sync, sync them to the highest version
npm run versions:sync
```

## Notes

- All commands maintain version consistency across packages
- The `sync` command uses the highest version among all packages
- Publishing automatically builds all packages first
- The script prevents publishing without building
- Git tags are not created automatically (use `--no-git-tag-version`)
