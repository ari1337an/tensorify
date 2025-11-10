# Tensorify Monorepo

A monorepo for Tensorify - a machine learning plugin platform. This repository uses **pnpm workspaces** and **Turborepo** for managing multiple packages and services.

## Monorepo Structure

### Packages (`packages/`)

Shared libraries and tools used across the project:

- **`cli/`** - Command-line interface for Tensorify (`@tensorify.io/cli`)
  - Build, test, and deploy machine learning plugins
  - Authentication and publishing tools

- **`sdk/`** - TypeScript SDK (`@tensorify.io/sdk`)
  - Core SDK for developing Tensorify plugins
  - Validation, frontend enforcement, and publishing tools

- **`plugin-engine/`** - Plugin execution engine (`@tensorify.io/plugin-engine`)
  - Runtime engine for executing Tensorify plugins
  - Handles plugin compilation and execution

- **`transpiler/`** - Code transpiler
  - Converts workflow definitions to executable code
  - Supports multiple target languages/formats

- **`contracts/`** - Shared API contracts
  - Type definitions and specifications shared between services

- **`shared/`** - Shared utilities
  - Common utilities and compatibility checks

- **`create-tensorify-plugin/`** - Plugin scaffolding tool
  - CLI tool for creating new Tensorify plugins from templates

- **`config/`** - Shared configuration packages
  - `eslint/` - ESLint configurations
  - `tailwind/` - Tailwind CSS configuration
  - `tsconfig/` - TypeScript configurations

### Services (`services/`)

Individual applications and microservices:

- **`api/`** - Backend API service (`@tensorify.io/backend-api`)
  - REST API for plugin metadata and code generation
  - Transpiler endpoints

- **`app.tensorify.io/`** - Main application (Next.js)
  - Primary web application for Tensorify

- **`auth.tensorify.io/`** - Authentication service (Next.js)
  - Sign-in and sign-up pages

- **`controls.tensorify.io/`** - Controls/admin service (Next.js)
  - Admin dashboard and controls

- **`plugins.tensorify.io/`** - Plugin marketplace (Next.js)
  - Plugin discovery and marketplace

- **`tensorify.io/`** - Marketing website (Next.js)
  - Public-facing marketing site

### Other Directories

- **`offline-plugins/`** - Local plugin storage for offline development
- **`scripts/`** - Build and utility scripts
- **`images/`** - Docker images and base configurations

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- pnpm 9.6.0 (specified in `packageManager` field)

### Installation

```bash
pnpm install
```

### Common Commands

- `pnpm build` - Build all packages and services
- `pnpm dev` - Start all services in development mode
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### Working with Individual Packages

Each package/service has its own scripts. Navigate to the package directory and run:

```bash
cd packages/cli
pnpm build
pnpm dev
```

## Technology Stack

- **Package Manager**: pnpm workspaces
- **Build System**: Turborepo
- **Language**: TypeScript
- **Frameworks**: Next.js (for services), Express (for API)
- **Testing**: Jest

## Workspace Configuration

The monorepo is configured via:
- `pnpm-workspace.yaml` - Defines workspace packages
- `turbo.json` - Turborepo task configuration
- `package.json` - Root package with shared scripts

