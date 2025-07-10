const { BaseNode, NodeType, DevUtils, createPlugin } = require('@tensorify/sdk');

/**
 * Custom Dataset Node for loading and processing data
 */
class CustomDatasetNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Custom Dataset';
    this.nodeType = NodeType.DATASET;
    this.description = 'Create a custom PyTorch dataset with configurable data loading';
    
    this.inputs = [
      DevUtils.createInput('dataPath', 'string', 'Path to dataset files', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('dataset', 'dataset', 'Configured PyTorch dataset instance')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        className: DevUtils.createProperty('string', '{{projectName}}Dataset', 'Dataset class name', true),
        transform: DevUtils.createProperty('boolean', false, 'Apply data transformations'),
        normalization: DevUtils.createProperty('boolean', true, 'Normalize data values'),
        cacheSize: DevUtils.createProperty('number', 1000, 'Number of items to cache in memory'),
        fileFormat: DevUtils.createProperty('string', 'csv', 'Data file format', false, {
          enum: ['csv', 'json', 'images', 'text']
        })
      },
      required: ['className']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const className = settings.className || '{{projectName}}Dataset';
        const transform = settings.transform || false;
        const normalization = settings.normalization !== false;
        const cacheSize = settings.cacheSize || 1000;
        const fileFormat = settings.fileFormat || 'csv';
        
        let imports = [
          'import torch',
          'from torch.utils.data import Dataset',
          'import os',
          'import numpy as np'
        ];
        
        if (fileFormat === 'csv') {
          imports.push('import pandas as pd');
        } else if (fileFormat === 'images') {
          imports.push('from PIL import Image');
        }
        
        if (transform) {
          imports.push('import torchvision.transforms as transforms');
        }
        
        let loadDataMethod;
        switch (fileFormat) {
          case 'csv':
            loadDataMethod = `
        df = pd.read_csv(self.data_path)
        self.data = df.values
        self.labels = df.iloc[:, -1].values if df.shape[1] > 1 else None`;
            break;
          case 'images':
            loadDataMethod = `
        self.image_files = [f for f in os.listdir(self.data_path) 
                           if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        self.data = self.image_files`;
            break;
          default:
            loadDataMethod = `
        # Implement your custom data loading logic here
        self.data = []`;
        }
        
        let getItemMethod;
        switch (fileFormat) {
          case 'images':
            getItemMethod = `
        img_path = os.path.join(self.data_path, self.data[idx])
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        return image`;
            break;
          default:
            getItemMethod = `
        item = self.data[idx]
        
        if self.normalization:
            item = (item - np.mean(item)) / (np.std(item) + 1e-8)
        
        return torch.tensor(item, dtype=torch.float32)`;
        }
        
        let definitions = [
          `class ${className}(Dataset):`,
          '    def __init__(self, data_path, transform=None, normalization=True):',
          '        self.data_path = data_path',
          '        self.transform = transform',
          '        self.normalization = normalization',
          '        self.cache = {}',
          `        self.cache_size = ${cacheSize}`,
          '        self._load_data()',
          '',
          '    def _load_data(self):',
          ...loadDataMethod.split('\n').map(line => '        ' + line.trim()).filter(line => line.trim()),
          '',
          '    def __len__(self):',
          '        return len(self.data)',
          '',
          '    def __getitem__(self, idx):',
          '        # Check cache first',
          '        if idx in self.cache:',
          '            return self.cache[idx]',
          '',
          ...getItemMethod.split('\n').map(line => '        ' + line.trim()).filter(line => line.trim()),
          '',
          '        # Cache result if under limit',
          '        if len(self.cache) < self.cache_size:',
          '            self.cache[idx] = result',
          '',
          '        return result'
        ];
        
        let instantiations = [
          '# Create dataset with configuration',
          `dataset = ${className}(`,
          '    data_path=data_path,',
          `    transform=${transform ? 'transform' : 'None'},`,
          `    normalization=${normalization ? 'True' : 'False'}`,
          ')'
        ];
        
        if (transform && fileFormat === 'images') {
          instantiations.unshift(
            'transform = transforms.Compose([',
            '    transforms.Resize((224, 224)),',
            '    transforms.ToTensor(),',
            '    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])',
            '])'
          );
        }
        
        return {
          imports,
          definitions,
          instantiations,
          usage: {
            forward: 'sample = dataset[0]  # Get first sample',
            named_parameters: '("dataset", dataset)'
          }
        };
      },
      
      getDependencies: (settings) => {
        const deps = ['torch', 'numpy'];
        if (settings.fileFormat === 'csv') deps.push('pandas');
        if (settings.fileFormat === 'images') deps.push('Pillow', 'torchvision');
        return deps;
      },
      
      getOutputs: (settings) => ['dataset'],
      
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity([
      'torch', 'torchvision', 'numpy', 'pandas', 'PIL'
    ]);

    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'CSV dataset with normalization',
      'Image dataset with transformations', 
      'Custom dataset with caching enabled'
    ]);
  }
}

/**
 * DataLoader Node for batch processing
 */
class DataLoaderNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Data Loader';
    this.nodeType = NodeType.DATALOADER;
    this.description = 'Configure PyTorch DataLoader for batch processing';
    
    this.inputs = [
      DevUtils.createInput('dataset', 'dataset', 'PyTorch dataset instance', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('dataloader', 'dataloader', 'Configured PyTorch DataLoader')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        batchSize: DevUtils.createProperty('number', 32, 'Batch size for training'),
        shuffle: DevUtils.createProperty('boolean', true, 'Shuffle data each epoch'),
        numWorkers: DevUtils.createProperty('number', 0, 'Number of data loading workers'),
        dropLast: DevUtils.createProperty('boolean', false, 'Drop last incomplete batch'),
        pinMemory: DevUtils.createProperty('boolean', false, 'Pin memory for faster GPU transfer')
      },
      required: ['batchSize']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const batchSize = settings.batchSize || 32;
        const shuffle = settings.shuffle !== false;
        const numWorkers = settings.numWorkers || 0;
        const dropLast = settings.dropLast === true;
        const pinMemory = settings.pinMemory === true;
        
        return {
          imports: [
            'from torch.utils.data import DataLoader'
          ],
          definitions: [],
          instantiations: [
            '# Configure DataLoader for batch processing',
            'dataloader = DataLoader(',
            '    dataset,',
            `    batch_size=${batchSize},`,
            `    shuffle=${shuffle},`,
            `    num_workers=${numWorkers},`,
            `    drop_last=${dropLast},`,
            `    pin_memory=${pinMemory}`,
            ')'
          ],
          usage: {
            forward: 'for batch in dataloader:\n    # Process batch here\n    pass',
            named_parameters: '("dataloader", dataloader)'
          }
        };
      },
      
      getDependencies: () => ['torch'],
      getOutputs: () => ['dataloader'],
      validateConnections: (sourceOutputs, targetInputs) => {
        return sourceOutputs.some(output => output.type === 'dataset');
      }
    };

    this.security = DevUtils.createBasicSecurity(['torch']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Training: batchSize=32, shuffle=true',
      'Inference: batchSize=64, shuffle=false',
      'Multi-worker: numWorkers=4, pinMemory=true'
    ]);
  }
}

module.exports = createPlugin({
  name: '{{projectName}}',
  version: '1.0.0',
  description: '{{description}}',
  author: '{{author}}',
  nodes: {
    CustomDatasetNode,
    DataLoaderNode
  }
}); 