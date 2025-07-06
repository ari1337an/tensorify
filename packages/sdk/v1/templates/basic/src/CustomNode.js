const { createPlugin, BaseNode, NodeType, DevUtils } = require('@tensorify/sdk');

/**
 * Example Custom Node
 */
class CustomNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Custom Node';
    this.nodeType = NodeType.CUSTOM;
    this.description = 'A custom node created with Tensorify SDK';
    
    this.inputs = [
      DevUtils.createInput('input', 'tensor', 'Input tensor', false)
    ];
    
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Output tensor')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        variableName: DevUtils.createProperty('string', 'custom_var', 'Variable name', true),
        customParameter: DevUtils.createProperty('string', 'default_value', 'Custom parameter')
      },
      required: ['variableName']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const varName = settings.variableName || 'custom_var';
        const customParam = settings.customParameter || 'default_value';

        return {
          imports: ['# Add your imports here'],
          definitions: [`# Custom definitions for ${varName}`],
          instantiations: [`${varName} = "${customParam}"`],
          usage: {
            forward: `# Use ${varName} here`,
            named_parameters: `('${varName}', ${varName})`
          }
        };
      },
      getDependencies: () => [],
      getOutputs: (settings) => [settings.variableName || 'custom_var'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity();
    this.quality = DevUtils.createBasicQuality('1.0.0', ['Basic usage example']);
  }
}

// Create and export the plugin
module.exports = createPlugin({
  name: '{{pluginName}}',
  version: '{{version}}',
  description: '{{description}}',
  author: '{{author}}',
  nodes: {
    CustomNode
  }
}); 