/**
 * Base Node Class for Tensorify Plugins
 */

import { 
  NodeType, 
  NodeInput, 
  NodeOutput, 
  NodeSecurity, 
  NodeQuality, 
  CodeGeneration,
  NodeSchema
} from './types';

/**
 * Base class that all plugin nodes must extend
 */
export abstract class BaseNode {
  abstract name: string;
  abstract nodeType: NodeType;
  abstract description: string;
  abstract inputs: NodeInput[];
  abstract outputs: NodeOutput[];
  abstract schema: NodeSchema;
  abstract codeGeneration: CodeGeneration;
  abstract security: NodeSecurity;
  abstract quality: NodeQuality;

  constructor() {
    // No automatic validation - let child classes fully initialize first
  }

  /**
   * Validate the node configuration
   */
  validate(): void {
    const required = ['name', 'nodeType', 'description', 'schema', 'codeGeneration', 'security', 'quality'];
    for (const field of required) {
      if (!(this as any)[field]) {
        throw new Error(`${field} is required for node: ${this.constructor.name}`);
      }
    }
  }

  /**
   * Get node metadata
   */
  getMetadata() {
    return {
      name: this.name,
      nodeType: this.nodeType,
      description: this.description,
      inputs: this.inputs,
      outputs: this.outputs,
      version: this.quality.version
    };
  }

  /**
   * Test code generation
   */
  testCodeGeneration(settings: any, context?: any) {
    try {
      const result = this.codeGeneration.generateCode(settings, context);
      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 