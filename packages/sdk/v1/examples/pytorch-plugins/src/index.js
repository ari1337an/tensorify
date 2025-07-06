const { createPlugin } = require('@tensorify/sdk');
const { PTDataset } = require('./PTDataset');
const { PTDataLoader } = require('./PTDataLoader');
const { PTConv2d } = require('./PTConv2d');

// Create and export the PyTorch plugin
const PyTorchPlugin = createPlugin({
  name: 'PyTorch Core Plugin',
  version: '1.0.0',
  description: 'Essential PyTorch nodes for dataset handling, data loading, and layers',
  author: 'Tensorify Team <team@tensorify.io>',
  nodes: {
    PTDataset,
    PTDataLoader,
    PTConv2d
  },
  config: {
    requiredEnvironmentVars: [],
    recommendedMemory: '2GB',
    supportedPythonVersions: ['>=3.7']
  }
});

module.exports = PyTorchPlugin; 