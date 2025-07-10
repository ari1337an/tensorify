# {{projectName}}

{{description}}

## Installation

```bash
npm install
```

## Usage

```javascript
const plugin = require('./dist/index.js');

// Create a node instance
const exampleNode = new plugin.nodes.ExampleNode();

// Test code generation
const result = exampleNode.testCodeGeneration({
  factor: 3.0,
  operation: 'multiply',
  message: 'Hello from my plugin!'
});

console.log(result);
```

## Development

```bash
# Build TypeScript
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test
```

## Plugin Structure

- `src/index.js` - Main plugin export with nodes
- `test.js` - Basic plugin tests
- `tsconfig.json` - TypeScript configuration

## Created with

This plugin was created using [create-tensorify-plugin](https://www.npmjs.com/package/create-tensorify-plugin).

## License

MIT © {{year}} {{author}} 