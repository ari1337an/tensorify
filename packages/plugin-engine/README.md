# @tensorify.io/plugin-engine

A professional TypeScript library for executing Tensorify plugins in isolated environments with comprehensive type safety and dependency injection.

## Features

- 🚀 **High Performance**: Execute plugins in isolated VMs with configurable memory and timeout limits
- 🔒 **Secure Execution**: Isolated VM environment prevents plugins from accessing host system
- 🎯 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🏗️ **Dependency Injection**: Clean architecture with injectable storage and executor services
- 📦 **S3 Integration**: Built-in AWS S3 support for plugin storage
- 🛠️ **Configurable**: Extensive configuration options for different use cases
- ⚡ **Factory Pattern**: Easy setup with factory methods for common scenarios
- 🧪 **Testable**: Mockable interfaces for comprehensive testing

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

### Simple Usage

```typescript
import { getExecutionResult } from "@tensorify.io/plugin-engine";

// Execute a plugin with minimal setup
const result = await getExecutionResult("my-plugin", {
  inputData: "test input",
  parameters: { threshold: 0.5 },
});

console.log(result); // Generated code string
```

### Factory Pattern (Recommended)

```typescript
import { PluginEngineFactory } from "@tensorify.io/plugin-engine";

// Create engine with credentials
const engine = PluginEngineFactory.createWithCredentials("my-plugins-bucket", {
  accessKeyId: "your-access-key",
  secretAccessKey: "your-secret-key",
  region: "us-west-2",
});

// Execute plugin
const result = await engine.getExecutionResult("my-plugin", {
  inputData: "test",
});

console.log(result.code); // Generated code
console.log(result.metadata); // Execution metadata
```

### Advanced Configuration

```typescript
import {
  PluginEngineFactory,
  S3StorageService,
  IsolatedVMExecutorService,
} from "@tensorify.io/plugin-engine";
import { S3Client } from "@aws-sdk/client-s3";

// Custom S3 client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Create factory with custom configuration
const factory = new PluginEngineFactory({
  defaultBucketName: "my-plugins",
  defaultExecutionTimeout: 60000, // 60 seconds
  defaultMemoryLimit: 256, // 256 MB
  defaultDebug: true,
});

// Create engine with custom services
const storageService = new S3StorageService(s3Client);
const executorService = new IsolatedVMExecutorService({
  memoryLimit: 512,
  timeout: 30000,
  debug: true,
});

const engine = factory.createWithCustomServices(
  storageService,
  executorService,
  {
    bucketName: "my-plugins-bucket",
    basePath: "plugins/v1",
    debug: true,
  }
);

// Execute plugin
const result = await engine.getExecutionResult("advanced-plugin", {
  model: "gpt-4",
  temperature: 0.7,
});

// Cleanup
await engine.dispose();
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

Each `index.js` must export a class with the following structure:

```javascript
class MyPlugin {
  constructor() {
    this.codeGeneration = {
      generateCode: (settings) => {
        // Your plugin logic here
        return "generated code string";
      },
    };
  }
}

module.exports = MyPlugin;
```

## API Reference

### Main Functions

#### `getExecutionResult(pluginSlug, settings, options?)`

Execute a plugin with minimal configuration.

**Parameters:**

- `pluginSlug` (string): Unique identifier for the plugin
- `settings` (Record<string, any>): Settings to pass to the plugin
- `options` (object, optional): Configuration options

**Returns:** `Promise<string>` - The generated code

### Factory Methods

#### `PluginEngineFactory.createDefault(bucketName, region?, options?)`

Create engine with default AWS configuration.

#### `PluginEngineFactory.createWithCredentials(bucketName, credentials, options?)`

Create engine with explicit AWS credentials.

#### `PluginEngineFactory.createForTesting(bucketName, endpoint, options?)`

Create engine for testing with custom S3 endpoint (e.g., LocalStack, MinIO).

### Core Classes

#### `PluginEngine`

Main engine class for plugin execution.

**Methods:**

- `getExecutionResult(pluginSlug, settings)`: Execute a plugin
- `pluginExists(pluginSlug)`: Check if plugin exists
- `getPluginMetadata(pluginSlug)`: Get plugin metadata
- `listAvailablePlugins(maxResults?)`: List available plugins
- `dispose()`: Clean up resources

#### `S3StorageService`

AWS S3 implementation of storage service.

#### `IsolatedVMExecutorService`

Isolated VM implementation of executor service.

### Error Handling

The library provides comprehensive error types:

```typescript
import {
  PluginNotFoundError,
  ExecutionError,
  TimeoutError,
  MemoryLimitError,
  ConfigurationError,
} from "@tensorify.io/plugin-engine";

try {
  const result = await engine.getExecutionResult("nonexistent-plugin", {});
} catch (error) {
  if (error instanceof PluginNotFoundError) {
    console.error("Plugin not found:", error.message);
  } else if (error instanceof TimeoutError) {
    console.error("Execution timed out:", error.timeoutMs);
  } else if (error instanceof MemoryLimitError) {
    console.error("Memory limit exceeded:", error.limitMB);
  }
}
```

## Configuration

### Environment Variables

- `TENSORIFY_PLUGIN_BUCKET`: Default S3 bucket name
- `AWS_REGION`: Default AWS region
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

### Engine Options

```typescript
interface EngineOptions {
  bucketName: string;
  basePath?: string;
  executionTimeout?: number; // milliseconds
  memoryLimit?: number; // MB
  debug?: boolean;
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run build:watch

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

ISC

## Support

For issues and questions, please use the GitHub issue tracker.
