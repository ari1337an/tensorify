# @tensorify.io/cli

> **Official CLI for Tensorify.io - Build, test, and deploy machine learning plugins**

The Tensorify CLI provides powerful tools for developing, validating, and publishing machine learning plugins to the Tensorify ecosystem.

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g @tensorify.io/cli

# Or install locally in your project
npm install --save-dev @tensorify.io/cli
```

### Authentication

```bash
# Login to your Tensorify account
tensorify login

# Check your authentication status
tensorify whoami

# Logout when needed
tensorify logout
```

### Basic Usage

```bash
# Validate your plugin structure
tensorify validate

# Publish your plugin
tensorify publish --access=public
```

## 📋 Commands

### `tensorify login`

Authenticate with Tensorify.io using OAuth2 flow.

```bash
tensorify login [options]
```

**Features:**

- 🔐 Secure OAuth2 authentication
- 🌐 Opens browser for login
- 💾 Stores token securely in system keyring
- ✅ Automatic token validation

**Options:**

- `--port <number>` - Custom port for OAuth callback (default: 3000)
- `--timeout <seconds>` - Authentication timeout (default: 300)

**Examples:**

```bash
# Standard login
tensorify login

# Login with custom port
tensorify login --port 8080

# Login with timeout
tensorify login --timeout 600
```

### `tensorify whoami`

Display current authentication status and user information.

```bash
tensorify whoami [options]
```

**Features:**

- 👤 Shows logged-in user details
- 🔑 Displays token status
- ⏰ Shows token expiration
- 📊 User account information

**Options:**

- `--json` - Output in JSON format
- `--token` - Show token details

**Examples:**

```bash
# Basic user info
tensorify whoami

# JSON output
tensorify whoami --json

# Include token details
tensorify whoami --token
```

### `tensorify logout`

Clear authentication tokens and logout.

```bash
tensorify logout [options]
```

**Features:**

- 🗑️ Removes stored tokens
- 🔒 Secure cleanup
- ✅ Confirmation prompts

**Options:**

- `--force` - Skip confirmation prompt

**Examples:**

```bash
# Standard logout
tensorify logout

# Force logout without confirmation
tensorify logout --force
```

### `tensorify validate`

Validate plugin structure and configuration using SDK rules.

```bash
tensorify validate [directory] [options]
```

**Features:**

- 🔍 Complete plugin validation
- 📁 File structure checks
- 📝 Schema validation
- 🏗️ Class interface validation
- 📊 Detailed error reporting

**Arguments:**

- `directory` - Plugin directory path (default: current directory)

**Options:**

- `--verbose` - Show detailed validation output
- `--sdk-version <version>` - Check against specific SDK version
- `--json` - Output results in JSON format
- `--fix` - Attempt to fix common issues

**Validation Checks:**

- ✅ Required files exist (`index.ts`, `manifest.json`, `icon.svg`, `package.json`)
- ✅ `manifest.json` schema validation
- ✅ `package.json` structure validation
- ✅ Class implements `INode` interface
- ✅ Class name matches manifest `entrypointClassName`
- ✅ SDK version compatibility
- ✅ Repository URL for public plugins

**Examples:**

```bash
# Validate current directory
tensorify validate

# Validate specific directory
tensorify validate ./my-plugin

# Verbose validation output
tensorify validate --verbose

# JSON output for CI/CD
tensorify validate --json

# Check against specific SDK version
tensorify validate --sdk-version 0.0.1
```

### `tensorify publish`

Publish plugin to Tensorify registry with comprehensive validation and upload.

```bash
tensorify publish [options]
```

**Features:**

- 🔍 Pre-publish validation
- 🏗️ Automatic build and bundling
- ✅ Version conflict checking
- 📤 Secure file uploads
- 🔔 Registry notifications
- 🚀 Complete publishing pipeline

**Options:**

- `--access <level>` - Access level: `public` or `private` (default: `public`)
- `--directory <path>` - Plugin directory (default: current directory)
- `--backend <url>` - Backend API URL (default: `https://backend.tensorify.io`)
- `--frontend <url>` - Frontend API URL (default: `https://plugins.tensorify.io`)
- `--dry-run` - Validate and build without publishing
- `--skip-build` - Skip build step (use existing dist/)
- `--force` - Force publish (skip confirmations)

**Publishing Process:**

1. **🔐 Authentication Check**
   - Verifies valid login token
   - Checks token expiration

2. **🔍 Plugin Validation**
   - Runs complete SDK validation
   - Checks file structure
   - Validates schemas

3. **🔒 Access Level Validation**
   - Ensures `package.json` `private` flag matches `--access`
   - Validates repository URL for public plugins
   - Checks access consistency with previous versions

4. **✅ Version Conflict Check**
   - Queries registry for existing versions
   - Prevents duplicate version publishing
   - Validates access level consistency

5. **🏗️ Build and Bundle**
   - Runs TypeScript compilation (`pnpm run build`)
   - Creates optimized bundle with ESBuild
   - Generates production-ready artifacts

6. **📤 File Upload**
   - Uploads `bundle.js`, `manifest.json`, `icon.svg`
   - Uses secure multipart upload
   - Provides upload progress

7. **🔔 Registry Notification**
   - Sends webhook to registry
   - Updates plugin database
   - Triggers indexing

**Examples:**

```bash
# Publish public plugin
tensorify publish --access=public

# Publish private plugin
tensorify publish --access=private

# Dry run (validate without publishing)
tensorify publish --dry-run

# Publish from specific directory
tensorify publish --directory ./my-plugin

# Force publish without confirmations
tensorify publish --force

# Custom backend/frontend URLs
tensorify publish --backend https://api.custom.com --frontend https://registry.custom.com
```

## 🔧 Configuration

### Environment Variables

```bash
# Backend API URL
export TENSORIFY_BACKEND_URL=https://backend.tensorify.io

# Frontend registry URL
export TENSORIFY_FRONTEND_URL=https://plugins.tensorify.io

# OAuth configuration
export TENSORIFY_CLIENT_ID=your_client_id
export TENSORIFY_CLIENT_SECRET=your_client_secret

# CLI configuration
export TENSORIFY_DEFAULT_ACCESS=public
export TENSORIFY_CLI_LOG_LEVEL=info
```

### Configuration File

Create `.tensorifyrc.json` in your project or home directory:

```json
{
  "backend": "https://backend.tensorify.io",
  "frontend": "https://plugins.tensorify.io",
  "defaultAccess": "public",
  "autoValidate": true,
  "buildTimeout": 300,
  "uploadTimeout": 600
}
```

## 🔐 Authentication

### OAuth2 Flow

The CLI uses secure OAuth2 authentication:

1. **Login Command**: Opens browser to Tensorify.io
2. **User Authorization**: User grants CLI access
3. **Token Exchange**: CLI receives secure access token
4. **Token Storage**: Token stored in system keyring
5. **Automatic Refresh**: Tokens refreshed as needed

### Token Storage

Tokens are securely stored using:

- **macOS**: Keychain
- **Windows**: Credential Manager
- **Linux**: Secret Service (libsecret)

### Token Security

- 🔒 Tokens encrypted at rest
- ⏰ Automatic expiration
- 🔄 Refresh token rotation
- 🚫 No tokens in environment variables

## 📦 Plugin Requirements

### Required Files

```
my-plugin/
├── package.json      # NPM package configuration
├── manifest.json     # Plugin metadata
├── icon.svg         # Plugin icon (SVG format)
├── index.ts         # Main plugin class
├── tsconfig.json    # TypeScript configuration
└── dist/           # Build output directory
```

### package.json Structure

```json
{
  "name": "@namespace/plugin-name",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  },
  "tensorify-settings": {
    "sdk-version": "0.0.1"
  },
  "keywords": ["tensorify", "plugin"],
  "author": "Your Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/username/plugin-name"
  },
  "private": false
}
```

### manifest.json Structure

```json
{
  "name": "@namespace/plugin-name",
  "version": "1.0.0",
  "description": "Plugin description",
  "author": "Your Name",
  "main": "dist/index.js",
  "entrypointClassName": "MyPluginClass",
  "keywords": ["tensorify", "plugin"],
  "scripts": {
    "build": "tsc"
  },
  "tensorifySettings": {
    "sdkVersion": "0.0.1"
  }
}
```

### Plugin Class Structure

```typescript
import { INode, NodeType, LayerSettings } from "@tensorify.io/sdk";

export default class MyPluginClass implements INode {
  readonly name = "My Plugin";
  readonly nodeType = NodeType.CUSTOM;
  readonly inputLines = 1;
  readonly outputLinesCount = 1;
  readonly secondaryInputLinesCount = 0;
  readonly translationTemplate = "my_template";
  readonly settings: LayerSettings = {};

  getTranslationCode(settings: LayerSettings): string {
    return "# Generated code";
  }

  validateSettings(settings: LayerSettings): boolean {
    return true;
  }

  getDependencies(): string[] {
    return ["numpy", "torch"];
  }

  getImports(): string[] {
    return ["import torch"];
  }
}
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Publish Plugin

on:
  push:
    tags: ["v*"]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Install Tensorify CLI
        run: npm install -g @tensorify.io/cli

      - name: Authenticate
        run: tensorify login --token ${{ secrets.TENSORIFY_TOKEN }}

      - name: Validate plugin
        run: tensorify validate --json

      - name: Publish plugin
        run: tensorify publish --access=public
```

### GitLab CI

```yaml
stages:
  - validate
  - publish

validate:
  stage: validate
  script:
    - npm install -g @tensorify.io/cli
    - tensorify validate --json
  only:
    - merge_requests

publish:
  stage: publish
  script:
    - npm install -g @tensorify.io/cli
    - echo $TENSORIFY_TOKEN | tensorify login --stdin
    - tensorify publish --access=public
  only:
    - tags
```

## 🐛 Troubleshooting

### Common Issues

#### Authentication Problems

**❌ "Not authenticated"**

```bash
# Solution: Login first
tensorify login

# Check authentication status
tensorify whoami
```

**❌ "Token expired"**

```bash
# Solution: Re-login
tensorify logout
tensorify login
```

#### Validation Errors

**❌ "Plugin validation failed"**

```bash
# Get detailed validation info
tensorify validate --verbose

# Common fixes:
# 1. Check file names (index.ts, manifest.json, icon.svg)
# 2. Verify class name matches manifest entrypointClassName
# 3. Ensure class implements INode interface
# 4. Check SDK version compatibility
```

**❌ "SDK version mismatch"**

```json
// Update package.json
{
  "tensorify-settings": {
    "sdk-version": "0.0.1" // Use current SDK version
  }
}
```

**❌ "Missing repository URL"**

```json
// For public plugins, add repository
{
  "repository": {
    "type": "git",
    "url": "https://github.com/username/plugin-name"
  },
  "private": false
}
```

#### Publishing Problems

**❌ "Version already exists"**

```bash
# Solution: Increment version in package.json and manifest.json
# Cannot republish existing versions
```

**❌ "Access level mismatch"**

```bash
# Solution: Use consistent access level
# Cannot change from public to private or vice versa
```

**❌ "Build failed"**

```bash
# Check TypeScript compilation
pnpm run build

# Verify tsconfig.json exists
# Ensure all dependencies installed
```

**❌ "Upload failed"**

```bash
# Check network connection
# Verify file sizes (< 100MB each)
# Ensure backend is accessible
```

### Debug Mode

Enable detailed logging:

```bash
# Set log level
export TENSORIFY_CLI_LOG_LEVEL=debug

# Or use debug flag
tensorify validate --debug
tensorify publish --debug
```

### Getting Help

```bash
# Command help
tensorify --help
tensorify publish --help

# Version information
tensorify --version

# Validate with verbose output
tensorify validate --verbose
```

## 📈 Performance Tips

### Faster Builds

```json
// tsconfig.json optimization
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

### Faster Uploads

- Keep bundle sizes small (< 10MB recommended)
- Optimize dependencies
- Use `.npmignore` to exclude unnecessary files

### Faster Validation

```bash
# Skip build for validation-only
tensorify validate --skip-build

# Use specific directory
tensorify validate ./plugin-dir
```

## 🔗 Integration Examples

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "tensorify validate"
    }
  }
}
```

### NPM Scripts

```json
// package.json
{
  "scripts": {
    "validate": "tensorify validate",
    "publish:public": "tensorify publish --access=public",
    "publish:private": "tensorify publish --access=private",
    "publish:dry": "tensorify publish --dry-run"
  }
}
```

## 📚 Resources

- 📖 **Documentation**: [docs.tensorify.io](https://docs.tensorify.io)
- 🎓 **Plugin Development Guide**: [docs.tensorify.io/plugins](https://docs.tensorify.io/plugins)
- 🔧 **SDK Documentation**: [@tensorify.io/sdk](https://npmjs.com/package/@tensorify.io/sdk)
- 💬 **Community Discord**: [discord.gg/tensorify](https://discord.gg/tensorify)
- 🐛 **Issue Tracker**: [github.com/tensorify/cli/issues](https://github.com/tensorify/cli/issues)
- 📧 **Support**: support@tensorify.io

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the Tensorify Team**
