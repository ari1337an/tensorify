# @tensorify.io/sdk

> **TypeScript SDK for developing Tensorify plugins with comprehensive validation, frontend enforcement, and publishing tools.**

The Tensorify SDK provides everything you need to create, validate, and publish machine learning plugins for the Tensorify ecosystem. With strong typing, visual configuration enforcement, and seamless CLI integration, building plugins has never been easier.

## 🚀 Quick Start

### Installation

```bash
npm install @tensorify.io/sdk
```

### Create Your First Plugin

```typescript
import {
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  HandleViewType,
  HandlePosition,
  EdgeType,
  NodeViewContainerType,
  IconType,
  SettingsUIType,
  SettingsDataType,
} from "@tensorify.io/sdk";

export default class LinearLayerPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Core Metadata (id, name, description, version, nodeType are derived from package.json)
      // nodeType is derived from package.json tensorify.pluginType field

      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 220,
          height: 140,
        },
        padding: {
          inner: 16,
          outer: 8,
          extraPadding: false,
        },
        styling: {
          borderRadius: 8,
          borderWidth: 2,
          shadowLevel: 1,
          theme: "auto",
        },
        icons: {
          primary: {
            type: IconType.LUCIDE,
            value: "layers",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "Linear Layer",
          dynamicLabelTemplate: "{inFeatures} → {outFeatures}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration
      inputHandles: [
        {
          id: "input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: true,
          label: "Input",
          edgeType: EdgeType.DEFAULT,
          dataType: "any",
        },
      ],

      outputHandles: [
        {
          id: "output",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.DEFAULT,
          label: "Output",
          edgeType: EdgeType.DEFAULT,
          dataType: "any",
        },
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "inFeatures",
          label: "Input Features",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 784,
          required: true,
          description: "Number of input features",
          validation: {
            min: 1,
            max: 100000,
          },
        },
        {
          key: "outFeatures",
          label: "Output Features",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 10,
          required: true,
          description: "Number of output features",
          validation: {
            min: 1,
            max: 100000,
          },
        },
        {
          key: "bias",
          label: "Use Bias",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description: "Whether to include bias parameters",
        },
      ],

      // Plugin Metadata
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: {
        minSdkVersion: "1.0.0",
        dependencies: ["torch"],
      },
    };

    super(definition);
  }

  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(
        `Settings validation failed: ${validation.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    // Get settings values
    const { variableName, inFeatures, outFeatures, bias } = settings;

    // Generate PyTorch code
    return `# Linear Layer
${variableName} = torch.nn.Linear(
    in_features=${inFeatures},
    out_features=${outFeatures},
    bias=${bias ? "True" : "False"}
)`;
  }
}
```

## 📚 Core Concepts

### Plugin Definition Structure

Every Tensorify plugin is built using the `IPluginDefinition` interface:

```typescript
interface IPluginDefinition {
  // Core Metadata (all optional - derived from package.json)
  id?: string; // Unique plugin identifier (derived from package name)
  name?: string; // Human-readable name (derived from package name)
  description?: string; // Plugin description (derived from package.json)
  version?: string; // Semantic version (derived from package.json)
  nodeType?: NodeType; // Category (derived from package.json tensorify.pluginType)

  // Visual Configuration
  visual: NodeVisualConfig; // How the plugin appears in UI

  // Handle Definitions
  inputHandles: InputHandle[]; // Input connection points
  outputHandles: OutputHandle[]; // Output connection points

  // Settings Configuration
  settingsFields: SettingsField[]; // User-configurable settings

  // Capabilities & Requirements
  capabilities: PluginCapability[]; // What the plugin can do
  requirements: PluginRequirements; // What the plugin needs
}
```

#### Understanding TensorifyPlugin Architecture

**Key insights for plugin development (reverse-engineered from SDK):**

1. **Core Metadata Derivation**: The SDK automatically derives `id`, `name`, `description`, `version`, and `nodeType` from your package.json, eliminating duplication. These fields are optional in `IPluginDefinition` and only need to be specified if you want to override the package.json values. The `nodeType` is derived from the `tensorify.pluginType` field in package.json.

2. **Visual Configuration is Mandatory**: Unlike optional documentation suggests, the `visual` field is required and heavily used by the frontend to render nodes.

3. **Handle System**: The plugin uses an 8-point positioning system for handles:

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

4. **Settings Field Types Map to UI Components**:

   ```typescript
   SettingsUIType.SLIDER → Frontend renders slider component
   SettingsUIType.INPUT_NUMBER → Frontend renders number input
   SettingsUIType.TOGGLE → Frontend renders toggle switch
   // The type directly determines UI rendering
   ```

5. **Dynamic Labels Use Template Strings**: The `dynamicLabelTemplate` in visual config supports variable substitution:

   ```typescript
   dynamicLabelTemplate: "Dropout (p={p})"; // {p} gets replaced with settings.p value
   ```

6. **Context Parameter Can Be Undefined**: In `getTranslationCode`, the context parameter might be undefined, especially during testing:

   ```typescript
   // Always check context before using
   const inputData = context ? this.getInput(context, 0) : null;
   ```

7. **Plugin Manifest Generation**: The CLI automatically generates manifest.json from your plugin definition - no manual manifest needed.

8. **Settings Validation is Automatic**: The SDK enforces validation rules automatically when `validateSettings()` is called.

### Core Settings System

**⚠️ CRITICAL REQUIREMENT**: All plugin settings MUST extend `CorePluginSettings` and include required fields.

#### Required Core Fields

Every plugin must implement these mandatory settings:

```typescript
interface CorePluginSettings {
  variableName: string; // REQUIRED: Internal variable identifier for code generation
  labelName: string; // REQUIRED: Display name shown in the UI
}
```

#### Implementation Example

```typescript
// Your plugin settings MUST extend CorePluginSettings
interface MyPluginSettings extends CorePluginSettings {
  // Required fields (inherited)
  variableName: string; // e.g., "my_layer", "conv2d_block"
  labelName: string; // e.g., "My Layer", "Conv2D Block"

  // Your custom fields
  myCustomField: string;
  numericValue: number;
  // ... other fields
}
```

#### Usage in API Calls

When calling plugin execution APIs, you MUST include both core fields:

```javascript
// ✅ CORRECT - Includes required core fields
{
  "variableName": "dropout_layer",
  "labelName": "Dropout Layer",
  "p": 0.2,
  "inplace": false
}

// ❌ INCORRECT - Missing labelName will cause validation error
{
  "variableName": "dropout_layer",
  "p": 0.2
}
```

#### Validation

The SDK automatically validates that core settings are present:

```typescript
// This validation happens automatically in getTranslationCode
const validation = this.validateSettings(settings);
if (!validation.isValid) {
  // Will throw error if variableName or labelName missing
  throw new Error("Settings validation failed: labelName is required");
}
```

### Code Generation Method

The heart of every plugin is the `getTranslationCode` method:

```typescript
public getTranslationCode(
  settings: PluginSettings,           // Extended settings with variableName & labelName
  children?: any,                     // Connected child plugins
  context?: PluginCodeGenerationContext  // Input context for code generation
): string {
  // 1. Validate settings
  const validation = this.validateSettings(settings);
  if (!validation.isValid) {
    throw new Error('Settings validation failed');
  }

  // 2. Access input data from handles
  const inputData = this.getInput(context, 0); // Get data from handle 0

  // 3. Generate and return code
  return `# Generated code
result = process_data("${settings.variableName}")`;
}
```

## 🎨 Visual Configuration

### Container Types

```typescript
enum NodeViewContainerType {
  DEFAULT = "default", // Standard rectangular
  BOX = "box", // Rounded rectangular
  CIRCLE = "circle", // Circular
  LEFT_ROUND = "left-round", // Left-rounded
}
```

### Handle Configuration

```typescript
// Input handle with validation
{
  id: "model-input",
  position: HandlePosition.LEFT,
  viewType: HandleViewType.DEFAULT,
  required: true,           // Shows red star (*)
  label: "Model",
  edgeType: EdgeType.ACCENT,
  dataType: "any",
  validation: {
    customValidator: "validateModelInput"
  }
}
```

### Handle Types & Positions

**Handle View Types:**

- `DEFAULT` - Standard circular handle
- `VERTICAL_BOX` - Rectangular vertical handle
- `CIRCLE_LG` - Large circular handle
- `DIAMOND` - Diamond-shaped handle

**Positions (8-point system):**

- `TOP`, `TOP_RIGHT`, `RIGHT`, `BOTTOM_RIGHT`
- `BOTTOM`, `BOTTOM_LEFT`, `LEFT`, `TOP_LEFT`

**Edge Types:**

- `DEFAULT`, `SOLID`, `DOTTED`, `DASHED`
- `ACCENT`, `MUTED`, `SUCCESS`, `WARNING`, `ERROR`

### Icons & Styling

```typescript
// Icon configuration
icons: {
  primary: {
    type: IconType.LUCIDE,     // or FONTAWESOME, SVG
    value: "layers"            // icon identifier
  },
  secondary: [
    {
      type: IconType.FONTAWESOME,
      value: "fa:lightning-bolt",
      position: "top-right"
    }
  ],
  showIconBackground: true,
  iconSize: "medium"
}
```

## ⚙️ Settings Configuration

### UI Component Types

```typescript
enum SettingsUIType {
  // Text Input
  INPUT_TEXT = "input-text",
  TEXTAREA = "textarea",

  // Numeric Input
  INPUT_NUMBER = "input-number",
  SLIDER = "slider",

  // Boolean Input
  TOGGLE = "toggle",
  CHECKBOX = "checkbox",

  // Selection Input
  DROPDOWN = "dropdown",
  RADIO = "radio",
  MULTI_SELECT = "multi-select",

  // Advanced Input
  CODE_EDITOR = "code-editor",
  FILE_UPLOAD = "file-upload",
  COLOR_PICKER = "color-picker",
  DATE_PICKER = "date-picker",
}
```

### Field Configuration Examples

```typescript
// Dropdown with options
{
  key: "optimizer",
  label: "Optimizer",
  type: SettingsUIType.DROPDOWN,
  dataType: SettingsDataType.STRING,
  required: true,
  options: [
    { label: "Adam", value: "adam" },
    { label: "SGD", value: "sgd" },
    { label: "RMSprop", value: "rmsprop" }
  ]
}

// Number input with validation
{
  key: "learningRate",
  label: "Learning Rate",
  type: SettingsUIType.INPUT_NUMBER,
  dataType: SettingsDataType.NUMBER,
  defaultValue: 0.001,
  validation: {
    min: 0.0001,
    max: 1.0,
    errorMessage: "Learning rate must be between 0.0001 and 1.0"
  }
}

// Conditional field display
{
  key: "momentum",
  label: "Momentum",
  type: SettingsUIType.INPUT_NUMBER,
  dataType: SettingsDataType.NUMBER,
  defaultValue: 0.9,
  conditionalDisplay: {
    dependsOn: "optimizer",
    condition: "equals",
    value: "sgd"
  }
}
```

## 🔧 Plugin Development

### Building and Publishing

1. **Build your plugin:**

   ```bash
   pnpm run build
   ```

2. **Generate manifest:**

   ```typescript
   import { buildPluginManifest } from "@tensorify.io/sdk";
   import MyPlugin from "./dist/index.js";

   const plugin = new MyPlugin();
   buildPluginManifest(
     plugin,
     "./package.json",
     "MyPlugin",
     "./dist/manifest.json"
   );
   ```

3. **Publish with CLI:**
   ```bash
   npx tensorify publish
   ```

### Validation

The SDK provides comprehensive validation:

```typescript
// Validate plugin instance
import { validatePlugin } from "@tensorify.io/sdk";

const plugin = new MyPlugin();
const result = validatePlugin(plugin);

if (!result.isValid) {
  console.error("Validation errors:", result.errors);
}

// Validate specific settings
const settingsValidation = plugin.validateSettings(userSettings);
```

### Utilities

```typescript
import {
  generateVariableName,
  sanitizeVariableName,
  indentCode,
  createPluginTemplate,
  autoDetectEntrypointClassName,
} from "@tensorify.io/sdk";

// Generate unique variable names
const varName = generateVariableName("linear_layer");

// Clean variable names
const clean = sanitizeVariableName("my-variable-name"); // → my_variable_name

// Indent generated code
const indented = indentCode(codeString, 2); // 2 levels of indentation

// Create plugin template
const template = createPluginTemplate(
  "My Plugin",
  "my-plugin",
  NodeType.CUSTOM
);
```

## 🎯 Plugin Categories

### Available Node Types

```typescript
enum NodeType {
  // Core Types
  CUSTOM = "custom",
  TRAINER = "trainer",
  EVALUATOR = "evaluator",
  MODEL = "model",
  MODEL_LAYER = "model_layer",

  // Data Processing
  DATALOADER = "dataloader",
  PREPROCESSOR = "preprocessor",
  POSTPROCESSOR = "postprocessor",
  AUGMENTATION_STACK = "augmentation_stack",

  // Training Components
  OPTIMIZER = "optimizer",
  LOSS_FUNCTION = "loss_function",
  METRIC = "metric",
  SCHEDULER = "scheduler",
  REGULARIZER = "regularizer",

  // Workflow Components
  FUNCTION = "function",
  PIPELINE = "pipeline",
  REPORT = "report",
}
```

Each node type has specific expectations for handles and behavior.

## 🔍 Advanced Features

### Dynamic Labels

Create labels that update based on settings:

```typescript
visual: {
  labels: {
    dynamicLabelTemplate: "Conv2d({inChannels}, {outChannels}, {kernelSize})";
  }
}
```

### Input Data Access

Access connected node data in your code generation:

```typescript
public getTranslationCode(
  settings: PluginSettings,
  children?: any,
  context?: PluginCodeGenerationContext
): string {
  // Get input from specific handle
  const modelInput = this.getInput(context, 0);
  const dataInput = this.getInput(context, 1);

  // Get all inputs as array
  const allInputs = this.getAllInputs(context);

  return `# Process inputs: ${allInputs.length} connected`;
}
```

### Settings Groups

Organize complex settings into groups:

```typescript
settingsGroups: [
  {
    id: "model-config",
    label: "Model Configuration",
    collapsible: true,
    defaultExpanded: true,
    fields: ["architecture", "layers", "activation"],
  },
  {
    id: "training-config",
    label: "Training Configuration",
    collapsible: true,
    defaultExpanded: false,
    fields: ["epochs", "batchSize", "learningRate"],
  },
];
```

## 📦 Package Structure

Your plugin package should follow this structure:

```
my-plugin/
├── package.json          # NPM package configuration
├── tsconfig.json         # TypeScript configuration
├── src/
│   └── index.ts         # Main plugin file
├── dist/                # Compiled output (generated)
│   ├── index.js
│   └── manifest.json    # Generated by CLI
└── README.md           # Plugin documentation
```

### package.json Requirements

```json
{
  "name": "@your-org/my-plugin",
  "version": "1.0.0",
  "description": "My awesome Tensorify plugin",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@tensorify.io/sdk": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "keywords": ["tensorify", "plugin", "ml"],
  "author": "Your Name",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/my-plugin"
  },
  "tensorify": {
    "pluginType": "model_layer"
  }
}
```

## 🆘 Best Practices

### 1. Strong Typing

Always use TypeScript interfaces for your plugin settings:

```typescript
interface LinearLayerSettings extends CorePluginSettings {
  inFeatures: number;
  outFeatures: number;
  bias: boolean;
}

// Use in your plugin
public getTranslationCode(settings: LinearLayerSettings, ...) {
  // TypeScript will validate settings structure
}
```

### 2. Validation

Implement comprehensive validation:

```typescript
public getTranslationCode(settings: PluginSettings, ...) {
  // Always validate first
  const validation = this.validateSettings(settings);
  if (!validation.isValid) {
    throw new Error(`Invalid settings: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  // Safe to use settings now
  return generateCode(settings);
}
```

### 3. Error Handling

Provide clear error messages:

```typescript
if (!settings.modelPath) {
  throw new Error("Model path is required for inference plugins");
}

if (settings.batchSize <= 0) {
  throw new Error("Batch size must be a positive number");
}
```

### 4. Documentation

Document your settings fields:

```typescript
{
  key: "learningRate",
  label: "Learning Rate",
  description: "Controls how quickly the model learns. Lower values = more stable but slower training."
}
```

## 🔗 Integration

### CLI Integration

The Tensorify CLI automatically detects and validates SDK-based plugins:

```bash
# Validate plugin structure
npx tensorify validate

# Build and publish
npx tensorify publish --access=public
```

### Frontend Integration

The frontend automatically:

1. Reads your plugin's manifest
2. Renders React Flow nodes based on visual config
3. Provides settings UI based on field definitions
4. Calls your `getTranslationCode` method
5. Executes generated code in workflows

## 📄 API Reference

### TensorifyPlugin Class

**Constructor:** `new TensorifyPlugin(definition: IPluginDefinition)`

**Abstract Methods:**

- `getTranslationCode(settings, children?, context?)` - Generate code

**Public Methods:**

- `validateSettings(settings)` - Validate settings values
- `generateManifest(packageInfo, className)` - Create manifest
- `createDefaultSettings()` - Generate default settings
- `generateDynamicLabel(settings)` - Process dynamic label template

**Protected Methods:**

- `getInput(context, handleNumber)` - Access input data
- `getAllInputs(context)` - Get all input data

### Utility Functions

- `generatePluginManifest()` - Generate manifest from plugin
- `validatePlugin()` - Validate plugin instance
- `createPluginTemplate()` - Generate boilerplate code
- `autoDetectEntrypointClassName()` - Find main class

## 🚀 Examples

### PyTorch Conv2D Layer

```typescript
export default class Conv2dPlugin extends TensorifyPlugin {
  constructor() {
    super({
      // Core metadata derived from package.json
      visual: {
        // ... visual config
        labels: {
          dynamicLabelTemplate:
            "Conv2d({inChannels}, {outChannels}, {kernelSize})",
        },
      },
      settingsFields: [
        {
          key: "inChannels",
          label: "Input Channels",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 3,
          required: true,
        },
        // ... more fields
      ],
    });
  }

  getTranslationCode(settings: PluginSettings): string {
    return `${settings.variableName} = torch.nn.Conv2d(
  in_channels=${settings.inChannels},
  out_channels=${settings.outChannels},
  kernel_size=${settings.kernelSize}
)`;
  }
}
```

### Training Loop Plugin

```typescript
export default class TrainerPlugin extends TensorifyPlugin {
  constructor() {
    super({
      // Core metadata derived from package.json
      inputHandles: [
        { id: "model", position: HandlePosition.LEFT /* ... */ },
        { id: "optimizer", position: HandlePosition.LEFT /* ... */ },
        { id: "dataloader", position: HandlePosition.TOP /* ... */ },
      ],
      // ... rest of config
    });
  }

  getTranslationCode(
    settings: PluginSettings,
    children: any,
    context: PluginCodeGenerationContext
  ): string {
    const model = this.getInput(context, 0);
    const optimizer = this.getInput(context, 1);
    const dataloader = this.getInput(context, 2);

    return `
# Training Loop
for epoch in range(${settings.epochs}):
    for batch_idx, (data, target) in enumerate(${dataloader}):
        ${optimizer}.zero_grad()
        output = ${model}(data)
        loss = criterion(output, target)
        loss.backward()
        ${optimizer}.step()
`;
  }
}
```

## 📊 Migration Guide

If you're migrating from the old SDK, see our [Migration Guide](MIGRATION.md) for step-by-step instructions.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the Tensorify Team**
