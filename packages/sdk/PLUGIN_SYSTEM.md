# Tensorify Plugin System - Complete Guide

Welcome to the new Tensorify Plugin System! This guide will help you create powerful, customizable React Flow nodes for the Tensorify frontend.

## 🚀 Quick Start

### 1. Install the SDK

```bash
npm install @tensorify.io/sdk
```

### 2. Create Your First Plugin

```typescript
import {
  TensorifyPlugin,
  HandleViewType,
  NodeViewContainerType,
  SettingsFieldType,
  IconType,
  HandlePosition,
  EdgeType,
} from "@tensorify.io/sdk";

export class MyFirstPlugin extends TensorifyPlugin {
  constructor() {
    super({
      id: "my-first-plugin",
      name: "My First Plugin",
      description: "A simple example plugin",
      version: "1.0.0",
      category: "general",

      visual: {
        containerType: "default" as NodeViewContainerType,
        size: { width: 200, height: 120 },
        extraPadding: false,
        title: "My Plugin",
        primaryIcon: {
          type: "lucide" as IconType,
          value: "box",
          position: "center",
        },
        secondaryIcons: [],
      },

      inputHandles: [
        {
          id: "input",
          position: "left" as HandlePosition,
          viewType: "default" as HandleViewType,
          required: false,
          label: "Input",
        },
      ],

      outputHandles: [
        {
          id: "output",
          position: "right" as HandlePosition,
          viewType: "default" as HandleViewType,
          label: "Output",
        },
      ],

      settingsFields: [
        {
          key: "message",
          label: "Message",
          type: "input-text" as SettingsFieldType,
          dataType: "string",
          defaultValue: "Hello World!",
          required: false,
        },
      ],
    });
  }

  public getTranslationCode(settings: any): string {
    return `print("${settings.message || "Hello World!"}")`;
  }
}

export default MyFirstPlugin;
```

### 3. Build and Generate Manifest

```typescript
import { buildPluginManifest } from "@tensorify.io/sdk";
import { MyFirstPlugin } from "./MyFirstPlugin";

const plugin = new MyFirstPlugin();

buildPluginManifest(
  plugin,
  "./package.json",
  "MyFirstPlugin",
  "./dist/manifest.json"
);
```

## 🎨 Visual Configuration

### Container Types

- `"default"` - Standard rectangular container
- `"box"` - Rounded rectangular container
- `"circle"` - Circular container
- `"left-round"` - Left-rounded container

### Handle Types & Positions

**Handle View Types:**

- `"default"` - Standard circular handle
- `"verticalBox"` - Rectangular vertical handle
- `"circle-lg"` - Large circular handle
- `"diamond"` - Diamond-shaped handle

**Positions (8-point system):**

- `"top"`, `"bottom"`, `"left"`, `"right"`
- `"top-left"`, `"top-right"`, `"bottom-left"`, `"bottom-right"`

**Required Handles:** Set `required: true` to show red star (\*) in UI

### Icons & Styling

**Icon Types:**

- `"lucide"` - Lucide React icons (e.g., `"box"`, `"zap"`)
- `"fontawesome"` - FontAwesome icons (e.g., `"fa:discord"`)
- `"svg"` - Raw SVG markup

**Icon Positions:**

- `"center"` - Primary icon in center
- `"top"`, `"left"`, `"bottom"`, `"right"` - Secondary icon positions

## ⚙️ Settings Configuration

### Field Types & Data Types

| UI Component   | Data Type | Use Case          |
| -------------- | --------- | ----------------- |
| `input-text`   | `string`  | Short text input  |
| `textarea`     | `string`  | Long text input   |
| `input-number` | `number`  | Numeric values    |
| `dropdown`     | `string`  | Single selection  |
| `radio`        | `string`  | Exclusive choices |
| `toggle`       | `boolean` | On/off switch     |
| `checkbox`     | `boolean` | True/false option |

### Example Settings Configuration

```typescript
settingsFields: [
  // Dropdown with options
  {
    key: "model",
    label: "AI Model",
    type: "dropdown",
    dataType: "string",
    required: true,
    options: [
      { label: "GPT-4", value: "gpt-4" },
      { label: "GPT-3.5", value: "gpt-3.5" },
    ],
  },

  // Number input with validation
  {
    key: "temperature",
    label: "Temperature",
    type: "input-number",
    dataType: "number",
    defaultValue: 0.7,
    description: "Controls randomness (0.0-2.0)",
  },

  // Boolean toggle
  {
    key: "streaming",
    label: "Enable Streaming",
    type: "toggle",
    dataType: "boolean",
    defaultValue: true,
  },
];
```

## 🏷️ Dynamic Labels

Create labels that change based on settings:

```typescript
visual: {
  // ... other config
  dynamicLabelTemplate: "Using {model} with {temperature} temp";
}
```

The frontend will replace `{model}` and `{temperature}` with actual setting values.

## 🔧 Handle Configuration Examples

### Multiple Handle Types

```typescript
inputHandles: [
  // Required handle with red star (*)
  {
    id: "model-input",
    position: "left",
    viewType: "default",
    required: true,
    label: "Model",
    edgeType: "accent",
  },

  // Optional vertical box handle
  {
    id: "memory-input",
    position: "top",
    viewType: "verticalBox",
    required: false,
    label: "Memory",
    edgeType: "muted",
  },

  // Large circle handle with dotted edge
  {
    id: "tools-input",
    position: "top-right",
    viewType: "circle-lg",
    required: false,
    label: "Tools",
    edgeType: "dotted",
  },
];
```

## 📄 Code Generation

Implement the `getTranslationCode` method to generate executable code:

```typescript
public getTranslationCode(
  settings: PluginSettings,
  children?: any,
  context?: PluginCodeGenerationContext
): string {
  // Validate settings first
  this.validateSettings(settings);

  // Access connected node data via children/context
  const model = settings.model;
  const temp = settings.temperature;

  // Generate code for your target language
  return `
import openai

client = openai.Client()
response = client.chat.completions.create(
  model="${model}",
  temperature=${temp},
  messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
  `.trim();
}
```

## ✅ Validation & Error Handling

### Built-in Validation

The SDK automatically validates:

- Required fields are provided
- Data types match UI component types
- Handle IDs are unique
- Icon references are valid

### Custom Validation

```typescript
protected validateSettings(settings: PluginSettings): boolean {
  // Call parent validation first
  super.validateSettings(settings);

  // Add custom validation rules
  if (settings.temperature < 0 || settings.temperature > 2) {
    throw new Error("Temperature must be between 0.0 and 2.0");
  }

  return true;
}
```

## 🔨 Build Process

### 1. TypeScript Compilation

```bash
npm run build  # Compile to dist/
```

### 2. Manifest Generation

```typescript
// build-manifest.js
import { buildPluginManifest } from "@tensorify.io/sdk";
import { MyPlugin } from "./dist/index.js";

const plugin = new MyPlugin();
buildPluginManifest(
  plugin,
  "./package.json",
  "MyPlugin",
  "./dist/manifest.json"
);
```

### 3. Generated Files

- `dist/index.js` - Compiled plugin code
- `dist/manifest.json` - Frontend configuration

## 📦 Manifest Structure

The generated `manifest.json` contains everything the frontend needs:

```json
{
  "name": "@your-org/my-plugin",
  "version": "1.0.0",
  "entrypointClassName": "MyPlugin",
  "frontendConfigs": {
    "id": "my-plugin",
    "name": "My Plugin",
    "category": "general",
    "containerType": "default",
    "size": { "width": 200, "height": 120 },
    "inputHandles": [...],
    "outputHandles": [...],
    "settingsFields": [...],
    "dynamicLabelTemplate": "..."
  },
  "capabilities": ["code-generation", "configurable"],
  "requirements": {
    "minSdkVersion": "1.0.0",
    "dependencies": []
  }
}
```

## 🎯 Complete Example

See `AIChatAgentPlugin` in the SDK for a comprehensive example showing:

- All handle types and positions
- All settings field types
- Visual configuration with icons
- Dynamic label templates
- Custom validation
- Complex code generation

## 🔗 Frontend Integration

The frontend app will:

1. Read your `manifest.json` file
2. Render React Flow nodes based on `frontendConfigs`
3. Provide settings UI for user configuration
4. Call your `getTranslationCode` method with current settings
5. Execute the generated code in workflows

## 📚 API Reference

### TensorifyPlugin Class

**Constructor:** `new TensorifyPlugin(definition: IPluginDefinition)`

**Methods:**

- `getTranslationCode(settings, children?, context?)` - Generate code (abstract)
- `validateSettings(settings)` - Validate settings values
- `generateManifest(packageInfo, className)` - Create manifest
- `generateDynamicLabel(settings)` - Process dynamic label template

### Utilities

- `buildPluginManifest()` - Complete build workflow
- `validatePluginDefinition()` - Validate plugin config
- `createPluginTemplate()` - Generate boilerplate code
- `autoDetectEntrypointClassName()` - Find main class

## 🆘 Troubleshooting

### Common Issues

**"Invalid data type for field"**

- Ensure `dataType` matches `type` (e.g., `number` with `input-number`)

**"Duplicate handle IDs"**

- Each handle must have a unique `id` within the plugin

**"Required field missing"**

- Required settings fields must have values provided

**"Invalid icon type"**

- Use `"lucide"`, `"fontawesome"`, or `"svg"` only
- FontAwesome icons must start with `"fa:"`

### Best Practices

1. **Start Simple** - Begin with basic handles and settings
2. **Validate Early** - Add custom validation for complex logic
3. **Test Thoroughly** - Use the validation utilities
4. **Document Well** - Add descriptions to all settings fields
5. **Follow Naming** - Use clear, descriptive handle and field IDs

## 🚀 Next Steps

1. Create your first plugin using the template
2. Test with the validation utilities
3. Build and generate the manifest
4. Deploy to the Tensorify plugin registry
5. Share with the community!

Ready to build amazing plugins for Tensorify? Get started now! 🎉
