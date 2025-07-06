const { BaseNode, NodeType, DevUtils } = require('@tensorify/sdk');

/**
 * PyTorch Dataset Node
 */
class PTDataset extends BaseNode {
  constructor() {
    super();
    
    this.name = 'PyTorch Dataset';
    this.nodeType = NodeType.PREPROCESSING;
    this.description = 'PyTorch dataset configuration for loading and preprocessing data';
    
    // Define inputs and outputs for canvas connections
    this.inputs = [
      DevUtils.createInput('dataPath', 'string', 'Path to the dataset files', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('dataset', 'dataset', 'Configured PyTorch dataset instance')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        className: DevUtils.createProperty('string', 'CustomDataset', 'Name of the dataset class', true),
        constructorParams: DevUtils.createProperty('array', ['data_path'], 'Constructor parameters for the dataset', false, {
          items: { type: 'string' }
        }),
        initCode: DevUtils.createProperty('code', 'self.data_path = data_path\nself.data = self.load_data()', 'Initialization code for the dataset (supports string, array, or code block)', true),
        lenCode: DevUtils.createProperty('code', 'return len(self.data)', 'Code that returns the dataset length (supports string, array, or code block)', true),
        getitemCode: DevUtils.createProperty('code', 'return self.data[idx]', 'Code that returns individual data items (supports string, array, or code block)', true),
        dataPath: DevUtils.createProperty('string', './data', 'Path to the dataset files'),
        transforms: DevUtils.createProperty('array', [], 'List of transform operations', false, {
          items: { type: 'string' }
        })
      },
      required: ['className', 'initCode', 'lenCode', 'getitemCode']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const className = settings.className || "CustomDataset";
        
        // Prepare constructor parameters
        const constructorParams = ["self", ...(settings.constructorParams || ["data_path"])];
        const constructorParamsStr = constructorParams.join(", ");
        
        // Generate the complete dataset class (let core transpiler handle code processing)
        const datasetClass = `class ${className}(Dataset):
    def __init__(${constructorParamsStr}):
        ${settings.initCode || "pass"}
    
    def __len__(self):
        ${settings.lenCode || "return 0"}
    
    def __getitem__(self, idx):
        ${settings.getitemCode || "return None"}`;

        // Generate dataset instantiation
        const instanceParams = (settings.constructorParams || ["data_path"]).map((param) => {
          if (param === 'data_path') {
            return `"${settings.dataPath || './data'}"`;
          }
          return `${param}_value`;
        }).join(', ');

        const instanceName = 'train_dataset';  // Standard name that DataLoader expects
        const instantiation = `${instanceName} = ${className}(${instanceParams})`;

        return {
          imports: ['torch', 'from torch.utils.data import Dataset'],
          definitions: [datasetClass],
          instantiations: [instantiation],
          usage: {
            forward: `# Dataset usage: data_loader = DataLoader(${instanceName}, batch_size=32)`,
            parameters: `# Dataset has ${settings.constructorParams?.length || 1} constructor parameters`,
            named_parameters: `('${instanceName}', ${instanceName})`
          }
        };
      },

      getDependencies: (settings) => [],
      getOutputs: (settings) => [`dataset_${settings.className?.toLowerCase() || 'custom'}`],
      validateConnections: (sourceOutputs, targetInputs) => {
        // PTDataset has no inputs, only outputs - always valid as source
        return true;
      }
    };

    this.security = DevUtils.createBasicSecurity([
      'torch.utils.data', 'numpy', 'pandas', 'PIL', 'cv2', 'os', 'json', 'csv'
    ]);

    this.quality = DevUtils.createBasicQuality('2.0.0', [
      'Basic CSV dataset with default settings',
      'Image dataset with custom transforms',
      'Custom dataset with complex initialization',
      'Dataset with array-based code definition',
      'Dataset with code block objects'
    ]);
  }
}

module.exports = {
  PTDataset
}; 