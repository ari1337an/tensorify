# SDK Overhaul - Missed Tasks

This document outlines the remaining tasks that were missed during the comprehensive SDK overhaul. While the core architecture has been successfully implemented, several important components still need attention to complete the full transformation.

## 🚨 Critical Missing Items

### 1. **CLI Integration with New SDK Manifest Generation**

**Status:** ⚠️ **PARTIALLY IMPLEMENTED**

**Issue:** The CLI still uses legacy `generateManifestFromPackageJson()` method instead of leveraging the new SDK's `plugin.generateManifest()` method.

**Current CLI Code (Legacy):**

```typescript
// packages/cli/src/commands/publish.ts line 462
private generateManifestFromPackageJson(packageJson: PackageJson): ManifestJson {
  // Legacy manifest generation logic
  return {
    name: packageJson.name,
    version: packageJson.version,
    // ... manual mapping
  };
}
```

**Required Actions:**

- Update CLI to instantiate actual plugin classes using new SDK
- Replace `generateManifestFromPackageJson()` with `plugin.generateManifest()`
- Add auto-detection of plugin class name using `autoDetectEntrypointClassName()`
- Integrate new SDK validation methods in CLI validation
- Update CLI to leverage comprehensive manifest structure from new SDK
- Remove legacy manifest generation code
- Update CLI documentation to reflect new workflow

**Target CLI Integration:**

```typescript
// Updated CLI should use:
import { TensorifyPlugin, generatePluginManifest } from "@tensorify.io/sdk";

const plugin = await loadPluginInstance(directory);
const manifest = plugin.generateManifest(packageInfo, className);
```

### 2. **Enhanced Validation Integration**

**Status:** ⚠️ **PARTIAL**

**Issue:** While the SDK has comprehensive validation, the CLI and other tools may not fully leverage all validation capabilities.

**Required Actions:**

- Ensure CLI validation uses SDK's `validatePlugin()` method completely
- Add validation for visual configuration completeness
- Implement validation for handle position conflicts
- Add semantic validation (e.g., handle connections make sense)
- Create validation reporting tools
- Add validation plugins for IDEs/editors
