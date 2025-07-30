# @tensorify.io/plugin-engine

A professional TypeScript library for executing Tensorify plugins in isolated environments with comprehensive type safety, dependency injection, and a clean, user-friendly API.

## Features

- 🚀 **High Performance**: Execute plugins in isolated VMs with configurable memory and timeout limits
- 🔒 **Secure Execution**: Isolated VM environment prevents plugins from accessing host system
- 🎯 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🏗️ **Clean Architecture**: Dependency injection with service interfaces for maximum testability
- 📦 **S3 Integration**: Direct S3Client compatibility with explicit configuration
- 🛠️ **Professional API**: Single, clean API that follows library best practices
- ⚡ **Explicit Configuration**: Users control their own environment variables and configuration
- 🧪 **Testable**: Mockable interfaces and testing utilities included
- 🌐 **S3-Compatible**: Works with AWS S3, MinIO, LocalStack, and other S3-compatible services
- 🎪 **Flexible Entry Points**: Support for simple functions, class methods, and nested object methods

## Installation

```bash
npm install @tensorify.io/plugin-engine
```

### Peer Dependencies

The package requires AWS S3 client as a peer dependency:

```bash
npm install @aws-sdk/client-s3
```

## Quick Start

The plugin engine has a single, clean API that takes explicit S3 configuration:

```typescript
import { createPluginEngine } from "@tensorify.io/plugin-engine";

// Users handle their own environment variables
const s3Config = {
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: process.env.S3_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        sessionToken: process.env.S3_SESSION_TOKEN,
      }
    : undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT,
};

// Create engine
const engine = createPluginEngine(s3Config, "my-plugins-bucket", {
  debug: true,
  executionTimeout: 60000,
  memoryLimit: 256,
});

// Execute plugin with flexible entry points
const result = await engine.getExecutionResult(
  "my-plugin:1.0.0",
  {
    inputData: "test",
    parameters: { threshold: 0.5 },
  },
  "processData" // Simple function
);

// Or call class methods
const classResult = await engine.getExecutionResult(
  "my-plugin:1.0.0",
  { data: "example" },
  "DataProcessor.transform" // Class method
);

// Or nested object methods
const nestedResult = await engine.getExecutionResult(
  "my-plugin:1.0.0",
  { config: "advanced" },
  "handlers.data.process" // Nested method
);

console.log(result.code); // Generated code
console.log(result.metadata); // Execution metadata

// Cleanup
await engine.dispose();
```

## API Reference

### `createPluginEngine(s3Config, bucketName, options?)`

The main function to create a plugin engine instance.

**Parameters:**

- `s3Config`: S3 configuration object (maps directly to S3Client constructor options)
- `bucketName`: S3 bucket name where plugins are stored
- `options`: Optional engine configuration

**Returns:** `PluginEngine` instance

### `engine.getExecutionResult(pluginSlug, payload, entryPointString)`

Execute a plugin with specified data and entry point.

**Parameters:**

- `pluginSlug`: Unique identifier for the plugin (e.g., "my-plugin:1.0.0")
- `payload`: Data to pass to the plugin (any JSON-serializable object)
- `entryPointString`: Entry point to execute. Supports:
  - Simple functions: `"processData"`
  - Class methods: `"DataProcessor.transform"`
  - Nested methods: `"handlers.data.process"`
  - Multiple levels: `"services.ml.models.predict"`

**Returns:** Promise resolving to `PluginExecutionResult`

#### Entry Point Examples

```typescript
// Simple function calls
await engine.getExecutionResult(pluginSlug, data, "sum");
await engine.getExecutionResult(pluginSlug, data, "processData");

// Class methods (auto-instantiated)
await engine.getExecutionResult(pluginSlug, data, "Calculator.add");
await engine.getExecutionResult(pluginSlug, data, "DataProcessor.transform");

// Nested object methods
await engine.getExecutionResult(pluginSlug, data, "utils.math.calculate");
await engine.getExecutionResult(pluginSlug, data, "handlers.data.process");

// Deep nesting
await engine.getExecutionResult(pluginSlug, data, "services.ml.models.predict");
```

## Configuration

### S3 Configuration

The S3 configuration object maps directly to the S3Client constructor options from `@aws-sdk/client-s3`:

```typescript
interface S3Config {
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
  };
  endpoint?: string; // For custom endpoints (MinIO, LocalStack)
  forcePathStyle?: boolean; // Required for custom endpoints
  // ... all other S3ClientConfig options
}
```

### Engine Options

```typescript
interface PluginEngineOptions {
  basePath?: string; // Optional base path for plugins in S3
  executionTimeout?: number; // Execution timeout in ms (default: 30000)
  memoryLimit?: number; // Memory limit in MB (default: 128)
  debug?: boolean; // Enable debug logging (default: false)
}
```

## Usage Examples

### Basic Usage with Credentials

```typescript
import { createPluginEngine } from "@tensorify.io/plugin-engine";

const engine = createPluginEngine(
  {
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  },
  "my-plugins-bucket",
  {
    debug: true,
    executionTimeout: 60000,
  }
);

// Simple function call
const result1 = await engine.getExecutionResult(
  "data-plugin:2.1.0",
  {
    dataset: "users.csv",
    operation: "filter",
    criteria: { age: ">= 18" },
  },
  "filterData"
);

// Class method call
const result2 = await engine.getExecutionResult(
  "ml-plugin:1.5.0",
  {
    algorithm: "random-forest",
    features: ["age", "income"],
    target: "purchase",
  },
  "MLModel.train"
);

console.log("Filtered data code:", result1.code);
console.log("ML training code:", result2.code);
await engine.dispose();
```

### Development with MinIO

```typescript
const engine = createPluginEngine(
  {
    endpoint: "http://localhost:9000",
    forcePathStyle: true,
    credentials: {
      accessKeyId: "minioadmin",
      secretAccessKey: "minioadmin",
    },
  },
  "dev-plugins",
  {
    debug: true,
    executionTimeout: 15000,
  }
);
```

### Production Configuration

```typescript
const engine = createPluginEngine(
  {
    region: "us-west-2",
    credentials: {
      accessKeyId: process.env.PROD_ACCESS_KEY_ID!,
      secretAccessKey: process.env.PROD_SECRET_ACCESS_KEY!,
    },
  },
  "production-plugins",
  {
    debug: false,
    executionTimeout: 120000,
    memoryLimit: 512,
    basePath: "plugins/v1",
  }
);
```

### Environment Variable Handling

Users control their own environment variables:

```typescript
// Example of how users can handle environment variables
const s3Config = {
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: process.env.S3_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        sessionToken: process.env.S3_SESSION_TOKEN,
      }
    : undefined,
  forcePathStyle: !!process.env.S3_ENDPOINT,
};

const engine = createPluginEngine(s3Config, "my-bucket", {
  debug: process.env.NODE_ENV === "development",
});
```

## Plugin Management

### Check Plugin Availability

```typescript
const exists = await engine.pluginExists("my-plugin");
if (exists) {
  console.log("Plugin is available");
}
```

### List Available Plugins

```typescript
const plugins = await engine.listAvailablePlugins(50);
console.log("Available plugins:", plugins);
```

### Get Plugin Metadata

```typescript
const metadata = await engine.getPluginMetadata("my-plugin");
console.log("Plugin size:", metadata.size);
console.log("Last modified:", metadata.lastModified);
```

### Get Plugin Source Code

```typescript
const sourceCode = await engine.getPluginCode("my-plugin");
console.log("Plugin source:", sourceCode);
```

### Get Plugin Manifest

```typescript
const manifest = await engine.getPluginManifest("my-plugin");
console.log("Plugin name:", manifest.name);
console.log("Plugin version:", manifest.version);
console.log("Plugin description:", manifest.description);
console.log("Required parameters:", manifest.parameters);
```

## Plugin Structure

Plugins must follow this structure in S3:

```
bucket/
├── plugin-name-1/
│   ├── index.js
│   └── manifest.json
├── plugin-name-2/
│   ├── index.js
│   └── manifest.json
└── plugin-name-3/
    ├── index.js
    └── manifest.json
```

### Required Files

**Both files are required for a plugin to be considered valid:**

1. **`index.js`** - The main plugin implementation
2. **`manifest.json`** - Plugin metadata and configuration

### Plugin Implementation (`index.js`)

Plugins support multiple export patterns:

#### Simple Function Export

```javascript
function processData(payload) {
  // Access payload data
  const { inputData, parameters } = payload;

  return `
import pandas as pd
import numpy as np

# Processing data: ${inputData}
# Parameters: ${JSON.stringify(parameters)}
data = pd.read_csv('${inputData}')
result = data.head(${parameters.rows || 10})
print(result)
  `.trim();
}

function sum(payload) {
  const { numbers } = payload;
  const total = numbers.reduce((a, b) => a + b, 0);
  return `result = ${total}`;
}

module.exports = { processData, sum };
```

#### Class-Based Export

```javascript
class DataProcessor {
  transform(payload) {
    const { data, operation } = payload;
    return `
# Data transformation: ${operation}
import pandas as pd
data = pd.DataFrame(${JSON.stringify(data)})
transformed = data.${operation}()
print(transformed)
    `.trim();
  }

  filter(payload) {
    const { criteria } = payload;
    return `data_filtered = data[data.${criteria}]`;
  }
}

class MLModel {
  train(payload) {
    const { algorithm, features } = payload;
    return `
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier()
X = data[${JSON.stringify(features)}]
model.fit(X, y)
    `.trim();
  }
}

module.exports = { DataProcessor, MLModel };
```

#### Nested Object Export

```javascript
const utils = {
  math: {
    calculate: (payload) => {
      const { operation, values } = payload;
      return `result = ${operation}(${values.join(", ")})`;
    },
  },
};

const handlers = {
  data: {
    process: (payload) => {
      return `# Processing ${payload.type} data`;
    },
  },
};

module.exports = { utils, handlers };
```

#### Mixed Export Pattern

```javascript
// Simple functions
function quickProcess(payload) {
  return `# Quick process: ${payload.type}`;
}

// Classes
class AdvancedProcessor {
  complexTransform(payload) {
    return `# Advanced transform with ${payload.algorithm}`;
  }
}

// Nested objects
const services = {
  ml: {
    models: {
      predict: (payload) => {
        return `prediction = model.predict(${JSON.stringify(
          payload.features
        )})`;
      },
    },
  },
};

module.exports = {
  quickProcess,
  AdvancedProcessor,
  services,
};
```

### Plugin Metadata (`manifest.json`)

Each `manifest.json` must contain plugin information:

```json
{
  "slug": "my-plugin",
  "name": "My Awesome Plugin",
  "version": "1.0.0",
  "description": "A plugin that does awesome things",
  "author": "Your Name",
  "engineVersion": "^0.0.1",
  "tags": ["machine-learning", "data-processing"],
  "category": "data-science",
  "dependencies": {
    "pandas": "^1.5.0",
    "numpy": "^1.24.0"
  },
  "entryPoints": {
    "processData": {
      "description": "Process input data with basic transformations",
      "parameters": {
        "inputData": {
          "type": "string",
          "required": true,
          "description": "Path to the dataset file"
        },
        "parameters": {
          "type": "object",
          "description": "Processing parameters"
        }
      }
    },
    "DataProcessor.transform": {
      "description": "Advanced data transformation using class methods",
      "parameters": {
        "data": {
          "type": "array",
          "required": true,
          "description": "Input data array"
        },
        "operation": {
          "type": "string",
          "required": true,
          "description": "Transformation operation"
        }
      }
    }
  }
}
```

## Error Handling

The library provides comprehensive error types for better debugging:

```typescript
import {
  PluginNotFoundError,
  ExecutionError,
  TimeoutError,
  MemoryLimitError,
  ConfigurationError,
} from "@tensorify.io/plugin-engine";

try {
  const result = await engine.getExecutionResult(
    "my-plugin",
    { data: "test" },
    "processData"
  );
} catch (error) {
  if (error instanceof PluginNotFoundError) {
    console.error("Plugin not found:", error.message);
    console.error("Bucket:", error.bucketName);
  } else if (error instanceof TimeoutError) {
    console.error("Execution timed out after:", error.timeoutMs, "ms");
  } else if (error instanceof MemoryLimitError) {
    console.error("Memory limit exceeded:", error.limitMB, "MB");
    console.error("Used memory:", error.usedMB, "MB");
  } else if (error instanceof ConfigurationError) {
    console.error("Configuration error:", error.message);
    console.error("Field:", error.configField);
  }
}
```

## Multiple Plugin Execution

```typescript
const engine = createPluginEngine(s3Config, "ml-plugins");

// Execute multiple plugins in parallel
const [dataResult, modelResult, analysisResult] = await Promise.all([
  engine.getExecutionResult(
    "data-preprocessor",
    { dataset: "users.csv" },
    "preprocessData"
  ),
  engine.getExecutionResult(
    "ml-trainer",
    { algorithm: "random-forest" },
    "MLTrainer.train"
  ),
  engine.getExecutionResult(
    "result-analyzer",
    { threshold: 0.85 },
    "analyzers.results.evaluate"
  ),
]);

console.log("Data processing:", dataResult.code);
console.log("Model training:", modelResult.code);
console.log("Analysis:", analysisResult.code);

await engine.dispose();
```

## Testing

### Unit Testing

```typescript
import { createPluginEngine } from "@tensorify.io/plugin-engine";

// Create engine for testing with LocalStack
const testEngine = createPluginEngine(
  {
    endpoint: "http://localhost:4566",
    forcePathStyle: true,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  },
  "test-bucket",
  {
    debug: true,
    executionTimeout: 5000,
  }
);

// Run tests
describe("Plugin Tests", () => {
  it("should execute test plugin", async () => {
    const result = await testEngine.getExecutionResult(
      "test-plugin",
      {
        test: true,
      },
      "processTest"
    );
    expect(result.code).toContain("test output");
  });

  it("should execute class method", async () => {
    const result = await testEngine.getExecutionResult(
      "test-plugin",
      { data: "example" },
      "TestClass.execute"
    );
    expect(result.code).toContain("executed");
  });
});
```

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
pnpm run test:coverage

# Run tests in watch mode
pnpm run test:watch
```

## Migration Guide

### From Settings-Based to Payload-Based API

**Old API (v0.x):**

```typescript
// Old way
const result = await engine.getExecutionResult(
  "my-plugin",
  {
    dataset: "data.csv",
    threshold: 0.5,
  },
  "codeGeneration.generateCode" // Fixed entry point
);

// Plugin had to implement codeGeneration.generateCode
class MyPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        // Fixed structure
      },
    };
  }
}
```

**New API (v1.x):**

```typescript
// New way - flexible entry points
const result = await engine.getExecutionResult(
  "my-plugin",
  {
    dataset: "data.csv",
    threshold: 0.5,
  },
  "processData" // Any function/method
);

// Plugin can export any structure
function processData(payload) {
  // Direct function
}

// Or class methods
class DataProcessor {
  processData(payload) {
    // Class method
  }
}

// Or nested methods
const handlers = {
  data: {
    process: (payload) => {
      // Nested method
    },
  },
};

module.exports = { processData, DataProcessor, handlers };
```

### Migration Steps

#### 1. Update Plugin Engine Usage

**Before:**

```typescript
const result = await engine.getExecutionResult(
  "data-plugin",
  { inputFile: "data.csv", operations: ["clean", "normalize"] },
  "codeGeneration.generateCode"
);
```

**After:**

```typescript
const result = await engine.getExecutionResult(
  "data-plugin",
  { inputFile: "data.csv", operations: ["clean", "normalize"] },
  "processData" // Choose your entry point
);
```

#### 2. Update Plugin Structure

**Before (Fixed Structure):**

```javascript
class DataPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        const { inputFile, operations } = settings;
        return `
import pandas as pd
data = pd.read_csv('${inputFile}')
# Apply operations: ${operations.join(", ")}
        `;
      },
    };
  }
}

module.exports = DataPlugin;
```

**After (Flexible Structure):**

```javascript
// Option 1: Simple function export
function processData(payload) {
  const { inputFile, operations } = payload;
  return `
import pandas as pd
data = pd.read_csv('${inputFile}')
# Apply operations: ${operations.join(", ")}
  `;
}

// Option 2: Class with methods
class DataProcessor {
  processData(payload) {
    const { inputFile, operations } = payload;
    return `
import pandas as pd
data = pd.read_csv('${inputFile}')
# Apply operations: ${operations.join(", ")}
    `;
  }

  cleanData(payload) {
    return "data.dropna().reset_index(drop=True)";
  }
}

// Option 3: Nested object structure
const dataHandlers = {
  csv: {
    read: (payload) => `pd.read_csv('${payload.file}')`,
    write: (payload) => `data.to_csv('${payload.output}')`,
  },
  json: {
    read: (payload) => `pd.read_json('${payload.file}')`,
    write: (payload) => `data.to_json('${payload.output}')`,
  },
};

module.exports = {
  processData,
  DataProcessor,
  dataHandlers,
};
```

#### 3. Update Manifest Entries

**Before:**

```json
{
  "slug": "data-plugin",
  "name": "Data Processing Plugin",
  "version": "1.0.0",
  "parameters": {
    "inputFile": {
      "type": "string",
      "required": true
    }
  }
}
```

**After:**

```json
{
  "slug": "data-plugin",
  "name": "Data Processing Plugin",
  "version": "2.0.0",
  "entryPoints": {
    "processData": {
      "description": "Process data with basic operations",
      "parameters": {
        "inputFile": {
          "type": "string",
          "required": true,
          "description": "Path to input data file"
        },
        "operations": {
          "type": "array",
          "description": "List of operations to apply"
        }
      }
    },
    "DataProcessor.processData": {
      "description": "Advanced data processing with class methods",
      "parameters": {
        "inputFile": {
          "type": "string",
          "required": true
        }
      }
    },
    "dataHandlers.csv.read": {
      "description": "Read CSV files specifically",
      "parameters": {
        "file": {
          "type": "string",
          "required": true,
          "description": "CSV file path"
        }
      }
    }
  }
}
```

### Common Migration Patterns

#### Pattern 1: Single Function Plugin

**Before:**

```javascript
class SimplePlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        return `result = ${settings.value * 2}`;
      },
    };
  }
}
module.exports = SimplePlugin;
```

**After:**

```javascript
function double(payload) {
  return `result = ${payload.value * 2}`;
}
module.exports = { double };
```

**Usage:**

```typescript
// Before
await engine.getExecutionResult(
  "plugin",
  { value: 5 },
  "codeGeneration.generateCode"
);

// After
await engine.getExecutionResult("plugin", { value: 5 }, "double");
```

#### Pattern 2: Multiple Functions Plugin

**Before:**

```javascript
class MathPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        switch (settings.operation) {
          case "add":
            return `result = ${settings.a} + ${settings.b}`;
          case "multiply":
            return `result = ${settings.a} * ${settings.b}`;
          default:
            return "result = 0";
        }
      },
    };
  }
}
module.exports = MathPlugin;
```

**After:**

```javascript
function add(payload) {
  return `result = ${payload.a} + ${payload.b}`;
}

function multiply(payload) {
  return `result = ${payload.a} * ${payload.b}`;
}

class Calculator {
  add(payload) {
    return `result = ${payload.a} + ${payload.b}`;
  }

  multiply(payload) {
    return `result = ${payload.a} * ${payload.b}`;
  }
}

module.exports = { add, multiply, Calculator };
```

**Usage:**

```typescript
// Before
await engine.getExecutionResult(
  "plugin",
  { operation: "add", a: 5, b: 3 },
  "codeGeneration.generateCode"
);

// After - multiple options
await engine.getExecutionResult("plugin", { a: 5, b: 3 }, "add");
await engine.getExecutionResult("plugin", { a: 5, b: 3 }, "Calculator.add");
```

#### Pattern 3: Complex Plugin with Categories

**Before:**

```javascript
class MLPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        if (settings.category === "preprocessing") {
          return this.generatePreprocessing(settings);
        } else if (settings.category === "training") {
          return this.generateTraining(settings);
        }
        return "";
      },
    };
  }

  generatePreprocessing(settings) {
    return `data = preprocess('${settings.data}')`;
  }

  generateTraining(settings) {
    return `model = train('${settings.algorithm}')`;
  }
}
module.exports = MLPlugin;
```

**After:**

```javascript
const preprocessing = {
  clean: (payload) => `data = clean('${payload.data}')`,
  normalize: (payload) => `data = normalize('${payload.data}')`,
  scale: (payload) => `data = scale('${payload.data}')`,
};

const training = {
  linear: (payload) =>
    `model = LinearRegression().fit(${payload.features}, ${payload.target})`,
  forest: (payload) =>
    `model = RandomForest(n_estimators=${payload.trees}).fit(X, y)`,
};

class MLPipeline {
  preprocess(payload) {
    return `data = preprocess('${payload.data}', method='${payload.method}')`;
  }

  train(payload) {
    return `model = train_model('${payload.algorithm}', data)`;
  }
}

module.exports = { preprocessing, training, MLPipeline };
```

**Usage:**

```typescript
// Before
await engine.getExecutionResult(
  "plugin",
  { category: "preprocessing", data: "file.csv" },
  "codeGeneration.generateCode"
);

// After - specific entry points
await engine.getExecutionResult(
  "plugin",
  { data: "file.csv" },
  "preprocessing.clean"
);

await engine.getExecutionResult(
  "plugin",
  { algorithm: "random_forest", features: "X", target: "y" },
  "MLPipeline.train"
);
```

### Breaking Changes Summary

1. **Entry Point**: Changed from fixed `"codeGeneration.generateCode"` to flexible entry points
2. **Parameter Name**: Changed from `settings` to `payload` in plugin functions
3. **Plugin Structure**: No longer requires specific class structure with `codeGeneration` property
4. **Manifest Format**: Added `entryPoints` section to describe available entry points
5. **Export Pattern**: Supports multiple export patterns (functions, classes, nested objects)

### Migration Checklist

- [ ] **Update plugin engine calls**: Replace `"codeGeneration.generateCode"` with specific entry points
- [ ] **Rename parameter**: Change `settings` to `payload` in plugin functions
- [ ] **Restructure plugins**: Move from class-based structure to flexible exports
- [ ] **Update manifests**: Add `entryPoints` section with entry point descriptions
- [ ] **Test entry points**: Verify all entry points work with new API
- [ ] **Update documentation**: Update plugin documentation to reflect new patterns
- [ ] **Version plugins**: Increment plugin versions to indicate breaking changes

### Benefits of Migration

1. **Flexibility**: Plugins can export any structure that makes sense for their use case
2. **Clarity**: Entry points are explicit and descriptive
3. **Maintainability**: Simpler plugin structure without forced class hierarchies
4. **Discoverability**: Entry points are documented in manifests
5. **Extensibility**: Easy to add new entry points without changing existing ones
6. **Performance**: More direct function calls without wrapper layers

## Performance Considerations

### Memory Management

```typescript
// Configure memory limits based on your plugins
const engine = createPluginEngine(s3Config, bucketName, {
  memoryLimit: 512, // MB - adjust based on plugin requirements
  executionTimeout: 60000, // 60 seconds
});
```

### Connection Pooling

```typescript
// Reuse the same engine instance for multiple executions
const engine = createPluginEngine(s3Config, bucketName);

// Execute multiple plugins efficiently
for (const pluginId of pluginIds) {
  const result = await engine.getExecutionResult(pluginId, payload, entryPoint);
  // Process result
}

// Don't forget to cleanup
await engine.dispose();
```

## Development

### Building

```bash
# Build the package
pnpm run build

# Watch for changes
pnpm run build:watch

# Type checking
pnpm run type-check
```

### Linting

```bash
# Check for linting issues
pnpm run lint

# Fix linting issues
pnpm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

## License

ISC

## Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/tensorify/backend/issues)
- Documentation: See examples in `/examples` directory
- TypeScript Support: Full type definitions included

---

**Made with ❤️ for the Tensorify ecosystem**
