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

// Execute plugin
const result = await engine.getExecutionResult("my-plugin", {
  inputData: "test",
  parameters: { threshold: 0.5 },
});

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

const result = await engine.getExecutionResult("tensorflow-plugin", {
  type: "tensorflow",
  layers: ["dense", "dropout"],
  epochs: 100,
});

console.log("Generated code:", result.code);
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

## Plugin Structure

Plugins must follow this structure in S3:

```
bucket/
├── plugin-name-1/
│   └── index.js
├── plugin-name-2/
│   └── index.js
└── plugin-name-3/
    └── index.js
```

Each `index.js` must export a class with this structure:

```javascript
class MyPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        // Your plugin logic here
        // settings contains the data passed from the execution call

        // Example: Generate Python code
        return `
import pandas as pd
import numpy as np

# Generated code based on settings: ${JSON.stringify(settings)}
data = pd.read_csv('${settings.dataset || "data.csv"}')
result = data.head(${settings.rows || 10})
print(result)
        `.trim();
      },
    };
  }
}

module.exports = MyPlugin;
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
  const result = await engine.getExecutionResult("my-plugin", {});
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
  engine.getExecutionResult("data-preprocessor", { dataset: "users.csv" }),
  engine.getExecutionResult("ml-trainer", { algorithm: "random-forest" }),
  engine.getExecutionResult("result-analyzer", { threshold: 0.85 }),
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
    const result = await testEngine.getExecutionResult("test-plugin", {
      test: true,
    });
    expect(result.code).toContain("test output");
  });
});
```

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

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
  const result = await engine.getExecutionResult(pluginId, settings);
  // Process result
}

// Don't forget to cleanup
await engine.dispose();
```

## Development

### Building

```bash
# Build the package
npm run build

# Watch for changes
npm run build:watch

# Type checking
npm run type-check
```

### Linting

```bash
# Check for linting issues
npm run lint

# Fix linting issues
npm run lint:fix
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
