# @tensorify.io/sdk

TypeScript SDK for creating Tensorify plugins with comprehensive base classes, utilities, and full compatibility with both transpiler and plugin-engine systems.

## Features

- 🚀 **Universal Compatibility**: Works with both transpiler and plugin-engine systems
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🏗️ **Base Classes**: Specialized base classes for different plugin types
- 🛠️ **Rich Utilities**: Helper functions for common plugin development tasks
- 📦 **Plugin-Engine Ready**: Built-in support for flexible entry points
- 🔧 **Developer Friendly**: Comprehensive documentation and examples
- ⚡ **Performance Optimized**: Efficient code generation patterns
- 🧪 **Testing Support**: Easy to test plugin implementations

## Installation

```bash
npm install @tensorify.io/sdk
```

## Quick Start

### Creating a Simple Linear Layer Plugin

```typescript
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface LinearSettings extends ModelLayerSettings {
  inFeatures: number;
  outFeatures: number;
  bias?: boolean;
}

export class LinearLayer extends ModelLayerNode<LinearSettings> {
  public readonly name = "Linear Layer";
  public readonly translationTemplate =
    "torch.nn.Linear({in_features}, {out_features}{optional_params})";

  public readonly settings: LinearSettings = {
    inFeatures: 784,
    outFeatures: 128,
    bias: true,
  };

  public getTranslationCode(settings: LinearSettings): string {
    this.validateRequiredParams(settings, ["inFeatures", "outFeatures"]);

    const requiredParams = {
      inFeatures: settings.inFeatures,
      outFeatures: settings.outFeatures,
    };

    const optionalParams = {
      bias: settings.bias ?? true,
    };

    return this.buildLayerConstructor(
      "torch.nn.Linear",
      requiredParams,
      { bias: true }, // defaults to exclude
      settings
    );
  }
}

// Usage in transpiler
const layer = new LinearLayer();
const code = layer.getTranslationCode({
  inFeatures: 784,
  outFeatures: 128,
  bias: false,
});
console.log(code); // torch.nn.Linear(784, 128, bias=False)

// Usage in plugin-engine (automatic)
const pluginCode = layer.processPayload({
  inFeatures: 784,
  outFeatures: 128,
  bias: false,
});
```

### Creating a Data Loader Plugin

```typescript
import { DataNode, DataSettings } from "@tensorify.io/sdk";

interface DataLoaderSettings extends DataSettings {
  datasetVariable: string;
  batchSize: number;
  shuffle?: boolean;
}

export class DataLoaderPlugin extends DataNode<DataLoaderSettings> {
  public readonly name = "PyTorch DataLoader";
  public readonly translationTemplate =
    "DataLoader({dataset}, batch_size={batch_size}{optional_params})";

  public readonly settings: DataLoaderSettings = {
    datasetVariable: "dataset",
    batchSize: 32,
    shuffle: true,
  };

  public getTranslationCode(settings: DataLoaderSettings): string {
    this.validateRequiredParams(settings, ["datasetVariable", "batchSize"]);

    return this.buildDataLoaderConstructor(settings.datasetVariable, settings);
  }
}
```

### Creating a Training Plugin

```typescript
import { TrainerNode, TrainerSettings } from "@tensorify.io/sdk";

interface SimpleTrainerSettings extends TrainerSettings {
  epochs: number;
  learningRate: number;
}

export class SimpleTrainer extends TrainerNode<SimpleTrainerSettings> {
  public readonly name = "Simple Trainer";
  public readonly translationTemplate = "train_model({model}, {epochs}, {lr})";

  public readonly settings: SimpleTrainerSettings = {
    epochs: 10,
    learningRate: 0.001,
    modelVariable: "model",
    optimizerVariable: "optimizer",
    lossFunctionVariable: "criterion",
    dataloaderVariable: "train_loader",
  };

  public getTranslationCode(settings: SimpleTrainerSettings): string {
    const trainingLoop = `
for epoch in range(${settings.epochs}):
    for batch_idx, (data, target) in enumerate(${settings.dataloaderVariable}):
        ${settings.optimizerVariable}.zero_grad()
        output = ${settings.modelVariable}(data)
        loss = ${settings.lossFunctionVariable}(output, target)
        loss.backward()
        ${settings.optimizerVariable}.step()
    `;

    return trainingLoop.trim();
  }
}
```

## Base Classes

### BaseNode

The foundation class for all plugins providing:

- Universal compatibility with transpiler and plugin-engine
- Common utility methods
- Validation helpers
- Entry point management

### ModelLayerNode

Specialized for neural network layers:

- PyTorch/TensorFlow import management
- Layer constructor building utilities
- Parameter validation for layer settings

### TrainerNode

Specialized for training workflows:

- Training loop construction helpers
- Optimizer and loss function integration
- Epoch and batch management utilities

### DataNode

Specialized for data handling:

- DataLoader and Dataset construction
- Data transformation utilities
- Batch and shuffle management

## Plugin-Engine Compatibility

All SDK-based plugins automatically work with the plugin-engine's flexible entry point system:

```typescript
// Your plugin class
export class MyPlugin extends BaseNode<MySettings> {
  // ... implementation
}

// Automatic entry points available:
// - MyPlugin.getTranslationCode
// - MyPlugin.processPayload
// - MyPlugin.validateSettings
// - Any custom methods you add

// Plugin-engine usage:
const result = await engine.getExecutionResult(
  "my-plugin",
  { setting1: "value", setting2: 42 },
  "MyPlugin.getTranslationCode"
);
```

## Entry Points and Manifests

The SDK automatically generates plugin manifests with entry point information:

```typescript
export class MyPlugin extends BaseNode<MySettings> {
  // Override to add custom entry points
  public getEntryPoints(): Record<string, string> {
    return {
      ...super.getEntryPoints(),
      customMethod: "My custom processing method",
      anotherMethod: "Another way to use this plugin",
    };
  }

  // Custom entry point
  public customMethod(payload: PluginPayload): string {
    // Custom logic here
    return this.processPayload(payload);
  }
}
```

## Utilities

The SDK provides many utility functions:

```typescript
import {
  generateVariableName,
  sanitizeVariableName,
  formatPythonCode,
  buildImports,
  validateTensorDimensions,
} from "@tensorify.io/sdk";

// Generate unique variable names
const varName = generateVariableName("model"); // model_abc123

// Sanitize user input
const cleanName = sanitizeVariableName("my-model!"); // my_model_

// Format Python code
const code = formatPythonCode(`
def train():
for epoch in range(10):
print(f"Epoch {epoch}")
`);

// Build import statements
const imports = buildImports(["torch", "torch.nn", "numpy"]);
```

## TypeScript Integration

Full TypeScript support with comprehensive types:

```typescript
import {
  IUniversalNode,
  LayerSettings,
  PluginPayload,
} from "@tensorify.io/sdk";

// Type-safe plugin development
interface MySettings extends LayerSettings {
  requiredParam: string;
  optionalParam?: number;
}

// Type-safe payload handling
function processPayload(payload: PluginPayload): string {
  // payload is properly typed
  return `Processing: ${payload.data}`;
}
```

## Testing

SDK plugins are easy to test:

```typescript
import { LinearLayer } from "./LinearLayer";

describe("LinearLayer", () => {
  it("should generate correct PyTorch code", () => {
    const layer = new LinearLayer();
    const code = layer.getTranslationCode({
      inFeatures: 784,
      outFeatures: 128,
      bias: false,
    });

    expect(code).toBe("torch.nn.Linear(784, 128, bias=False)");
  });

  it("should work with plugin-engine payload", () => {
    const layer = new LinearLayer();
    const code = layer.processPayload({
      inFeatures: 784,
      outFeatures: 128,
      bias: false,
    });

    expect(code).toBe("torch.nn.Linear(784, 128, bias=False)");
  });
});
```

## Migration from Legacy Plugins

Migrating existing plugins to use the SDK:

### Before (Legacy)

```javascript
class MyPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        return `some_function(${settings.param})`;
      },
    };
  }
}
```

### After (SDK)

```typescript
import { BaseNode, LayerSettings } from "@tensorify.io/sdk";

interface MySettings extends LayerSettings {
  param: string;
}

export class MyPlugin extends BaseNode<MySettings> {
  public readonly name = "My Plugin";
  public readonly translationTemplate = "some_function({param})";
  public readonly inputLines = 0;
  public readonly outputLinesCount = 1;
  public readonly secondaryInputLinesCount = 0;
  public readonly nodeType = NodeType.CUSTOM;

  public readonly settings: MySettings = {
    param: "default",
  };

  public getTranslationCode(settings: MySettings): string {
    return `some_function(${this.stringifyParameter(settings.param)})`;
  }
}
```

## Advanced Features

### Custom Validation

```typescript
export class MyPlugin extends BaseNode<MySettings> {
  public validateSettings(settings: MySettings): boolean {
    super.validateSettings(settings);

    if (settings.customParam < 0) {
      throw new Error("customParam must be non-negative");
    }

    return true;
  }
}
```

### Framework-Specific Code Generation

```typescript
export class UniversalLayer extends ModelLayerNode<MySettings> {
  public getTranslationCode(
    settings: MySettings,
    children?: Children,
    context?: CodeGenerationContext
  ): string {
    const framework = context?.framework || "pytorch";

    switch (framework) {
      case "pytorch":
        return `torch.nn.Linear(${settings.inFeatures}, ${settings.outFeatures})`;
      case "tensorflow":
        return `tf.keras.layers.Dense(${settings.outFeatures}, input_shape=(${settings.inFeatures},))`;
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }
  }
}
```

### Custom Imports and Dependencies

```typescript
export class MyPlugin extends BaseNode<MySettings> {
  public getDependencies(): string[] {
    return ["torch", "numpy", "sklearn"];
  }

  public getImports(context?: CodeGenerationContext): string[] {
    return [
      "import torch",
      "import numpy as np",
      "from sklearn.preprocessing import StandardScaler",
    ];
  }
}
```

## Best Practices

1. **Use Specific Base Classes**: Choose ModelLayerNode, TrainerNode, or DataNode when appropriate
2. **Validate Settings**: Always validate input parameters
3. **Handle Defaults**: Provide sensible default values
4. **Type Everything**: Use TypeScript interfaces for settings
5. **Test Thoroughly**: Test both transpiler and plugin-engine usage
6. **Document Entry Points**: Provide clear descriptions for all entry points
7. **Follow Conventions**: Use consistent naming and parameter patterns

## Examples

See the `/examples` directory for complete plugin examples:

- Basic Linear Layer
- Convolutional Layer with complex parameters
- Custom Dataset handler
- Training pipeline
- Model evaluation metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Update documentation
5. Submit a pull request

## License

ISC

---

**Made with ❤️ for the Tensorify ecosystem**
