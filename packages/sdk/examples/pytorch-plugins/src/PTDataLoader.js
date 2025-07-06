const { BaseNode, NodeType, DevUtils } = require('@tensorify/sdk');

/**
 * PyTorch DataLoader Node
 */
class PTDataLoader extends BaseNode {
  constructor() {
    super();
    
    this.name = 'PyTorch DataLoader';
    this.nodeType = NodeType.PREPROCESSING;
    this.description = 'PyTorch DataLoader configuration for batch processing';
    
    // Define inputs and outputs for canvas connections
    this.inputs = [
      DevUtils.createInput('dataset', 'dataset', 'PyTorch dataset to load from', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('dataloader', 'dataloader', 'Configured PyTorch DataLoader')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        dataloaderVariable: DevUtils.createProperty('string', 'train_loader', 'Variable name for the DataLoader instance', true),
        datasetVariable: DevUtils.createProperty('string', 'train_dataset', 'Variable name of the dataset to load', true),
        batchSize: DevUtils.createProperty('number', 32, 'Number of samples per batch'),
        shuffle: DevUtils.createProperty('boolean', true, 'Whether to shuffle the data'),
        numWorkers: DevUtils.createProperty('number', 0, 'Number of worker processes for data loading'),
        pinMemory: DevUtils.createProperty('boolean', false, 'Whether to pin memory for faster GPU transfer'),
        dropLast: DevUtils.createProperty('boolean', false, 'Whether to drop the last incomplete batch')
      },
      required: ['dataloaderVariable', 'datasetVariable']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const dataloaderVar = settings.dataloaderVariable || 'train_loader';
        const datasetVar = settings.datasetVariable || 'train_dataset';
        const batchSize = settings.batchSize || 32;
        const shuffle = settings.shuffle !== false;
        const numWorkers = settings.numWorkers || 0;
        const pinMemory = settings.pinMemory || false;
        const dropLast = settings.dropLast || false;

        const instantiation = `${dataloaderVar} = DataLoader(
    ${datasetVar},
    batch_size=${batchSize},
    shuffle=${shuffle ? 'True' : 'False'},
    num_workers=${numWorkers},
    pin_memory=${pinMemory ? 'True' : 'False'},
    drop_last=${dropLast ? 'True' : 'False'}
)`;

        return {
          imports: ['from torch.utils.data import DataLoader'],
          definitions: [],
          instantiations: [instantiation],
          usage: {
            forward: `# DataLoader usage: for batch_idx, (data, target) in enumerate(${dataloaderVar}):`,
            parameters: `# Batch size: ${batchSize}, Workers: ${numWorkers}`,
            named_parameters: `('${dataloaderVar}', ${dataloaderVar})`
          }
        };
      },

      getDependencies: (settings) => [settings.datasetVariable || 'train_dataset'],
      getOutputs: (settings) => [settings.dataloaderVariable || 'train_loader'],
      validateConnections: (sourceOutputs, targetInputs) => {
        // PTDataLoader accepts dataset inputs for drag-and-drop UX
        return sourceOutputs.some(output => 
          typeof output === 'string' && (
            output.includes('dataset') ||
            output.startsWith('dataset_') ||
            // Accept any output for flexible drag-and-drop UX
            true
          )
        );
      }
    };

    this.security = DevUtils.createBasicSecurity(['torch.utils.data']);

    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Training dataloader with shuffling enabled',
      'Validation dataloader with batch size 64',
      'Production dataloader with multi-worker processing'
    ]);
  }
}

module.exports = {
  PTDataLoader
}; 