const { BaseNode, NodeType, DevUtils, createPlugin } = require('@tensorify/sdk');

/**
 * Linear/Dense Layer Node
 */
class LinearLayerNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Linear Layer';
    this.nodeType = NodeType.LAYER;
    this.description = 'Fully connected linear/dense layer';
    
    this.inputs = [
      DevUtils.createInput('input', 'tensor', 'Input tensor', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Output tensor')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        inputSize: DevUtils.createProperty('number', 784, 'Input feature size', true),
        outputSize: DevUtils.createProperty('number', 128, 'Output feature size', true),
        bias: DevUtils.createProperty('boolean', true, 'Include bias term'),
        activation: DevUtils.createProperty('string', 'none', 'Activation function', false, {
          enum: ['none', 'relu', 'sigmoid', 'tanh', 'leaky_relu', 'gelu']
        }),
        dropout: DevUtils.createProperty('number', 0.0, 'Dropout probability (0.0-1.0)')
      },
      required: ['inputSize', 'outputSize']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const inputSize = settings.inputSize;
        const outputSize = settings.outputSize;
        const bias = settings.bias !== false;
        const activation = settings.activation || 'none';
        const dropout = settings.dropout || 0.0;
        
        let imports = [
          'import torch.nn as nn',
          'import torch.nn.functional as F'
        ];
        
        let layerComponents = [
          `nn.Linear(${inputSize}, ${outputSize}, bias=${bias})`
        ];
        
        if (activation !== 'none') {
          const activationMap = {
            'relu': 'nn.ReLU()',
            'sigmoid': 'nn.Sigmoid()',
            'tanh': 'nn.Tanh()',
            'leaky_relu': 'nn.LeakyReLU()',
            'gelu': 'nn.GELU()'
          };
          layerComponents.push(activationMap[activation]);
        }
        
        if (dropout > 0.0) {
          layerComponents.push(`nn.Dropout(${dropout})`);
        }
        
        let instantiations;
        if (layerComponents.length === 1) {
          instantiations = [
            `# Linear layer: ${inputSize} -> ${outputSize}`,
            `linear_layer = ${layerComponents[0]}`
          ];
        } else {
          instantiations = [
            `# Linear layer with activation and dropout`,
            'linear_layer = nn.Sequential(',
            ...layerComponents.map((comp, idx) => 
              `    ${comp}${idx < layerComponents.length - 1 ? ',' : ''}`
            ),
            ')'
          ];
        }
        
        return {
          imports,
          definitions: [],
          instantiations,
          usage: {
            forward: 'output = linear_layer(input)',
            named_parameters: '("linear_layer", linear_layer)'
          }
        };
      },
      
      getDependencies: () => ['torch'],
      getOutputs: () => ['output'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity(['torch']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Hidden layer: inputSize=512, outputSize=256, activation=relu',
      'Output layer: inputSize=128, outputSize=10, activation=none',
      'Regularized layer: dropout=0.2, activation=gelu'
    ]);
  }
}

/**
 * Convolutional Layer Node
 */
class ConvLayerNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Convolutional Layer';
    this.nodeType = NodeType.LAYER;
    this.description = '2D Convolutional layer for image processing';
    
    this.inputs = [
      DevUtils.createInput('input', 'tensor', 'Input tensor (N, C, H, W)', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Output tensor after convolution')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        inChannels: DevUtils.createProperty('number', 3, 'Number of input channels', true),
        outChannels: DevUtils.createProperty('number', 64, 'Number of output channels', true),
        kernelSize: DevUtils.createProperty('number', 3, 'Convolution kernel size', true),
        stride: DevUtils.createProperty('number', 1, 'Convolution stride'),
        padding: DevUtils.createProperty('number', 1, 'Padding size'),
        batchNorm: DevUtils.createProperty('boolean', false, 'Apply batch normalization'),
        activation: DevUtils.createProperty('string', 'relu', 'Activation function', false, {
          enum: ['none', 'relu', 'sigmoid', 'tanh', 'leaky_relu']
        })
      },
      required: ['inChannels', 'outChannels', 'kernelSize']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const inChannels = settings.inChannels;
        const outChannels = settings.outChannels;
        const kernelSize = settings.kernelSize;
        const stride = settings.stride || 1;
        const padding = settings.padding || 0;
        const batchNorm = settings.batchNorm === true;
        const activation = settings.activation || 'relu';
        
        let imports = [
          'import torch.nn as nn'
        ];
        
        let layerComponents = [
          `nn.Conv2d(${inChannels}, ${outChannels}, kernel_size=${kernelSize}, ` +
          `stride=${stride}, padding=${padding})`
        ];
        
        if (batchNorm) {
          layerComponents.push(`nn.BatchNorm2d(${outChannels})`);
        }
        
        if (activation !== 'none') {
          const activationMap = {
            'relu': 'nn.ReLU()',
            'sigmoid': 'nn.Sigmoid()',
            'tanh': 'nn.Tanh()',
            'leaky_relu': 'nn.LeakyReLU()'
          };
          layerComponents.push(activationMap[activation]);
        }
        
        let instantiations;
        if (layerComponents.length === 1) {
          instantiations = [
            `# Conv2d: ${inChannels}->${outChannels}, kernel=${kernelSize}x${kernelSize}`,
            `conv_layer = ${layerComponents[0]}`
          ];
        } else {
          instantiations = [
            `# Convolutional block with batch norm and activation`,
            'conv_layer = nn.Sequential(',
            ...layerComponents.map((comp, idx) => 
              `    ${comp}${idx < layerComponents.length - 1 ? ',' : ''}`
            ),
            ')'
          ];
        }
        
        return {
          imports,
          definitions: [],
          instantiations,
          usage: {
            forward: 'output = conv_layer(input)',
            named_parameters: '("conv_layer", conv_layer)'
          }
        };
      },
      
      getDependencies: () => ['torch'],
      getOutputs: () => ['output'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity(['torch']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Basic conv: 3->64 channels, 3x3 kernel',
      'Deep conv: 64->128 channels with batch norm',
      'Large kernel: 128->256 channels, 5x5 kernel'
    ]);
  }
}

/**
 * Attention Layer Node
 */
class AttentionLayerNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Multi-Head Attention';
    this.nodeType = NodeType.LAYER;
    this.description = 'Multi-head self-attention layer for transformers';
    
    this.inputs = [
      DevUtils.createInput('input', 'tensor', 'Input tensor (batch, seq_len, d_model)', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Attention output tensor'),
      DevUtils.createOutput('weights', 'tensor', 'Attention weights (optional)')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        dModel: DevUtils.createProperty('number', 512, 'Model dimension', true),
        numHeads: DevUtils.createProperty('number', 8, 'Number of attention heads', true),
        dropout: DevUtils.createProperty('number', 0.1, 'Attention dropout rate'),
        bias: DevUtils.createProperty('boolean', true, 'Include bias in linear layers'),
        returnWeights: DevUtils.createProperty('boolean', false, 'Return attention weights')
      },
      required: ['dModel', 'numHeads']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const dModel = settings.dModel;
        const numHeads = settings.numHeads;
        const dropout = settings.dropout || 0.1;
        const bias = settings.bias !== false;
        const returnWeights = settings.returnWeights === true;
        
        return {
          imports: [
            'import torch.nn as nn',
            'import torch.nn.functional as F',
            'import math'
          ],
          definitions: [
            'class MultiHeadAttention(nn.Module):',
            '    def __init__(self, d_model, num_heads, dropout=0.1, bias=True):',
            '        super().__init__()',
            '        self.d_model = d_model',
            '        self.num_heads = num_heads',
            '        self.head_dim = d_model // num_heads',
            '        ',
            '        assert self.head_dim * num_heads == d_model',
            '        ',
            '        self.q_linear = nn.Linear(d_model, d_model, bias=bias)',
            '        self.k_linear = nn.Linear(d_model, d_model, bias=bias)',
            '        self.v_linear = nn.Linear(d_model, d_model, bias=bias)',
            '        self.out_linear = nn.Linear(d_model, d_model, bias=bias)',
            '        self.dropout = nn.Dropout(dropout)',
            '        ',
            '    def forward(self, x, return_weights=False):',
            '        batch_size, seq_len, _ = x.size()',
            '        ',
            '        # Linear transformations',
            '        Q = self.q_linear(x)',
            '        K = self.k_linear(x)',
            '        V = self.v_linear(x)',
            '        ',
            '        # Reshape for multi-head attention',
            '        Q = Q.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)',
            '        K = K.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)',
            '        V = V.view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)',
            '        ',
            '        # Scaled dot-product attention',
            '        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.head_dim)',
            '        attention_weights = F.softmax(scores, dim=-1)',
            '        attention_weights = self.dropout(attention_weights)',
            '        ',
            '        # Apply attention to values',
            '        attention_output = torch.matmul(attention_weights, V)',
            '        ',
            '        # Concatenate heads',
            '        attention_output = attention_output.transpose(1, 2).contiguous().view(',
            '            batch_size, seq_len, self.d_model',
            '        )',
            '        ',
            '        # Final linear layer',
            '        output = self.out_linear(attention_output)',
            '        ',
            '        if return_weights:',
            '            return output, attention_weights',
            '        return output'
          ],
          instantiations: [
            `# Multi-head attention: ${dModel}d, ${numHeads} heads`,
            `attention_layer = MultiHeadAttention(`,
            `    d_model=${dModel},`,
            `    num_heads=${numHeads},`,
            `    dropout=${dropout},`,
            `    bias=${bias}`,
            `)`
          ],
          usage: {
            forward: returnWeights ? 
              'output, weights = attention_layer(input, return_weights=True)' :
              'output = attention_layer(input)',
            named_parameters: returnWeights ?
              '("output", output), ("weights", weights)' :
              '("output", output)'
          }
        };
      },
      
      getDependencies: () => ['torch'],
      getOutputs: (settings) => settings.returnWeights ? ['output', 'weights'] : ['output'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity(['torch']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Standard: dModel=512, numHeads=8',
      'Large model: dModel=1024, numHeads=16',
      'With weights: returnWeights=true for visualization'
    ]);
  }
}

module.exports = createPlugin({
  name: '{{projectName}}',
  version: '1.0.0',
  description: '{{description}}',
  author: '{{author}}',
  nodes: {
    LinearLayerNode,
    ConvLayerNode,
    AttentionLayerNode
  }
}); 