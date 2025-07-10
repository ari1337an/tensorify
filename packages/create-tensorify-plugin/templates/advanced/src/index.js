const { BaseNode, NodeType, DevUtils, createPlugin } = require('@tensorify/sdk');

/**
 * Advanced Model Builder Node that can create entire neural networks
 */
class ModelBuilderNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Model Builder';
    this.nodeType = NodeType.MODEL;
    this.description = 'Build complete neural network models with custom architectures';
    
    this.inputs = [
      DevUtils.createInput('inputShape', 'array', 'Input tensor shape [batch, ...features]', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('model', 'model', 'Complete PyTorch model'),
      DevUtils.createOutput('summary', 'dict', 'Model architecture summary')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        modelName: DevUtils.createProperty('string', '{{projectName}}Model', 'Model class name', true),
        architecture: DevUtils.createProperty('array', [], 'Layer configuration', true, {
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['linear', 'conv2d', 'attention', 'dropout', 'batchnorm'] },
              params: { type: 'object' }
            }
          }
        }),
        optimizer: DevUtils.createProperty('string', 'adam', 'Optimizer type', false, {
          enum: ['adam', 'sgd', 'rmsprop', 'adamw']
        }),
        learningRate: DevUtils.createProperty('number', 0.001, 'Learning rate'),
        includeTraining: DevUtils.createProperty('boolean', true, 'Include training methods')
      },
      required: ['modelName', 'architecture']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const modelName = settings.modelName || '{{projectName}}Model';
        const architecture = settings.architecture || [];
        const optimizer = settings.optimizer || 'adam';
        const learningRate = settings.learningRate || 0.001;
        const includeTraining = settings.includeTraining !== false;
        
        let imports = [
          'import torch',
          'import torch.nn as nn',
          'import torch.nn.functional as F',
          'import torch.optim as optim'
        ];
        
        // Generate layer definitions
        let layerInits = [];
        let forwardOps = [];
        let layerCount = 0;
        
        for (const layer of architecture) {
          const layerName = `layer_${layerCount}`;
          layerCount++;
          
          switch (layer.type) {
            case 'linear':
              layerInits.push(`        self.${layerName} = nn.Linear(${layer.params.in_features}, ${layer.params.out_features})`);
              forwardOps.push(`        x = self.${layerName}(x)`);
              if (layer.params.activation) {
                forwardOps.push(`        x = F.${layer.params.activation}(x)`);
              }
              break;
              
            case 'conv2d':
              layerInits.push(`        self.${layerName} = nn.Conv2d(${layer.params.in_channels}, ${layer.params.out_channels}, ${layer.params.kernel_size})`);
              forwardOps.push(`        x = self.${layerName}(x)`);
              if (layer.params.activation) {
                forwardOps.push(`        x = F.${layer.params.activation}(x)`);
              }
              break;
              
            case 'dropout':
              layerInits.push(`        self.${layerName} = nn.Dropout(${layer.params.p || 0.5})`);
              forwardOps.push(`        x = self.${layerName}(x)`);
              break;
              
            case 'batchnorm':
              layerInits.push(`        self.${layerName} = nn.BatchNorm1d(${layer.params.num_features})`);
              forwardOps.push(`        x = self.${layerName}(x)`);
              break;
          }
        }
        
        let definitions = [
          `class ${modelName}(nn.Module):`,
          '    def __init__(self):',
          '        super().__init__()',
          ...layerInits,
          '',
          '    def forward(self, x):',
          ...forwardOps,
          '        return x'
        ];
        
        // Add training methods
        if (includeTraining) {
          definitions.push(
            '',
            '    def configure_optimizer(self):',
            `        return optim.${optimizer.title()}(self.parameters(), lr=${learningRate})`,
            '',
            '    def training_step(self, batch, criterion):',
            '        inputs, targets = batch',
            '        outputs = self(inputs)',
            '        loss = criterion(outputs, targets)',
            '        return loss, outputs',
            '',
            '    def validation_step(self, batch, criterion):',
            '        with torch.no_grad():',
            '            inputs, targets = batch',
            '            outputs = self(inputs)',
            '            loss = criterion(outputs, targets)',
            '            return loss, outputs'
          );
        }
        
        let instantiations = [
          `# Create ${modelName} instance`,
          `model = ${modelName}()`,
          '',
          '# Model summary',
          'total_params = sum(p.numel() for p in model.parameters())',
          'trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)',
          'summary = {',
          '    "total_parameters": total_params,',
          '    "trainable_parameters": trainable_params,',
          `    "architecture": ${JSON.stringify(architecture)}`,
          '}'
        ];
        
        if (includeTraining) {
          instantiations.push(
            '',
            '# Configure optimizer',
            'optimizer = model.configure_optimizer()'
          );
        }
        
        return {
          imports,
          definitions,
          instantiations,
          usage: {
            forward: includeTraining ? 
              'output = model(input)\nloss, pred = model.training_step((input, target), criterion)' :
              'output = model(input)',
            named_parameters: '("model", model), ("summary", summary)'
          }
        };
      },
      
      getDependencies: () => ['torch'],
      getOutputs: () => ['model', 'summary'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity(['torch']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Simple MLP: linear layers with ReLU activation',
      'CNN: convolutional layers with batch normalization',
      'Complex architecture: mixed layer types with dropout'
    ]);
  }
}

/**
 * Training Pipeline Node
 */
class TrainingPipelineNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Training Pipeline';
    this.nodeType = NodeType.TRAINER;
    this.description = 'Complete training pipeline with metrics, checkpointing, and early stopping';
    
    this.inputs = [
      DevUtils.createInput('model', 'model', 'PyTorch model to train', true),
      DevUtils.createInput('trainLoader', 'dataloader', 'Training data loader', true),
      DevUtils.createInput('valLoader', 'dataloader', 'Validation data loader', false)
    ];
    
    this.outputs = [
      DevUtils.createOutput('trainedModel', 'model', 'Trained model'),
      DevUtils.createOutput('metrics', 'dict', 'Training metrics and history'),
      DevUtils.createOutput('checkpoints', 'dict', 'Model checkpoints')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        epochs: DevUtils.createProperty('number', 100, 'Number of training epochs', true),
        lossFunction: DevUtils.createProperty('string', 'CrossEntropyLoss', 'Loss function', false, {
          enum: ['CrossEntropyLoss', 'MSELoss', 'BCELoss', 'L1Loss']
        }),
        metrics: DevUtils.createProperty('array', ['accuracy'], 'Metrics to track', false, {
          items: { type: 'string', enum: ['accuracy', 'precision', 'recall', 'f1'] }
        }),
        patience: DevUtils.createProperty('number', 10, 'Early stopping patience'),
        checkpointEvery: DevUtils.createProperty('number', 10, 'Save checkpoint every N epochs'),
        logEvery: DevUtils.createProperty('number', 100, 'Log metrics every N batches')
      },
      required: ['epochs']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const epochs = settings.epochs || 100;
        const lossFunction = settings.lossFunction || 'CrossEntropyLoss';
        const metrics = settings.metrics || ['accuracy'];
        const patience = settings.patience || 10;
        const checkpointEvery = settings.checkpointEvery || 10;
        const logEvery = settings.logEvery || 100;
        
        return {
          imports: [
            'import torch',
            'import torch.nn as nn',
            'import torch.optim as optim',
            'import time',
            'import os',
            'from collections import defaultdict'
          ],
          definitions: [
            'class TrainingPipeline:',
            '    def __init__(self, model, train_loader, val_loader=None, device="cpu"):',
            '        self.model = model',
            '        self.train_loader = train_loader',
            '        self.val_loader = val_loader',
            '        self.device = device',
            '        self.model.to(device)',
            '        ',
            '        self.history = defaultdict(list)',
            '        self.best_val_loss = float("inf")',
            '        self.patience_counter = 0',
            '        self.checkpoints = {}',
            '',
            '    def calculate_accuracy(self, outputs, targets):',
            '        _, predicted = torch.max(outputs.data, 1)',
            '        total = targets.size(0)',
            '        correct = (predicted == targets).sum().item()',
            '        return correct / total',
            '',
            '    def train_epoch(self, optimizer, criterion):',
            '        self.model.train()',
            '        running_loss = 0.0',
            '        running_metrics = defaultdict(float)',
            '        batch_count = 0',
            '        ',
            '        for batch_idx, (data, target) in enumerate(self.train_loader):',
            '            data, target = data.to(self.device), target.to(self.device)',
            '            ',
            '            optimizer.zero_grad()',
            '            output = self.model(data)',
            '            loss = criterion(output, target)',
            '            loss.backward()',
            '            optimizer.step()',
            '            ',
            '            running_loss += loss.item()',
            '            batch_count += 1',
            '            ',
            ...metrics.includes('accuracy') ? [
              '            # Calculate accuracy',
              '            acc = self.calculate_accuracy(output, target)',
              '            running_metrics["accuracy"] += acc'
            ] : [],
            '            ',
            `            if batch_idx % ${logEvery} == 0:`,
            '                print(f"Batch {batch_idx}/{len(self.train_loader)}, Loss: {loss.item():.4f}")',
            '        ',
            '        epoch_loss = running_loss / batch_count',
            '        epoch_metrics = {k: v / batch_count for k, v in running_metrics.items()}',
            '        ',
            '        return epoch_loss, epoch_metrics',
            '',
            '    def validate_epoch(self, criterion):',
            '        if self.val_loader is None:',
            '            return None, None',
            '            ',
            '        self.model.eval()',
            '        running_loss = 0.0',
            '        running_metrics = defaultdict(float)',
            '        batch_count = 0',
            '        ',
            '        with torch.no_grad():',
            '            for data, target in self.val_loader:',
            '                data, target = data.to(self.device), target.to(self.device)',
            '                output = self.model(data)',
            '                loss = criterion(output, target)',
            '                ',
            '                running_loss += loss.item()',
            '                batch_count += 1',
            '                ',
            ...metrics.includes('accuracy') ? [
              '                acc = self.calculate_accuracy(output, target)',
              '                running_metrics["accuracy"] += acc'
            ] : [],
            '        ',
            '        epoch_loss = running_loss / batch_count',
            '        epoch_metrics = {k: v / batch_count for k, v in running_metrics.items()}',
            '        ',
            '        return epoch_loss, epoch_metrics',
            '',
            '    def save_checkpoint(self, epoch, optimizer, loss):',
            '        checkpoint = {',
            '            "epoch": epoch,',
            '            "model_state_dict": self.model.state_dict(),',
            '            "optimizer_state_dict": optimizer.state_dict(),',
            '            "loss": loss,',
            '            "history": dict(self.history)',
            '        }',
            '        ',
            '        checkpoint_path = f"checkpoint_epoch_{epoch}.pth"',
            '        torch.save(checkpoint, checkpoint_path)',
            '        self.checkpoints[epoch] = checkpoint_path',
            '        ',
            '        return checkpoint_path',
            '',
            '    def train(self):',
            '        optimizer = self.model.configure_optimizer() if hasattr(self.model, "configure_optimizer") else optim.Adam(self.model.parameters())',
            `        criterion = getattr(nn, "${lossFunction}")()`,
            '        ',
            '        print(f"Starting training for {epochs} epochs...")',
            '        start_time = time.time()',
            '        ',
            `        for epoch in range(${epochs}):`,
            '            epoch_start = time.time()',
            '            ',
            '            # Training',
            '            train_loss, train_metrics = self.train_epoch(optimizer, criterion)',
            '            self.history["train_loss"].append(train_loss)',
            '            ',
            '            for metric, value in train_metrics.items():',
            '                self.history[f"train_{metric}"].append(value)',
            '            ',
            '            # Validation',
            '            val_loss, val_metrics = self.validate_epoch(criterion)',
            '            if val_loss is not None:',
            '                self.history["val_loss"].append(val_loss)',
            '                for metric, value in val_metrics.items():',
            '                    self.history[f"val_{metric}"].append(value)',
            '                ',
            '                # Early stopping',
            '                if val_loss < self.best_val_loss:',
            '                    self.best_val_loss = val_loss',
            '                    self.patience_counter = 0',
            '                else:',
            f'                    self.patience_counter += 1',
            f'                    if self.patience_counter >= {patience}:',
            '                        print(f"Early stopping at epoch {epoch}")',
            '                        break',
            '            ',
            '            # Checkpointing',
            `            if epoch % ${checkpointEvery} == 0:`,
            '                self.save_checkpoint(epoch, optimizer, train_loss)',
            '            ',
            '            # Logging',
            '            epoch_time = time.time() - epoch_start',
            '            print(f"Epoch {epoch}: Train Loss: {train_loss:.4f}, Time: {epoch_time:.2f}s")',
            '            if val_loss is not None:',
            '                print(f"          Val Loss: {val_loss:.4f}")',
            '        ',
            '        total_time = time.time() - start_time',
            '        print(f"Training completed in {total_time:.2f}s")',
            '        ',
            '        # Final metrics',
            '        metrics_summary = {',
            '            "total_time": total_time,',
            '            "best_val_loss": self.best_val_loss,',
            '            "final_train_loss": self.history["train_loss"][-1],',
            '            "history": dict(self.history)',
            '        }',
            '        ',
            '        return self.model, metrics_summary, self.checkpoints'
          ],
          instantiations: [
            '# Setup training pipeline',
            'device = torch.device("cuda" if torch.cuda.is_available() else "cpu")',
            'trainer = TrainingPipeline(model, train_loader, val_loader, device)',
            '',
            '# Start training',
            'trained_model, metrics, checkpoints = trainer.train()'
          ],
          usage: {
            forward: 'trained_model, metrics, checkpoints = trainer.train()',
            named_parameters: '("trainedModel", trained_model), ("metrics", metrics), ("checkpoints", checkpoints)'
          }
        };
      },
      
      getDependencies: () => ['torch'],
      getOutputs: () => ['trainedModel', 'metrics', 'checkpoints'],
      validateConnections: (sourceOutputs, targetInputs) => {
        // Ensure model and dataloader inputs are connected
        const hasModel = sourceOutputs.some(out => out.type === 'model');
        const hasDataLoader = sourceOutputs.some(out => out.type === 'dataloader');
        return hasModel && hasDataLoader;
      }
    };

    this.security = DevUtils.createBasicSecurity(['torch']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Basic training: 100 epochs with early stopping',
      'Advanced: custom metrics, checkpointing every 5 epochs',
      'Production: comprehensive logging and validation'
    ]);
  }
}

/**
 * Hyperparameter Optimizer Node
 */
class HyperparameterOptimizerNode extends BaseNode {
  constructor() {
    super();
    
    this.name = 'Hyperparameter Optimizer';
    this.nodeType = NodeType.CUSTOM;
    this.description = 'Automated hyperparameter optimization using grid search or random search';
    
    this.inputs = [
      DevUtils.createInput('modelBuilder', 'function', 'Model building function', true),
      DevUtils.createInput('trainData', 'dataloader', 'Training data', true)
    ];
    
    this.outputs = [
      DevUtils.createOutput('bestModel', 'model', 'Best performing model'),
      DevUtils.createOutput('bestParams', 'dict', 'Best hyperparameters'),
      DevUtils.createOutput('results', 'dict', 'All optimization results')
    ];
    
    this.schema = {
      type: 'object',
      properties: {
        searchType: DevUtils.createProperty('string', 'grid', 'Search strategy', false, {
          enum: ['grid', 'random', 'bayesian']
        }),
        parameterSpace: DevUtils.createProperty('object', {}, 'Parameter search space', true),
        maxTrials: DevUtils.createProperty('number', 20, 'Maximum number of trials'),
        metric: DevUtils.createProperty('string', 'val_loss', 'Optimization metric'),
        direction: DevUtils.createProperty('string', 'minimize', 'Optimization direction', false, {
          enum: ['minimize', 'maximize']
        })
      },
      required: ['parameterSpace']
    };

    this.codeGeneration = {
      generateCode: (settings, context) => {
        const searchType = settings.searchType || 'grid';
        const parameterSpace = settings.parameterSpace || {};
        const maxTrials = settings.maxTrials || 20;
        const metric = settings.metric || 'val_loss';
        const direction = settings.direction || 'minimize';
        
        return {
          imports: [
            'import torch',
            'import itertools',
            'import random',
            'import numpy as np',
            'from copy import deepcopy'
          ],
          definitions: [
            'class HyperparameterOptimizer:',
            '    def __init__(self, model_builder, train_data, val_data=None):',
            '        self.model_builder = model_builder',
            '        self.train_data = train_data',
            '        self.val_data = val_data',
            '        self.results = []',
            '        self.best_score = float("inf") if "minimize" == "minimize" else float("-inf")',
            '        self.best_params = None',
            '        self.best_model = None',
            '',
            '    def generate_parameter_combinations(self, param_space):',
            `        if "${searchType}" == "grid":`,
            '            # Grid search - all combinations',
            '            keys = list(param_space.keys())',
            '            values = list(param_space.values())',
            '            combinations = list(itertools.product(*values))',
            '            return [dict(zip(keys, combo)) for combo in combinations]',
            `        elif "${searchType}" == "random":`,
            '            # Random search',
            '            combinations = []',
            `            for _ in range(${maxTrials}):`,
            '                combo = {}',
            '                for key, values in param_space.items():',
            '                    combo[key] = random.choice(values)',
            '                combinations.append(combo)',
            '            return combinations',
            '        else:',
            '            raise ValueError(f"Unknown search type: {search_type}")',
            '',
            '    def evaluate_parameters(self, params):',
            '        # Build model with parameters',
            '        model = self.model_builder(**params)',
            '        ',
            '        # Quick training (you might want to make this more sophisticated)',
            '        optimizer = torch.optim.Adam(model.parameters(), lr=params.get("learning_rate", 0.001))',
            '        criterion = torch.nn.CrossEntropyLoss()',
            '        ',
            '        model.train()',
            '        total_loss = 0',
            '        batch_count = 0',
            '        ',
            '        # Train for a few epochs',
            '        for epoch in range(params.get("eval_epochs", 5)):',
            '            for batch_idx, (data, target) in enumerate(self.train_data):',
            '                optimizer.zero_grad()',
            '                output = model(data)',
            '                loss = criterion(output, target)',
            '                loss.backward()',
            '                optimizer.step()',
            '                ',
            '                total_loss += loss.item()',
            '                batch_count += 1',
            '                ',
            '                # Quick evaluation - don\'t train too long',
            '                if batch_count > 100:',
            '                    break',
            '            if batch_count > 100:',
            '                break',
            '        ',
            '        avg_loss = total_loss / batch_count if batch_count > 0 else float("inf")',
            '        ',
            '        # Validation if available',
            '        if self.val_data:',
            '            model.eval()',
            '            val_loss = 0',
            '            val_count = 0',
            '            with torch.no_grad():',
            '                for data, target in self.val_data:',
            '                    output = model(data)',
            '                    loss = criterion(output, target)',
            '                    val_loss += loss.item()',
            '                    val_count += 1',
            '                    if val_count > 20:  # Quick validation',
            '                        break',
            '            avg_loss = val_loss / val_count if val_count > 0 else avg_loss',
            '        ',
            '        return avg_loss, model',
            '',
            '    def optimize(self, param_space):',
            '        print(f"Starting hyperparameter optimization with {len(param_space)} parameter combinations...")',
            '        ',
            '        combinations = self.generate_parameter_combinations(param_space)',
            `        combinations = combinations[:${maxTrials}]  # Limit trials`,
            '        ',
            '        for i, params in enumerate(combinations):',
            '            print(f"Trial {i+1}/{len(combinations)}: {params}")',
            '            ',
            '            try:',
            '                score, model = self.evaluate_parameters(params)',
            '                ',
            '                result = {',
            '                    "trial": i,',
            '                    "params": params.copy(),',
            f'                    "{metric}": score,',
            '                    "model": deepcopy(model.state_dict())',
            '                }',
            '                self.results.append(result)',
            '                ',
            f'                # Check if this is the best score',
            f'                is_better = score < self.best_score if "{direction}" == "minimize" else score > self.best_score',
            '                if is_better:',
            '                    self.best_score = score',
            '                    self.best_params = params.copy()',
            '                    self.best_model = deepcopy(model)',
            '                ',
            f'                print(f"  Score: {score:.4f} (Best: {self.best_score:.4f})")',
            '                ',
            '            except Exception as e:',
            '                print(f"  Trial failed: {e}")',
            '                continue',
            '        ',
            '        print(f"Optimization complete! Best score: {self.best_score:.4f}")',
            '        print(f"Best parameters: {self.best_params}")',
            '        ',
            '        return self.best_model, self.best_params, self.results'
          ],
          instantiations: [
            '# Setup hyperparameter optimizer',
            'optimizer = HyperparameterOptimizer(model_builder, train_data, val_data)',
            '',
            '# Define parameter space',
            `param_space = ${JSON.stringify(parameterSpace, null, 2)}`,
            '',
            '# Run optimization',
            'best_model, best_params, results = optimizer.optimize(param_space)'
          ],
          usage: {
            forward: 'best_model, best_params, results = optimizer.optimize(param_space)',
            named_parameters: '("bestModel", best_model), ("bestParams", best_params), ("results", results)'
          }
        };
      },
      
      getDependencies: () => ['torch', 'numpy'],
      getOutputs: () => ['bestModel', 'bestParams', 'results'],
      validateConnections: () => true
    };

    this.security = DevUtils.createBasicSecurity(['torch', 'numpy']);
    this.quality = DevUtils.createBasicQuality('1.0.0', [
      'Grid search: learning_rate=[0.001, 0.01], batch_size=[16, 32]',
      'Random search: 50 trials with continuous parameters',
      'Complex space: architecture, optimizer, and regularization'
    ]);
  }
}

module.exports = createPlugin({
  name: '{{projectName}}',
  version: '1.0.0',
  description: '{{description}}',
  author: '{{author}}',
  nodes: {
    ModelBuilderNode,
    TrainingPipelineNode,
    HyperparameterOptimizerNode
  }
}); 