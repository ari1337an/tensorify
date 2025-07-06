const { BaseNode, NodeType, DevUtils } = require('@tensorify/sdk');

/**
 * PyTorch Conv2d Layer Node
 */
class PTConv2d extends BaseNode {
  constructor() {
    super();
    
    this.name = 'PyTorch Conv2d Layer';
    this.nodeType = NodeType.LAYER;
    this.description = 'PyTorch 2D convolutional layer';
    
    // Define inputs and outputs for canvas connections
    this.inputs = [
      DevUtils.createInput('input_tensor', 'tensor', 'Input tensor (optional for layer definition)', false)
    ];
    
    this.outputs = [
      DevUtils.createOutput('layer', 'layer', 'Configured Conv2d layer'),
      DevUtils.createOutput('output_tensor', 'tensor', 'Output tensor after convolution')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        variableName: DevUtils.createProperty('string', 'conv2d_layer', 'Variable name for the Conv2d layer', true),
        inChannels: DevUtils.createProperty('number', 3, 'Number of input channels'),
        outChannels: DevUtils.createProperty('number', 64, 'Number of output channels'),
        kernelSize: DevUtils.createProperty('number', 3, 'Size of the convolving kernel'),
        stride: DevUtils.createProperty('number', 1, 'Stride of the convolution'),
        padding: DevUtils.createProperty('number', 1, 'Zero-padding added to both sides of the input'),
        dilation: DevUtils.createProperty('number', 1, 'Spacing between kernel elements'),
        groups: DevUtils.createProperty('number', 1, 'Number of blocked connections from input channels to output channels'),
        bias: DevUtils.createProperty('boolean', true, 'Whether to add a learnable bias to the output')
      },
      required: ['variableName', 'inChannels', 'outChannels', 'kernelSize']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const varName = settings.variableName || 'conv2d_layer';
        const inChannels = settings.inChannels || 3;
        const outChannels = settings.outChannels || 64;
        const kernelSize = settings.kernelSize || 3;
        const stride = settings.stride || 1;
        const padding = settings.padding || 1;
        const dilation = settings.dilation || 1;
        const groups = settings.groups || 1;
        const bias = settings.bias !== false;

        const instantiation = `self.${varName} = nn.Conv2d(
    in_channels=${inChannels},
    out_channels=${outChannels},
    kernel_size=${kernelSize},
    stride=${stride},
    padding=${padding},
    dilation=${dilation},
    groups=${groups},
    bias=${bias ? 'True' : 'False'}
)`;

        return {
          imports: ['torch.nn as nn'],
          definitions: [],
          instantiations: [instantiation],
          usage: {
            forward: `x = self.${varName}(x)`,
            parameters: `# Conv2d: ${inChannels} -> ${outChannels} channels, kernel=${kernelSize}`,
            named_parameters: `('${varName}', self.${varName})`
          }
        };
      },

      getDependencies: (settings) => [],
      getOutputs: (settings) => [`conv2d_${settings.variableName || 'layer'}`],
      validateConnections: (sourceOutputs, targetInputs) => {
        // PTConv2d can connect to anything - it's a layer/model component
        return true;
      }
    };

    this.security = DevUtils.createBasicSecurity(['torch.nn']);

    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Basic conv2d layer with 3x3 kernel',
      'Feature extraction with 64 output channels',
      'Custom conv2d with stride and padding configuration'
    ]);
  }
}

module.exports = {
  PTConv2d
}; 