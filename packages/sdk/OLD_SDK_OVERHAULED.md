# Tensorify Plugin System Overhaul

## Branch Changes Summary

This document outlines the comprehensive overhaul of the Tensorify Plugin System implemented in this branch. The changes represent a complete architectural redesign focused on developer experience, type safety, and frontend integration.

## 🔄 Major Changes Overview

### 1. **Complete SDK Architecture Redesign**

#### **Before (Main Branch)**

- Multiple fragmented base classes (`BaseNode`, `ModelLayerNode`, `TrainerNode`, etc.)
- Separate legacy and new plugin systems
- Inconsistent type definitions across multiple files
- Manual manifest.json files required
- Zod-based validation system
- Mixed import patterns and duplicate interfaces

#### **After (This Branch)**

- **Single unified abstract class**: `TensorifyPlugin`
- **Consolidated type system** with logical organization
- **Automatic manifest generation** from plugin definitions
- **Built-in validation** without external dependencies
- **Frontend-first approach** with enforced visual configurations

### 2. **File Structure Reorganization**

#### **Removed/Cleaned Up**

```
❌ deprecated_sdk/ (entire directory)
❌ packages/sdk/src/base/ (legacy base classes)
❌ packages/sdk/src/interfaces/ (old interfaces)
❌ packages/sdk/src/validation/ (Zod-based validation)
❌ packages/sdk/src/examples/ (moved to create-tensorify-plugin)
❌ All compiled files (.js, .d.ts, .map)
```

#### **New Clean Structure**

```
✅ packages/sdk/src/
├── core/
│   └── TensorifyPlugin.ts          # Single abstract class
├── types/
│   ├── core.ts                     # Core settings & context types
│   ├── visual.ts                   # Visual configuration types
│   ├── settings.ts                 # Settings field types
│   └── plugin.ts                   # Plugin definition & manifest types
├── utils/
│   └── plugin-utils.ts             # Development utilities
└── index.ts                        # Clean public API
```

## 🏗️ Core Architecture Changes

### 1. **Single Abstract Class System**

#### **Old Approach**

```typescript
// Multiple base classes with inconsistent interfaces
class MyPlugin extends BaseNode {
  // Manual property definitions
  readonly name = "MyPlugin";
  readonly nodeType = NodeType.CUSTOM;
  // ... many manual properties
}
```

#### **New Approach**

```typescript
// Single unified class with comprehensive definition
export default class MyPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      id: "my-plugin",
      name: "My Plugin",
      nodeType: NodeType.CUSTOM,
      visual: {
        /* enforced visual config */
      },
      inputHandles: [
        /* handle definitions */
      ],
      settingsFields: [
        /* UI field definitions */
      ],
      // ... complete structured definition
    };
    super(definition);
  }

  getTranslationCode(settings, children, context) {
    // Single required method
  }
}
```

### 2. **Core Settings System Enforcement**

#### **New Requirements**

All plugin settings must extend `CorePluginSettings`:

```typescript
interface CorePluginSettings {
  variableName: string; // Internal variable identifier
  labelName: string; // Display name for UI
}

// Plugin settings automatically include these
interface MyPluginSettings extends CorePluginSettings {
  myCustomField: string;
}
```

### 3. **Frontend Visual Configuration Enforcement**

#### **Previously Optional - Now Mandatory**

Every plugin must define complete visual configuration:

```typescript
visual: {
  containerType: NodeViewContainerType.DEFAULT,
  size: { width: 200, height: 120 },
  padding: { inner: 16, outer: 8, extraPadding: false },
  styling: { borderRadius: 8, shadowLevel: 1, theme: "auto" },
  icons: {
    primary: { type: IconType.LUCIDE, value: "box" },
    showIconBackground: true
  },
  labels: {
    title: "My Plugin",
    dynamicLabelTemplate: "{myField}",
    showLabels: true
  }
}
```

### 4. **Handle System Redesign**

#### **8-Point Positioning System**

```typescript
enum HandlePosition {
  TOP,
  TOP_RIGHT,
  RIGHT,
  BOTTOM_RIGHT,
  BOTTOM,
  BOTTOM_LEFT,
  LEFT,
  TOP_LEFT,
}
```

#### **Comprehensive Handle Configuration**

```typescript
inputHandles: [
  {
    id: "input",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.DEFAULT,
    required: true,
    label: "Input",
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    validation: {
      /* optional validation */
    },
    description: "Input description",
  },
];
```

### 5. **Settings Field System**

#### **UI Component Integration**

```typescript
settingsFields: [
  {
    key: "myField",
    label: "My Field",
    type: SettingsUIType.INPUT_TEXT, // UI component
    dataType: SettingsDataType.STRING, // Data type
    defaultValue: "default",
    required: false,
    validation: {
      minLength: 1,
      pattern: "^[a-zA-Z]+$",
    },
    conditionalDisplay: {
      // Show/hide logic
      dependsOn: "otherField",
      condition: "equals",
      value: "showThis",
    },
  },
];
```

## 🎯 Code Generation Changes

### 1. **Simplified getTranslationCode Method**

#### **Old Signature (Multiple Variations)**

```typescript
// Different signatures across base classes
getTranslationCode(settings: LayerSettings): string
getTranslationCode(settings: any, children?: any): string
```

#### **New Unified Signature**

```typescript
getTranslationCode(
  settings: PluginSettings,           // Always extends CorePluginSettings
  children?: any,                     // Connected child plugins
  context?: PluginCodeGenerationContext  // Input data context
): string
```

### 2. **Input Data Access**

#### **New Helper Methods**

```typescript
// Access specific handle input
const inputData = this.getInput(context, 0);

// Access all inputs
const allInputs = this.getAllInputs(context);
```

### 3. **Context-Aware Generation**

```typescript
export interface PluginCodeGenerationContext {
  workflowId: string;
  nodeId: string;
  inputData: Record<number, any>; // Handle number -> data mapping
  globalContext: any;
  executionMetadata: {
    timestamp: number;
    userId: string;
    environmentType: "development" | "production";
  };
}
```

## 📦 Manifest Generation Changes

### **Before: Manual manifest.json**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "entrypointClassName": "MyPlugin"
  // ... manual duplication of information
}
```

### **After: Automatic Generation**

```typescript
// CLI automatically generates manifest from plugin definition
// No manual manifest.json needed
// Single source of truth in plugin class

const manifest = plugin.generateManifest(packageInfo, className);
// Automatically includes all visual configs, handles, settings
```

## 🔧 Validation System Changes

### **Before: Zod-based External Validation**

```typescript
import { z } from "zod";
import { ManifestSchema, PackageJsonSchema } from "@tensorify.io/sdk";

// External schema validation
const result = ManifestSchema.parse(manifest);
```

### **After: Built-in Validation**

```typescript
// Automatic validation in plugin constructor
constructor(definition: IPluginDefinition) {
  this.definition = definition;
  this.validateDefinition(); // Automatic validation
}

// Runtime settings validation
const validation = plugin.validateSettings(userSettings);
if (!validation.isValid) {
  // Detailed error messages
}
```

## 🛠️ Development Tools Changes

### **New Utility Functions**

```typescript
// Plugin development utilities
generatePluginManifest(); // CLI integration
validatePlugin(); // Development validation
createPluginTemplate(); // Quick scaffolding
autoDetectEntrypointClassName(); // Smart detection
generateVariableName(); // Unique variable names
sanitizeVariableName(); // Clean variable names
indentCode(); // Code formatting
```

### **Template Updates**

Both `minimal` and `linear-layer` templates in `create-tensorify-plugin` updated:

```typescript
// Old template (fragmented)
class MyPlugin extends BaseNode {
  readonly name = "MyPlugin";
  // ... manual property definitions
}

// New template (comprehensive)
export default class MyPlugin extends TensorifyPlugin {
  constructor() {
    super({
      // Complete structured definition
      id: "my-plugin",
      visual: {
        /* enforced visual config */
      },
      settingsFields: [
        /* UI integration */
      ],
    });
  }
}
```

## 📚 Type System Improvements

### **1. Organized Type Hierarchy**

#### **Core Types** (`types/core.ts`)

- `CorePluginSettings` - Base settings interface
- `PluginCodeGenerationContext` - Execution context
- `NodeType` - Plugin categories enum
- `PluginCapability` - Plugin capabilities enum

#### **Visual Types** (`types/visual.ts`)

- `HandleViewType`, `HandlePosition`, `EdgeType` - Handle system
- `NodeVisualConfig` - Complete visual configuration
- `IconType`, `NodeIcon` - Icon system
- `NodeSize`, `NodePadding`, `NodeStyling` - Layout system

#### **Settings Types** (`types/settings.ts`)

- `SettingsUIType` - UI component types
- `SettingsField` - Field definition interface
- `FieldValidation` - Validation rules
- `ConditionalDisplay` - Dynamic field visibility

#### **Plugin Types** (`types/plugin.ts`)

- `IPluginDefinition` - Complete plugin definition
- `FrontendPluginManifest` - Generated manifest structure
- `PluginValidationResult` - Validation feedback

### **2. Comprehensive Enums**

```typescript
enum NodeType {
  // Core Types
  CUSTOM,
  TRAINER,
  EVALUATOR,
  MODEL,
  MODEL_LAYER,
  // Data Processing
  DATALOADER,
  PREPROCESSOR,
  POSTPROCESSOR,
  AUGMENTATION_STACK,
  // Training Components
  OPTIMIZER,
  LOSS_FUNCTION,
  METRIC,
  SCHEDULER,
  REGULARIZER,
  // Workflow Components
  FUNCTION,
  PIPELINE,
  REPORT,
}

enum SettingsUIType {
  // Text Input
  INPUT_TEXT,
  TEXTAREA,
  // Numeric Input
  INPUT_NUMBER,
  SLIDER,
  // Boolean Input
  TOGGLE,
  CHECKBOX,
  // Selection Input
  DROPDOWN,
  RADIO,
  MULTI_SELECT,
  // Advanced Input
  CODE_EDITOR,
  FILE_UPLOAD,
  COLOR_PICKER,
  DATE_PICKER,
}
```

## 🔗 CLI Integration Changes

### **Before: Complex Validation Process**

```bash
# Manual steps required
npx tensorify validate              # Separate validation
# Manual manifest.json creation
npx tensorify publish
```

### **After: Streamlined Workflow**

```bash
# Single command handles everything
npx tensorify publish
# Automatically:
# 1. Validates plugin structure
# 2. Generates manifest from plugin definition
# 3. Builds and uploads
```

### **Automatic Manifest Generation**

The CLI now:

1. Instantiates the plugin class
2. Extracts complete definition including visual configs
3. Merges with package.json information
4. Generates comprehensive manifest
5. Validates everything automatically

## 🎨 Frontend Integration Improvements

### **Complete Visual Configuration**

The frontend can now automatically:

1. **Render React Flow Nodes** based on visual config
2. **Position Handles** using 8-point system
3. **Generate Settings UI** from field definitions
4. **Apply Dynamic Labels** using template system
5. **Validate User Input** using field validation rules

### **Settings UI Generation**

```typescript
// Plugin defines UI structure
settingsFields: [
  {
    key: "learningRate",
    type: SettingsUIType.INPUT_NUMBER, // Frontend renders number input
    validation: { min: 0.0001, max: 1.0 }, // Frontend validates range
    conditionalDisplay: {
      // Frontend shows/hides field
      dependsOn: "optimizer",
      condition: "equals",
      value: "adam",
    },
  },
];
```

## 📈 Benefits & Improvements

### **1. Developer Experience**

- **Single class to extend** instead of multiple base classes
- **Complete TypeScript support** with excellent IntelliSense
- **Automatic validation** catches errors early
- **Comprehensive utilities** for common tasks

### **2. Type Safety**

- **Strong typing** throughout the system
- **Interface enforcement** prevents runtime errors
- **Compile-time validation** of plugin structure

### **3. Frontend Integration**

- **Automatic UI generation** from plugin definitions
- **Consistent visual appearance** across all plugins
- **Dynamic behavior** based on settings

### **4. Maintenance**

- **Single source of truth** eliminates duplication
- **Clean architecture** makes modifications easier
- **Comprehensive documentation** improves onboarding

### **5. Publishing**

- **Streamlined workflow** reduces friction
- **Automatic manifest generation** prevents errors
- **Built-in validation** ensures quality

## 🚀 Migration Guide

### **For Plugin Developers**

#### **1. Update Imports**

```typescript
// Old
import { BaseNode, NodeType } from "@tensorify.io/sdk";

// New
import {
  TensorifyPlugin,
  IPluginDefinition,
  NodeType,
  PluginSettings,
} from "@tensorify.io/sdk";
```

#### **2. Restructure Plugin Class**

```typescript
// Old approach
export default class MyPlugin extends BaseNode {
  readonly name = "MyPlugin";
  readonly nodeType = NodeType.CUSTOM;
  // ... many manual properties

  getTranslationCode(settings: any): string {
    return "code";
  }
}

// New approach
export default class MyPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      id: "my-plugin",
      name: "My Plugin",
      nodeType: NodeType.CUSTOM,
      visual: {
        /* complete visual config */
      },
      inputHandles: [
        /* handle definitions */
      ],
      settingsFields: [
        /* UI field definitions */
      ],
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: { minSdkVersion: "1.0.0", dependencies: [] },
    };
    super(definition);
  }

  getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Enhanced method with context access
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error("Settings validation failed");
    }
    return "generated code";
  }
}
```

#### **3. Remove Manual Files**

- ❌ Delete `manifest.json` (auto-generated now)
- ❌ Remove manual visual configurations
- ✅ Keep `package.json` and `tsconfig.json`

### **For CLI Integration**

No changes required - the CLI automatically detects and works with the new plugin system.

## 🔍 Breaking Changes

### **1. API Changes**

- `BaseNode`, `ModelLayerNode`, etc. → `TensorifyPlugin`
- Manual manifest.json → Automatic generation
- Fragmented validation → Built-in validation

### **2. Required Properties**

- Visual configuration is now mandatory
- Core settings (`variableName`, `labelName`) enforced
- Handle definitions required for UI rendering

### **3. Method Signatures**

- `getTranslationCode()` signature standardized
- Settings must extend `CorePluginSettings`
- Context parameter added for input access

## 📅 Implementation Timeline

1. **✅ Phase 1**: Architecture design and type definitions
2. **✅ Phase 2**: Core `TensorifyPlugin` class implementation
3. **✅ Phase 3**: Validation system integration
4. **✅ Phase 4**: Utility functions and developer tools
5. **✅ Phase 5**: Template updates and documentation
6. **✅ Phase 6**: Build system integration and testing

## 🎯 Future Considerations

### **Planned Enhancements**

- **Plugin composition system** for complex workflows
- **Runtime plugin loading** for dynamic systems
- **Enhanced validation** with custom rules
- **Plugin dependency management**
- **Performance optimizations** for large plugin catalogs

### **Backward Compatibility**

While this is a breaking change, the new system provides:

- **Migration utilities** for converting old plugins
- **Comprehensive documentation** for upgrading
- **Template generators** for quick migration
- **CLI warnings** for deprecated patterns

---

This comprehensive overhaul positions the Tensorify Plugin System as a modern, type-safe, and developer-friendly platform for machine learning workflow creation.
