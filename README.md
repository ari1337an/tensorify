# Backend.Tensorify.io

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-%3E%3D8.0.0-red)](https://www.npmjs.com/)

> **Monorepo for Tensorify.io Backend Services and Tools**

This repository contains the backend infrastructure, services, and tooling for Tensorify.io - a platform for building, testing, and deploying machine learning plugins.

## 🏗️ Architecture Overview

```
backend.tensorify.io/
├── packages/                    # Reusable packages and libraries
│   ├── cli/                    # @tensorify.io/cli - Official CLI tool
│   ├── sdk/                    # TypeScript SDK for plugin development
│   ├── plugin-engine/          # Core plugin execution engine
│   ├── shared/                 # Shared utilities and types
│   ├── transpiler/             # Code transpilation services
│   └── create-tensorify-plugin/ # Plugin scaffolding tool
├── services/                   # Backend services
│   ├── api/                    # Main REST API service
│   └── plugin.tensorify.io/    # Plugin marketplace frontend
└── plugins/                    # Example and core plugins
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git**

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/tensorify/backend.tensorify.io.git
cd backend.tensorify.io

# Install all dependencies
npm install

# Build all packages
npm run build
```

## 🛠️ Development Workflow

### Working with the CLI Package

The CLI is one of the most important tools in this monorepo. Here are all the ways to work with it during development:

#### **Method 1: Using npm Scripts (Recommended)**

```bash
# Build and run CLI from root
npm run cli -- --version
npm run cli -- login --help
npm run cli -- login --dev

# Alternative command (same functionality)
npm run tensorify -- --version
npm run tensorify -- login --dev
```

#### **Method 2: Global Development Link**

```bash
# Create global symlink for development
npm link --workspace=packages/cli

# Now use tensorify command anywhere
tensorify --version
tensorify login --dev
tensorify login --help

# To unlink when done
npm unlink -g @tensorify.io/cli
```

#### **Method 3: Direct Workspace Commands**

```bash
# Build CLI using workspace
npm run build --workspace=packages/cli

# Run directly with node
node packages/cli/lib/bin/tensorify.js --version
node packages/cli/lib/bin/tensorify.js login --dev
```

#### **Method 4: Turbo Commands (Fast Builds)**

```bash
# Build CLI only (with caching)
npm run build:cli

# Development mode with watch
npm run dev:packages:cli

# Then run the built CLI
node packages/cli/lib/bin/tensorify.js --version
```

#### **Method 5: Direct npm Workspace Execution**

```bash
# Run any script from workspace directly
npm run start --workspace=packages/cli -- --version
npm run build --workspace=packages/cli
npm run dev --workspace=packages/cli  # Watch mode
```

### Package Development

#### Individual Package Development

```bash
# SDK Development
npm run dev:packages:sdk

# Plugin Engine Development
npm run dev:packages:plugin-engine

# Transpiler Development
npm run dev:packages:transpiler

# CLI Development
npm run dev:packages:cli

# Shared Package Development
npm run dev:packages:shared
```

#### Service Development

```bash
# API Service
npm run dev:services:api

# Plugin Marketplace
npm run dev:services:plugin.tensorify.io
```

## 📦 Package Reference

### Core Packages

| Package                                                   | Description             | Version | Build Status |
| --------------------------------------------------------- | ----------------------- | ------- | ------------ |
| [`@tensorify.io/cli`](./packages/cli)                     | Official CLI tool       | 0.0.1   | ✅           |
| [`@tensorify.io/sdk`](./packages/sdk)                     | TypeScript SDK          | -       | 🚧           |
| [`@tensorify.io/plugin-engine`](./packages/plugin-engine) | Plugin execution engine | -       | ✅           |
| [`@tensorify.io/shared`](./packages/shared)               | Shared utilities        | -       | ✅           |
| [`@tensorify.io/transpiler`](./packages/transpiler)       | Code transpilation      | -       | ✅           |

### Services

| Service                                              | Description   | Status | URL                     |
| ---------------------------------------------------- | ------------- | ------ | ----------------------- |
| [API](./services/api)                                | Main REST API | 🚧     | `http://localhost:8080` |
| [Plugin Marketplace](./services/plugin.tensorify.io) | Web interface | 🚧     | `http://localhost:3000` |

## 🔧 Available Scripts

### Global Scripts (Root Level)

```bash
# Build all packages and services
npm run build

# Run tests across all packages
npm run test

# CLI shortcuts
npm run cli -- [args]          # Build and run CLI
npm run tensorify -- [args]     # Alternative CLI command
npm run build:cli              # Build CLI only

# Package development
npm run dev:packages:cli
npm run dev:packages:sdk
npm run dev:packages:plugin-engine
npm run dev:packages:transpiler
npm run dev:packages:shared

# Service development
npm run dev:services:api
npm run dev:services:plugin.tensorify.io
```

### Package-Specific Scripts

```bash
# CLI Package (packages/cli)
npm run build --workspace=packages/cli
npm run dev --workspace=packages/cli      # Watch mode
npm run test --workspace=packages/cli
npm run start --workspace=packages/cli -- [args]

# Other packages follow similar patterns
npm run build --workspace=packages/[package-name]
npm run dev --workspace=packages/[package-name]
npm run test --workspace=packages/[package-name]
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# CLI tests only
npm run test --workspace=packages/cli

# Plugin engine tests
npm run test --workspace=packages/plugin-engine

# With coverage
npm test -- --coverage
```

### CLI Testing in Development

```bash
# Test CLI help
npm run cli -- --help
npm run cli -- login --help

# Test authentication flow (development)
npm run cli -- login --dev

# Test authentication flow (production)
npm run cli -- login

# Direct testing
node packages/cli/lib/bin/tensorify.js --version
```

## 🌍 Environment Configuration

### Development vs Production

The CLI and services support different environments:

#### CLI Environment Detection

```bash
# Development mode (automatic)
NODE_ENV=development npm run cli -- login

# Development mode (explicit flag)
npm run cli -- login --dev

# Production mode (default)
npm run cli -- login
```

#### Service Environment URLs

**Development:**

- Auth: `http://localhost:3000`
- API: `http://localhost:8080`
- Callback: `http://localhost:[dynamic-port]`

**Production:**

- Auth: `https://auth.tensorify.io`
- API: `https://backend.tensorify.io`
- Callback: `https://plugin.tensorify.io/cli/auth/callback`

### Environment Variables

Create a `.env` file in each service directory:

```bash
# services/api/.env
NODE_ENV=development
PORT=8080
CLERK_SECRET_KEY=your_clerk_secret_key

# services/plugin.tensorify.io/.env
NODE_ENV=development
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_public_key
```

## 🔄 Workflow Examples

### Developing a New CLI Command

```bash
# 1. Start development mode
npm run dev:packages:cli

# 2. Edit source files in packages/cli/src/commands/

# 3. Test your changes
npm run cli -- your-new-command --help

# 4. Run tests
npm run test --workspace=packages/cli
```

### Adding a New Package

```bash
# 1. Create package directory
mkdir packages/new-package

# 2. Initialize package
cd packages/new-package
npm init -y

# 3. Update root package.json workspaces
# Add "packages/new-package" to workspaces array

# 4. Install dependencies from root
cd ../..
npm install
```

### Working with Multiple Services

```bash
# Terminal 1: API Development
npm run dev:services:api

# Terminal 2: Frontend Development
npm run dev:services:plugin.tensorify.io

# Terminal 3: CLI Testing
npm run cli -- login --dev
```

## 🚢 Deployment

### Building for Production

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:cli
npm run build --workspace=packages/plugin-engine
```

### Publishing Packages

```bash
# CLI Package (when ready)
cd packages/cli
npm publish

# Other packages
cd packages/[package-name]
npm publish
```

## 🤝 Contributing

### Development Setup

1. **Fork the repository**
2. **Clone your fork:**

   ```bash
   git clone https://github.com/your-username/backend.tensorify.io.git
   cd backend.tensorify.io
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make your changes and test:**

   ```bash
   npm run build
   npm run test
   npm run cli -- --help  # Test CLI changes
   ```

6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

### Code Standards

- **TypeScript** for all new code
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **Conventional Commits** for commit messages

### CLI Development Guidelines

- Follow the existing command structure in `packages/cli/src/commands/`
- Add tests for new commands in `packages/cli/src/__tests__/`
- Update the CLI README for new features
- Test both development and production modes

## 🐛 Troubleshooting

### Common Issues

**CLI build fails:**

```bash
cd packages/cli
npm install
npm run build
```

**Workspace not found:**

```bash
# Re-install from root
rm -rf node_modules
npm install
```

**Permission issues with npm link:**

```bash
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

**TypeScript compilation errors:**

```bash
# Clean and rebuild
npm run clean --workspace=packages/cli
npm run build --workspace=packages/cli
```

### Getting Help

- 📖 [Documentation](https://docs.tensorify.io)
- 🐛 [Report Issues](https://github.com/tensorify/backend.tensorify.io/issues)
- 💬 [Discussions](https://github.com/tensorify/backend.tensorify.io/discussions)
- 📧 [Email Support](mailto:support@tensorify.io)

## 📄 License

MIT © [Tensorify.io](https://tensorify.io)

## 🏆 Contributors

Thanks to all the contributors who have helped build Tensorify.io!

---

**Happy coding! 🚀**
