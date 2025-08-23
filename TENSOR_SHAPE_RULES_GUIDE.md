# Tensor Shape Rules Guide

A comprehensive guide for defining tensor shapes in Tensorify plugins to enable intelligent shape validation and intellisense in the UI.

## Table of Contents

- [Overview](#overview)
- [Shape Types](#shape-types)
- [Shape Dimensions](#shape-dimensions)
- [Simple Scenarios](#simple-scenarios)
- [Complex Scenarios](#complex-scenarios)
- [Best Practices](#best-practices)
- [Validation Rules](#validation-rules)
- [Troubleshooting](#troubleshooting)

## Overview

The tensor shape system allows plugin developers to specify how their operations transform tensor shapes, enabling:

- Real-time shape validation during workflow construction
- Intelligent connection suggestions in the UI
- Hover tooltips with shape information
- Prevention of shape mismatches before code generation

## Shape Types

### 1. Static Shapes

Fixed dimensions that don't change based on inputs or settings.

```typescript
shape: {
  type: "static",
  dimensions: [1, 784], // Always outputs 1×784 tensor
  description: "Flattened MNIST image"
}
```

### 2. Dynamic Shapes

Calculated based on settings, inputs, or mathematical expressions.

```typescript
shape: {
  type: "dynamic",
  dimensions: [
    "N", // Batch size (special placeholder)
    "{settings.outFeatures}", // From plugin settings
    "{input.input_tensor.shape[2]}" // From connected input
  ],
  description: "Linear transformation output"
}
```

### 3. Passthrough Shapes

Copies shape from a specific input (for operations that preserve shape).

```typescript
shape: {
  type: "passthrough",
  passthroughSource: "input_tensor", // Handle ID to copy from
  description: "Same shape as input (ReLU preserves shape)"
}
```

### 4. Conditional Shapes

Different shapes based on runtime conditions.

```typescript
shape: {
  type: "conditional",
  dimensions: [
    "N",
    {
      conditions: [
        { if: "{settings.adaptive_pooling}", then: "{settings.output_size}" },
        { else: "floor({input.input_tensor.shape[1]} / {settings.kernel_size})" }
      ]
    }
  ],
  description: "Pooled feature map"
}
```

## Shape Dimensions

### Basic References

| Reference                   | Description                       | Example                    |
| --------------------------- | --------------------------------- | -------------------------- |
| `"N"` or `"B"`              | Batch size placeholder (any size) | `"N"`                      |
| `123`                       | Literal number                    | `128`                      |
| `"{settings.key}"`          | Setting value                     | `"{settings.outFeatures}"` |
| `"{input.handle.shape[i]}"` | Input dimension                   | `"{input.x.shape[1]}"`     |

### Mathematical Expressions

```typescript
// Basic arithmetic
"{settings.inFeatures} + {settings.bias_size}";
"{input.x.shape[1]} * 2";
"{settings.kernel_size} - 1";
"floor({input.x.shape[2]} / {settings.stride})";
"ceil({settings.channels} / 2)";

// Complex expressions
"({input.x.shape[1]} - {settings.kernel_size} + 2 * {settings.padding}) / {settings.stride} + 1";
```

### Supported Functions

- `floor(expression)` - Round down
- `ceil(expression)` - Round up
- `+`, `-`, `*`, `/` - Basic arithmetic
- Parentheses for grouping

## Simple Scenarios

### Activation Functions (Shape Preserving)

```typescript
// ReLU, Sigmoid, Tanh, etc.
shape: {
  type: "passthrough",
  passthroughSource: "input_tensor",
  description: "Same shape as input (activation preserves shape)"
}
```

### Linear/Dense Layer

```typescript
// Input handles
inputHandles: [
  {
    id: "input_tensor",
    // ... other properties
    expectedShape: {
      type: "dynamic",
      dimensions: ["N", "{settings.inFeatures}"],
      description: "2D tensor (batch_size, input_features)"
    }
  }
],

// Emitted variables
emits: {
  variables: [
    {
      value: "linear_layer",
      // ... other properties
      shape: {
        type: "dynamic",
        dimensions: ["N", "{settings.outFeatures}"],
        description: "2D tensor (batch_size, output_features)"
      }
    }
  ]
}
```

### Constant/Fixed Size Operations

```typescript
// One-hot encoding to fixed vocabulary
shape: {
  type: "static",
  dimensions: [10000], // Vocabulary size
  description: "One-hot encoded tokens"
}
```

## Complex Scenarios

### Convolutional Layers

```typescript
// Conv2D with padding and stride calculations
shape: {
  type: "dynamic",
  dimensions: [
    "N", // Batch size
    "{settings.out_channels}", // Output channels
    // Height calculation: (H + 2*P - K) / S + 1
    "floor(({input.input_tensor.shape[2]} + 2 * {settings.padding} - {settings.kernel_size}) / {settings.stride}) + 1",
    // Width calculation: (W + 2*P - K) / S + 1
    "floor(({input.input_tensor.shape[3]} + 2 * {settings.padding} - {settings.kernel_size}) / {settings.stride}) + 1"
  ],
  description: "4D tensor (batch, channels, height, width) after convolution"
}

// Input validation
inputHandles: [
  {
    id: "input_tensor",
    expectedShape: {
      type: "dynamic",
      dimensions: [
        "N", // Any batch size
        "{settings.in_channels}", // Must match input channels
        -1, // Any height >= kernel_size
        -1  // Any width >= kernel_size
      ],
      description: "4D input tensor (batch, channels, height, width)"
    }
  }
]
```

### Pooling Layers (Conditional)

```typescript
shape: {
  type: "conditional",
  dimensions: [
    "N",
    "{input.input_tensor.shape[1]}", // Preserve channels
    {
      conditions: [
        {
          if: "{settings.adaptive_pooling}",
          then: "{settings.output_size}"
        },
        {
          else: "floor({input.input_tensor.shape[2]} / {settings.kernel_size})"
        }
      ]
    },
    {
      conditions: [
        {
          if: "{settings.adaptive_pooling}",
          then: "{settings.output_size}"
        },
        {
          else: "floor({input.input_tensor.shape[3]} / {settings.kernel_size})"
        }
      ]
    }
  ],
  description: "Pooled feature map"
}
```

### Transformer Attention

```typescript
// Multi-head attention output
shape: {
  type: "dynamic",
  dimensions: [
    "{input.query.shape[0]}", // Batch size
    "{input.query.shape[1]}", // Sequence length
    "{settings.d_model}" // Model dimension
  ],
  description: "Attention output (batch, seq_len, d_model)"
}

// Query input validation
inputHandles: [
  {
    id: "query",
    expectedShape: {
      type: "dynamic",
      dimensions: [
        "N",
        -1, // Any sequence length
        "{settings.d_model}"
      ],
      description: "Query tensor (batch, seq_len, d_model)"
    }
  },
  {
    id: "key",
    expectedShape: {
      type: "dynamic",
      dimensions: [
        "N",
        -1, // Any key sequence length
        "{settings.d_model}"
      ],
      description: "Key tensor (batch, key_seq_len, d_model)"
    }
  }
]
```

### Reshape/View Operations

```typescript
// Flatten operation
shape: {
  type: "dynamic",
  dimensions: [
    "{input.input_tensor.shape[0]}", // Preserve batch
    "{input.input_tensor.shape[1]} * {input.input_tensor.shape[2]} * {input.input_tensor.shape[3]}" // Flatten spatial dimensions
  ],
  description: "Flattened tensor (batch, features)"
}

// Custom reshape with settings
shape: {
  type: "dynamic",
  dimensions: [
    "{input.input_tensor.shape[0]}",
    "{settings.new_height}",
    "{settings.new_width}",
    "{settings.new_channels}"
  ],
  description: "Reshaped tensor"
}
```

### Concatenation/Stacking

```typescript
// Concatenate along feature dimension
shape: {
  type: "dynamic",
  dimensions: [
    "{input.input1.shape[0]}", // Batch from first input
    "{input.input1.shape[1]} + {input.input2.shape[1]}", // Sum feature dimensions
    "{input.input1.shape[2]}", // Other dimensions must match
    "{input.input1.shape[3]}"
  ],
  description: "Concatenated tensor along channel dimension"
}

// Input validation ensures compatible shapes
inputHandles: [
  {
    id: "input1",
    expectedShape: {
      type: "dynamic",
      dimensions: ["N", -1, "H", "W"], // Any channels, fixed H,W
    }
  },
  {
    id: "input2",
    expectedShape: {
      type: "dynamic",
      dimensions: ["N", -1, "H", "W"], // Must match H,W from input1
    }
  }
]
```

## Best Practices

### 1. Use Meaningful Descriptions

```typescript
// Good
description: "4D tensor (batch, channels, height, width) after 3x3 convolution";

// Bad
description: "output tensor";
```

### 2. Validate Critical Dimensions

```typescript
// Always validate dimensions that must match exactly
expectedShape: {
  dimensions: [
    "N", // Batch can vary
    "{settings.input_features}", // Must match exactly
    -1, // Sequence length can vary
    -1, // Any other dimension
  ];
}
```

### 3. Handle Edge Cases

```typescript
// Protect against division by zero
dimensions: [
  "N",
  "{settings.stride} > 0 ? floor({input.x.shape[1]} / {settings.stride}) : {input.x.shape[1]}",
];
```

### 4. Use Conditional Logic for Complex Operations

```typescript
dimensions: [
  "N",
  {
    conditions: [
      { if: "{settings.use_projection}", then: "{settings.projection_dim}" },
      { else: "{input.input_tensor.shape[1]}" },
    ],
  },
];
```

## Validation Rules

### Input Shape Validation

- Use `-1` for "any size" dimensions (like batch size or variable sequence length)
- Specify exact values for dimensions that must match (like feature sizes)
- Reference settings that control expected input shapes

### Output Shape Calculation

- Always account for batch dimension (typically first)
- Use mathematical expressions for size transformations
- Consider padding, stride, and kernel effects for convolutions
- Handle conditional logic for operations with multiple modes

### Connection Compatibility

- Batch dimensions (-1) are always compatible with any size
- Exact matches required for feature dimensions
- Unknown dimensions (-1) are compatible with anything

## Troubleshooting

### Common Issues

#### 1. Settings Not Found

```
Error: Cannot read property 'outFeatures' of undefined
```

**Solution**: Ensure setting keys match exactly:

```typescript
// Plugin settings
settingsFields: [
  { key: "outFeatures", ... }
]

// Shape reference (must match key exactly)
"{settings.outFeatures}"
```

#### 2. Input Reference Errors

```
Error: Cannot read property 'shape' of undefined
```

**Solution**: Check input handle IDs:

```typescript
// Input handle
inputHandles: [
  { id: "input_tensor", ... }
]

// Shape reference (must match handle ID)
"{input.input_tensor.shape[1]}"
```

#### 3. Math Expression Failures

```
Error: Math evaluation failed for: {settings.a} + {settings.b}
```

**Solution**: Ensure all referenced settings exist and are numeric:

```typescript
// Validate settings are numbers
"{settings.channels}"; // channels must be a number
"floor({settings.kernel_size})"; // kernel_size must be numeric
```

### Debug Tips

1. **Start Simple**: Begin with static shapes, then add complexity
2. **Test Incrementally**: Add one dynamic reference at a time
3. **Check Settings**: Verify all referenced settings exist in your plugin
4. **Validate Inputs**: Ensure input handle IDs match your references
5. **Use Console**: Shape calculation errors appear in browser console

### Testing Your Shapes

1. Create test nodes with your plugin
2. Connect them with different input shapes
3. Hover over handles to see calculated shapes
4. Check for red error indicators on invalid connections
5. Verify console for calculation errors

## Examples by Plugin Type

### Computer Vision

- **Conv2D**: Spatial dimension calculations with padding/stride
- **MaxPool**: Size reduction with kernel effects
- **BatchNorm**: Shape preservation
- **Upsample**: Size multiplication

### Natural Language Processing

- **Embedding**: Vocabulary to embedding dimension mapping
- **LSTM**: Sequence processing with hidden states
- **Attention**: Query-key-value transformations
- **Transformer**: Multi-head attention patterns

### General Neural Network

- **Linear**: Feature dimension transformation
- **Dropout**: Shape preservation
- **Activation**: Passthrough operations
- **Concatenate**: Multi-input combination

This guide provides the foundation for implementing robust tensor shape validation in your Tensorify plugins. Start with simple cases and gradually incorporate more complex scenarios as needed.
