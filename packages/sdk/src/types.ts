/**
 * Core Types for Tensorify SDK
 */

// Node Types
export enum NodeType {
  CUSTOM = "custom",
  DATASET = "dataset",
  DATALOADER = "dataloader",
  PREPROCESSING = "preprocessing",
  LAYER = "layer",
  MODEL = "model",
  OPTIMIZER = "optimizer",
  LOSS = "loss",
  TRAINER = "trainer",
  EVALUATOR = "evaluator"
}

// Node Configuration Interfaces
export interface NodeInput {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface NodeOutput {
  name: string;
  type: string;
  description: string;
}

export interface NodeSecurity {
  allowedImports: string[];
  maxExecutionTime: number;
  memoryLimit: number;
  sandbox: boolean;
}

export interface NodeQuality {
  testCoverage: number;
  documentation: string;
  version: string;
  examples: string[];
}

export interface CodeGeneration {
  generateCode: (settings: any, context?: any) => {
    imports: string[];
    definitions: string[];
    instantiations: string[];
    usage: {
      forward: string;
      parameters?: string;
      named_parameters: string;
    };
  };
  getDependencies: (settings: any) => string[];
  getOutputs: (settings: any) => string[];
  validateConnections: (sourceOutputs: string[], targetInputs: string[]) => boolean;
}

// Schema Types
export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'code';
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  description: string;
  required?: boolean;
  validation?: (value: any, allSettings?: any) => boolean | string;
  items?: { type: string };
}

export interface NodeSchema {
  type: 'object';
  properties: Record<string, PropertySchema>;
  required: string[];
}

// Plugin Export Interface
export interface PluginExport {
  name: string;
  version: string;
  description: string;
  author?: string;
  nodes: Record<string, new () => any>;
  config?: {
    requiredEnvironmentVars?: string[];
    recommendedMemory?: string;
    supportedPythonVersions?: string[];
  };
} 