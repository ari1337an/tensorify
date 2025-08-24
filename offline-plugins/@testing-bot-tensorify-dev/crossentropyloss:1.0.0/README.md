# crossentropyloss

CrossEntropyLoss function plugin

A Tensorify plugin that implements a PyTorch Linear/Dense layer with customizable input/output features and bias settings.

## Installation

```bash
npm install
```

## Usage

```typescript
import crossentropylossLinearLayer from './dist/index.js';

// Create a linear layer instance
const linearLayer = new crossentropylossLinearLayer();

// Generate code with custom settings
const code = linearLayer.getTranslationCode({
  inFeatures: 784,
  outFeatures: 128,
  bias: true
});

console.log(code);
// Output: my_plugin_linear_layer = nn.Linear(784, 128, bias=True)
```

## Configuration

The linear layer accepts the following settings:

| Setting       | Type      | Default | Description                  |
| ------------- | --------- | ------- | ---------------------------- |
| `inFeatures`  | `number`  | `784`   | Number of input features     |
| `outFeatures` | `number`  | `128`   | Number of output features    |
| `bias`        | `boolean` | `true`  | Whether to include bias term |

## Development

```bash
# Build TypeScript
pnpm run build

# Watch mode for development
pnpm run dev

# Run tests
npm test
```

## Example Configurations

### Basic Linear Layer

```typescript
{
  inFeatures: 784,
  outFeatures: 128
}
```

### Linear Layer without Bias

```typescript
{
  inFeatures: 512,
  outFeatures: 256,
  bias: false
}
```

### Small Dense Layer

```typescript
{
  inFeatures: 64,
  outFeatures: 32,
  bias: true
}
```

## Plugin Structure

- `src/index.ts` - Main plugin implementation
- `manifest.json` - Plugin metadata and configuration
- `test.js` - Plugin tests
- `tsconfig.json` - TypeScript configuration

## Generated Code

This plugin generates PyTorch code for Linear layers:

```python
import torch
import torch.nn as nn

# crossentropyloss Linear Layer: 784 -> 128 features
crossentropyloss_linear_layer = nn.Linear(784, 128, bias=True)
```

## SDK Compatibility

This plugin is built with the Tensorify SDK v0.0.1 and extends the `ModelLayerNode` base class for optimal compatibility and functionality.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © 2025 Tensorify Dev

## Created with

This plugin was created using [create-tensorify-plugin](https://www.npmjs.com/package/create-tensorify-plugin).
