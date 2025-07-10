import { BaseNode } from './BaseNode';
import { NodeType } from '../interfaces/INode';
import { LayerSettings, CodeGenerationContext, Children } from '../types';

/**
 * Interface for trainer settings
 */
export interface TrainerSettings extends LayerSettings {
  /** Number of epochs */
  epochs?: number;
  /** Learning rate */
  learningRate?: number;
  /** Batch size */
  batchSize?: number;
  /** Model variable name */
  modelVariable?: string;
  /** Optimizer variable name */
  optimizerVariable?: string;
  /** Loss function variable name */
  lossFunctionVariable?: string;
  /** Dataloader variable name */
  dataloaderVariable?: string;
}

/**
 * Base class for trainer nodes
 * Provides common functionality for training workflows
 */
export abstract class TrainerNode<
  TSettings extends TrainerSettings = TrainerSettings
> extends BaseNode<TSettings> {
  
  /** Trainers typically don't have input lines in the traditional sense */
  public readonly inputLines: number = 0;
  
  /** Trainers typically generate training loop code */
  public readonly outputLinesCount: number = 1;
  
  /** Trainers may have secondary inputs for validation data */
  public readonly secondaryInputLinesCount: number = 0;
  
  /** Node type is always TRAINER */
  public readonly nodeType: NodeType = NodeType.TRAINER;

  /**
   * Get imports commonly needed for training
   */
  public getImports(context?: CodeGenerationContext): string[] {
    const framework = context?.framework || 'pytorch';
    
    switch (framework) {
      case 'pytorch':
        return [
          'import torch',
          'import torch.nn as nn',
          'import torch.optim as optim',
          'from torch.utils.data import DataLoader'
        ];
      case 'tensorflow':
        return ['import tensorflow as tf'];
      default:
        return [];
    }
  }

  /**
   * Build training function definition
   */
  protected buildTrainingFunction(
    functionName: string,
    parameters: string[],
    body: string
  ): string {
    const paramStr = parameters.join(', ');
    return `def ${functionName}(${paramStr}):\n${this.indentCode(body, 1)}`;
  }

  /**
   * Build training loop structure
   */
  protected buildTrainingLoop(
    epochLoop: string,
    batchLoop: string,
    settings: TSettings
  ): string {
    const epochs = settings.epochs || 1;
    
    return `
for epoch in range(${epochs}):
${this.indentCode(epochLoop, 1)}
${this.indentCode(batchLoop, 1)}
    `.trim();
  }

  /**
   * Validate trainer settings
   */
  public validateSettings(settings: TSettings): boolean {
    super.validateSettings(settings);
    
    // Validate numeric parameters
    const numericParams = ['epochs', 'learningRate', 'batchSize'];
    numericParams.forEach(param => {
      const value = settings[param];
      if (value !== undefined) {
        if (typeof value !== 'number' || value <= 0) {
          throw new Error(`${param} must be a positive number, got: ${value}`);
        }
      }
    });

    // Validate required variable names
    const requiredVars = ['modelVariable', 'optimizerVariable', 'lossFunctionVariable'];
    requiredVars.forEach(varName => {
      const value = settings[varName];
      if (value !== undefined && typeof value !== 'string') {
        throw new Error(`${varName} must be a string, got: ${typeof value}`);
      }
    });

    return true;
  }
} 