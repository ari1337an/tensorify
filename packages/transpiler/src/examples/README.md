# Transpiler Examples

This directory contains example JSON inputs for the v1 transpiler.

## Usage

To generate formatted Python code from a JSON model:

1. Navigate to the transpiler package: `cd packages/transpiler`
2. Run `npm start -- -f src/examples/simple-model.json`

This will print the generated code to the terminal.

## Example: simple-model.json

This example defines a simple PyTorch sequential model for MNIST-like classification.

Generated code:

```
torch.nn.Sequential(
    torch.nn.Flatten(),
    torch.nn.Linear(784, 128),
    torch.nn.ReLU(),
    torch.nn.Linear(128, 10),
)
```
