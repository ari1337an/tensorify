# @tensorify.io/sdk

**Complete SDK for developing Tensorify plugins** - Everything you need in one package to develop [Tensorify](https://tensorify.io) Plugins.

## 🚀 Quick Start

### Install
```bash
npm install @tensorify.io/sdk
```

### Create a Plugin
```bash
npx tensorify-cli create my-plugin
cd my-plugin
npm install
```

### Basic Node Example
```javascript
const { BaseNode, NodeType, DevUtils, createPlugin } = require('@tensorify.io/sdk');

class MyNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'My Custom Node';
    this.nodeType = NodeType.CUSTOM;
    this.description = 'What this node does';
    
    this.inputs = [
      DevUtils.createInput('input', 'tensor', 'Input description', true)
    ];
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Output description')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        parameter: DevUtils.createProperty('string', 'default', 'Parameter description')
      },
      required: []
    };

    this.codeGeneration = {
      generateCode: (settings) => ({
        imports: ['import torch'],
        definitions: [],
        instantiations: ['result = process(input)'],
        usage: {
          forward: 'output = result',
          named_parameters: '("output", result)'
        }
      }),
      getDependencies: () => [],
      getOutputs: () => ['output'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity();
    this.quality = DevUtils.createBasicQuality('1.0.0', ['Usage example']);
  }
}

module.exports = createPlugin({
  name: 'My Plugin',
  version: '1.0.0',
  description: 'A custom Tensorify plugin',
  author: 'Your Name',
  nodes: { MyNode }
});
```

## 📚 API Reference

### Core Classes

#### `BaseNode`
Base class for all plugin nodes. Must implement:
- `name`, `nodeType`, `description`
- `inputs`, `outputs`
- `schema` (configuration properties)  
- `codeGeneration` (Python code generation)
- `security`, `quality` configurations

#### `DevUtils`
Helper functions for common configurations:
- `createInput(name, type, description, required)`
- `createOutput(name, type, description)`
- `createProperty(type, defaultValue, description, required, options)`
- `createBasicSecurity(additionalImports)`
- `createBasicQuality(version, examples)`

#### `createPlugin(config)`
Validates and creates a plugin export with nodes.

### Node Types
```javascript
NodeType.CUSTOM          // Custom functionality
NodeType.DATASET         // Data loading
NodeType.DATALOADER      // Batch processing
NodeType.PREPROCESSING   // Data preprocessing
NodeType.LAYER           // Neural network layers
NodeType.MODEL           // Complete models
NodeType.OPTIMIZER       // Training optimizers
NodeType.LOSS            // Loss functions
NodeType.TRAINER         // Training logic
NodeType.EVALUATOR       // Model evaluation
```

## 🛠️ CLI Commands

```bash
# Create new plugin
tensorify-cli create [name] [options]

# Add node to existing plugin
tensorify-cli node [name] [options]

# Validate plugin
tensorify-cli validate [path]
```

## 📁 Project Structure

```
my-plugin/
├── package.json          # Plugin metadata
├── src/
│   └── index.js         # Plugin export with nodes
└── test.js              # Basic tests
```

## 🎯 Examples

See the `/examples` and `/templates` directories for:
- Basic plugin template
- PyTorch dataset/dataloader nodes  
- Convolutional layer examples

## 🔧 Development

```bash
# Build SDK
npm run build

# Development mode
npm run dev

# Test CLI
npm run cli -- create test-plugin
```

## 📝 Key Features

- **Single Package**: Everything in `@tensorify.io/sdk`
- **Simple API**: One import, clear structure
- **CLI Tools**: Scaffolding and validation
- **Type Safety**: Full TypeScript support
- **Examples**: Ready-to-use templates

## 📄 License

MIT
