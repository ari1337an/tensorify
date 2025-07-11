# @tensorify.io/sdk

> **TypeScript SDK for developing Tensorify plugins with comprehensive validation, base classes, and publishing tools.**

The Tensorify SDK provides everything you need to create, validate, and publish machine learning plugins for the Tensorify ecosystem.

## 🚀 Quick Start

### Installation

```bash
npm install @tensorify.io/sdk
```

### Create Your First Plugin

1. **Initialize plugin structure:**

   ```bash
   mkdir my-plugin && cd my-plugin
   npm init -y
   npm install @tensorify.io/sdk
   ```

2. **Create required files:**

   ```
   my-plugin/
   ├── package.json
   ├── manifest.json
   ├── icon.svg
   ├── index.ts
   └── dist/
   ```

3. **Configure package.json:**

   ```json
   {
     "name": "@your-namespace/my-plugin",
     "version": "1.0.0",
     "main": "dist/index.js",
     "scripts": {
       "build": "tsc"
     },
     "tensorify-settings": {
       "sdk-version": "0.0.1"
     },
     "keywords": ["tensorify", "plugin", "ml"],
     "author": "Your Name",
     "repository": {
       "type": "git",
       "url": "https://github.com/your-username/my-plugin"
     }
   }
   ```

4. **Create manifest.json:**

   ```json
   {
     "name": "@your-namespace/my-plugin",
     "version": "1.0.0",
     "description": "My awesome Tensorify plugin",
     "author": "Your Name",
     "main": "dist/index.js",
     "entrypointClassName": "MyPluginNode",
     "keywords": ["tensorify", "plugin"],
     "scripts": {
       "build": "tsc"
     },
     "tensorifySettings": {
       "sdkVersion": "0.0.1"
     }
   }
   ```

5. **Create your plugin class (index.ts):**

   ```typescript
   import { INode, NodeType, LayerSettings } from "@tensorify.io/sdk";

   export default class MyPluginNode implements INode {
     readonly name = "MyPlugin";
     readonly nodeType = NodeType.CUSTOM;
     readonly inputLines = 1;
     readonly outputLinesCount = 1;
     readonly secondaryInputLinesCount = 0;
     readonly translationTemplate = "my_plugin_template";
     readonly settings: LayerSettings = {};

     getTranslationCode(settings: LayerSettings): string {
       return `# My Plugin Implementation
   result = my_plugin_function(input_data)`;
     }

     validateSettings(settings: LayerSettings): boolean {
       // Add your validation logic here
       return true;
     }

     getDependencies(): string[] {
       return ["numpy", "torch"];
     }

     getImports(): string[] {
       return ["import torch", "import numpy as np"];
     }
   }
   ```

6. **Build and validate:**
   ```bash
   npm run build
   npx tensorify validate  # Validates your plugin structure
   ```

## 📚 Core Concepts

### Plugin Structure Requirements

Every Tensorify plugin must have:

- **index.ts**: Main plugin file with default export implementing `INode`
- **manifest.json**: Plugin metadata and configuration
- **icon.svg**: Plugin icon (SVG format)
- **package.json**: NPM package configuration with Tensorify settings

### Validation Rules

The SDK enforces these validation rules:

#### 📁 **File Requirements**

- ✅ `index.ts` exists
- ✅ `manifest.json` exists
- ✅ `icon.svg` exists
- ✅ `package.json` exists

#### 📝 **manifest.json Schema**

```typescript
{
  name: string;           // Plugin name
  version: string;        // Semantic version (e.g., "1.0.0")
  description: string;    // Plugin description
  author: string;         // Author name
  main: string;          // Entry point file
  entrypointClassName: string; // Exported class name
  keywords: string[];     // Keywords array
  repository?: {          // Git repository (required for public plugins)
    type: "git";
    url: string;
  };
  scripts: {
    build: string;        // Build script
  };
  tensorifySettings: {
    sdkVersion: string;   // SDK version compatibility
  };
}
```

#### 📦 **package.json Requirements**

```typescript
{
  name: string;           // Package name
  version: string;        // Semantic version
  main: string;          // Entry point
  author: string;         // Author
  keywords: string[];     // Keywords
  scripts: {
    build: string;        // Build script required
  };
  "tensorify-settings": {
    "sdk-version": string; // Must match current SDK version
  };
  private?: boolean;      // Access level
  repository?: {          // Required for public plugins
    type: "git";
    url: string;
  };
}
```

#### 🏗️ **Class Requirements**

- ✅ Single default export class
- ✅ Class name matches `manifest.json` `entrypointClassName`
- ✅ Implements `INode` interface

## 🛠️ SDK API Reference

### Interfaces

#### INode Interface

The core interface all plugin classes must implement:

```typescript
interface INode<TSettings extends LayerSettings = LayerSettings> {
  readonly name: string;
  readonly translationTemplate: string;
  readonly inputLines: number;
  readonly outputLinesCount: number;
  readonly secondaryInputLinesCount: number;
  readonly nodeType: NodeType;
  readonly settings: TSettings;
  readonly child?: Children;

  getTranslationCode(
    settings: TSettings,
    children?: Children,
    context?: CodeGenerationContext
  ): string;

  validateSettings?(settings: TSettings): boolean;
  getDependencies?(): string[];
  getImports?(context?: CodeGenerationContext): string[];
}
```

#### NodeType Enum

```typescript
enum NodeType {
  CUSTOM = "custom",
  TRAINER = "trainer",
  EVALUATOR = "evaluator",
  MODEL = "model",
  MODEL_LAYER = "model_layer",
  DATALOADER = "dataloader",
  OPTIMIZER = "optimizer",
  REPORT = "report",
  FUNCTION = "function",
  PIPELINE = "pipeline",
  AUGMENTATION_STACK = "augmentation_stack",
  PREPROCESSOR = "preprocessor",
  POSTPROCESSOR = "postprocessor",
  LOSS_FUNCTION = "loss_function",
  METRIC = "metric",
  SCHEDULER = "scheduler",
  REGULARIZER = "regularizer",
}
```

### Base Classes

The SDK provides base classes to extend:

#### BaseNode

```typescript
import { BaseNode } from "@tensorify.io/sdk";

export default class MyPlugin extends BaseNode {
  constructor() {
    super({
      name: "MyPlugin",
      nodeType: NodeType.CUSTOM,
      inputLines: 1,
      outputLinesCount: 1,
    });
  }

  getTranslationCode(settings: LayerSettings): string {
    return "# Custom implementation";
  }
}
```

#### ModelLayerNode

For neural network layers:

```typescript
import { ModelLayerNode, ModelLayerSettings } from "@tensorify.io/sdk";

interface MyLayerSettings extends ModelLayerSettings {
  units: number;
  activation: string;
}

export default class MyLayerNode extends ModelLayerNode<MyLayerSettings> {
  readonly settings: MyLayerSettings = {
    units: 64,
    activation: "relu",
  };

  getTranslationCode(settings: MyLayerSettings): string {
    return `torch.nn.Linear(${settings.units})`;
  }
}
```

### Validation API

#### Manual Validation

```typescript
import { validatePlugin, PluginValidator } from "@tensorify.io/sdk";

// Simple validation
const result = await validatePlugin("/path/to/plugin");
if (!result.valid) {
  console.error("Validation failed:", result.errors);
}

// Advanced validation with custom SDK version
const validator = new PluginValidator("/path/to/plugin", "0.0.1");
const detailedResult = await validator.validatePlugin();
console.log(validator.getValidationReport(detailedResult));
```

#### Schema Validation

```typescript
import { ManifestSchema, PackageJsonSchema } from "@tensorify.io/sdk";

// Validate manifest.json
try {
  const manifest = ManifestSchema.parse(manifestData);
  console.log("Manifest is valid:", manifest);
} catch (error) {
  console.error("Manifest validation failed:", error.issues);
}

// Validate package.json
try {
  const pkg = PackageJsonSchema.parse(packageData);
  console.log("Package.json is valid:", pkg);
} catch (error) {
  console.error("Package.json validation failed:", error.issues);
}
```

## 🎯 Publishing Workflow

### Using Tensorify CLI

1. **Install CLI:**

   ```bash
   npm install -g @tensorify.io/cli
   ```

2. **Login:**

   ```bash
   tensorify login
   ```

3. **Validate plugin:**

   ```bash
   tensorify validate
   ```

4. **Publish:**

   ```bash
   # Public plugin (requires repository URL)
   tensorify publish --access=public

   # Private plugin
   tensorify publish --access=private
   ```

### Publishing Process

The publishing process includes:

1. **🔍 Validation**: SDK rules enforcement
2. **🏗️ Build**: TypeScript compilation
3. **📦 Bundle**: ESBuild bundling
4. **✅ Version Check**: Conflict detection
5. **📤 Upload**: File upload to S3
6. **🔔 Webhook**: Registry notification

### Access Control

- **Public Plugins**: Require git repository URL, visible to all users
- **Private Plugins**: Require `"private": true` in package.json, restricted access
- **Version Consistency**: Cannot change access level between versions

## 🔧 Development Tools

### Local Development

```typescript
import { BaseNode, NodeType } from "@tensorify.io/sdk";

export default class DevelopmentNode extends BaseNode {
  constructor() {
    super({
      name: "Development",
      nodeType: NodeType.CUSTOM,
      inputLines: 1,
      outputLinesCount: 1,
    });
  }

  getTranslationCode(settings: any): string {
    // Your development code here
    return `print("Development mode")`;
  }

  // Override for development
  validateSettings(settings: any): boolean {
    console.log("Development validation:", settings);
    return true;
  }
}
```

### Testing

```typescript
import { validatePlugin } from "@tensorify.io/sdk";

describe("My Plugin", () => {
  it("should validate correctly", async () => {
    const result = await validatePlugin("./");
    expect(result.valid).toBe(true);
  });

  it("should generate correct code", () => {
    const plugin = new MyPluginNode();
    const code = plugin.getTranslationCode({});
    expect(code).toContain("expected_output");
  });
});
```

## 🌟 Advanced Examples

### Complex Plugin with Multiple Inputs

```typescript
import { INode, NodeType, LayerSettings, Children } from "@tensorify.io/sdk";

interface ComplexSettings extends LayerSettings {
  algorithm: "auto" | "manual";
  parameters: Record<string, any>;
}

export default class ComplexPlugin implements INode<ComplexSettings> {
  readonly name = "ComplexPlugin";
  readonly nodeType = NodeType.FUNCTION;
  readonly inputLines = 2;
  readonly outputLinesCount = 1;
  readonly secondaryInputLinesCount = 1;
  readonly translationTemplate = "complex_template";
  readonly settings: ComplexSettings = {
    algorithm: "auto",
    parameters: {},
  };

  getTranslationCode(
    settings: ComplexSettings,
    children?: Children,
    context?: any
  ): string {
    const params = JSON.stringify(settings.parameters);
    return `
# Complex Plugin Implementation
primary_input = input_data[0]
secondary_input = input_data[1]
additional_input = input_data[2]

result = complex_algorithm(
    primary_input,
    secondary_input, 
    additional_input,
    algorithm="${settings.algorithm}",
    parameters=${params}
)`;
  }

  validateSettings(settings: ComplexSettings): boolean {
    if (!["auto", "manual"].includes(settings.algorithm)) {
      throw new Error('Algorithm must be "auto" or "manual"');
    }
    return true;
  }

  getDependencies(): string[] {
    return ["numpy", "scipy", "torch"];
  }

  getImports(): string[] {
    return ["import numpy as np", "import scipy", "import torch"];
  }
}
```

### Plugin with Dynamic Dependencies

```typescript
import { BaseNode, NodeType, LayerSettings } from "@tensorify.io/sdk";

interface DynamicSettings extends LayerSettings {
  backend: "torch" | "tensorflow" | "jax";
  optimization_level: number;
}

export default class DynamicPlugin extends BaseNode<DynamicSettings> {
  readonly settings: DynamicSettings = {
    backend: "torch",
    optimization_level: 1,
  };

  constructor() {
    super({
      name: "DynamicPlugin",
      nodeType: NodeType.MODEL_LAYER,
      inputLines: 1,
      outputLinesCount: 1,
    });
  }

  getTranslationCode(settings: DynamicSettings): string {
    switch (settings.backend) {
      case "torch":
        return `result = torch.nn.functional.dynamic_op(input_data, level=${settings.optimization_level})`;
      case "tensorflow":
        return `result = tf.nn.dynamic_op(input_data, level=${settings.optimization_level})`;
      case "jax":
        return `result = jax.nn.dynamic_op(input_data, level=${settings.optimization_level})`;
      default:
        throw new Error(`Unsupported backend: ${settings.backend}`);
    }
  }

  getDependencies(): string[] {
    const { backend } = this.settings;
    const base = ["numpy"];

    switch (backend) {
      case "torch":
        return [...base, "torch", "torchvision"];
      case "tensorflow":
        return [...base, "tensorflow"];
      case "jax":
        return [...base, "jax", "jaxlib"];
      default:
        return base;
    }
  }

  getImports(context?: any): string[] {
    const { backend } = this.settings;

    switch (backend) {
      case "torch":
        return ["import torch", "import torch.nn.functional as F"];
      case "tensorflow":
        return ["import tensorflow as tf"];
      case "jax":
        return ["import jax", "import jax.numpy as jnp"];
      default:
        return ["import numpy as np"];
    }
  }
}
```

## 🏷️ Version Management

### SDK Version Compatibility

The SDK uses semantic versioning. Plugins must specify compatible SDK versions:

```json
{
  "tensorify-settings": {
    "sdk-version": "0.0.1"
  }
}
```

### Plugin Versioning

- Follow semantic versioning: `MAJOR.MINOR.PATCH`
- Cannot republish existing versions
- Cannot change access level between versions
- Each version is immutable once published

## 🔒 Security & Best Practices

### Code Security

- Validate all inputs in `validateSettings()`
- Sanitize user-provided data
- Avoid dynamic code execution
- Use type-safe interfaces

### Performance

- Minimize dependencies
- Use efficient algorithms
- Cache expensive computations
- Profile code generation

### Maintainability

- Document all public methods
- Use descriptive variable names
- Follow TypeScript best practices
- Write comprehensive tests

## 🆘 Troubleshooting

### Common Issues

**❌ "Plugin validation failed"**

```bash
# Check validation details
npx tensorify validate --verbose

# Common fixes:
# 1. Ensure all required files exist
# 2. Check class name matches manifest
# 3. Verify package.json structure
```

**❌ "SDK version mismatch"**

```json
// Update package.json
{
  "tensorify-settings": {
    "sdk-version": "0.0.1" // Match current SDK version
  }
}
```

**❌ "Build failed"**

```bash
# Ensure TypeScript is configured
npm install typescript --save-dev
npx tsc --init

# Check tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist"
  }
}
```

### Getting Help

- 📖 **Documentation**: [docs.tensorify.io](https://docs.tensorify.io)
- 💬 **Community**: [discord.gg/tensorify](https://discord.gg/tensorify)
- 🐛 **Issues**: [github.com/tensorify/sdk/issues](https://github.com/tensorify/sdk/issues)
- 📧 **Support**: support@tensorify.io

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the Tensorify Team**
