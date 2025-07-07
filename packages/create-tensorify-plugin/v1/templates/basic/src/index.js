const { BaseNode, NodeType, DevUtils, createPlugin } = require('@tensorify/sdk');

/**
 * A simple example node that demonstrates basic plugin functionality
 */
class ExampleNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Example Node';
    this.nodeType = NodeType.CUSTOM;
    this.description = 'A simple example node for demonstration';
    
    this.inputs = [
      DevUtils.createInput('input', 'tensor', 'Input tensor', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('output', 'tensor', 'Processed output tensor')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        factor: DevUtils.createProperty('number', 2.0, 'Multiplication factor', false),
        operation: DevUtils.createProperty('string', 'multiply', 'Operation to perform', false, {
          enum: ['multiply', 'add', 'subtract']
        }),
        message: DevUtils.createProperty('string', 'Hello from {{projectName}}!', 'Custom message')
      },
      required: []
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const factor = settings.factor || 2.0;
        const operation = settings.operation || 'multiply';
        const message = settings.message || 'Hello from {{projectName}}!';
        
        let operationCode;
        switch (operation) {
          case 'add':
            operationCode = `output = input + ${factor}`;
            break;
          case 'subtract':
            operationCode = `output = input - ${factor}`;
            break;
          case 'multiply':
          default:
            operationCode = `output = input * ${factor}`;
            break;
        }
        
        return {
          imports: [
            'import torch',
            '# {{projectName}} - {{description}}'
          ],
          definitions: [
            `# ${message}`
          ],
          instantiations: [
            `# Perform ${operation} operation`,
            operationCode
          ],
          usage: {
            forward: 'result = output',
            named_parameters: '("output", output)'
          }
        };
      },
      
      getDependencies: (settings) => ['torch'],
      
      getOutputs: (settings) => ['output'],
      
      validateConnections: (sourceOutputs, targetInputs) => {
        // Simple validation - ensure tensor input is provided
        return sourceOutputs.some(output => output.type === 'tensor');
      }
    };

    this.security = DevUtils.createBasicSecurity(['torch', 'numpy']);

    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Basic usage: factor=2.0, operation=multiply',
      'Addition: factor=5.0, operation=add',
      'Custom message with personal greeting'
    ]);
  }
}

module.exports = createPlugin({
  name: '{{projectName}}',
  version: '1.0.0',
  description: '{{description}}',
  author: '{{author}}',
  nodes: {
    ExampleNode
  }
}); 