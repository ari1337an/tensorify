/**
 * Development Utilities for Plugin Authors
 */

import { 
  NodeInput, 
  NodeOutput, 
  NodeSecurity, 
  NodeQuality, 
  PropertySchema,
  PluginExport 
} from './types';
import { BaseNode } from './base-node';

export class DevUtils {
  /**
   * Create input configuration
   */
  static createInput(
    name: string, 
    type: string, 
    description: string, 
    required: boolean = true
  ): NodeInput {
    return { name, type, required, description };
  }

  /**
   * Create output configuration
   */
  static createOutput(
    name: string, 
    type: string, 
    description: string
  ): NodeOutput {
    return { name, type, description };
  }

  /**
   * Create property schema
   */
  static createProperty(
    type: PropertySchema['type'],
    defaultValue: any,
    description: string,
    required: boolean = false,
    options: Record<string, any> = {}
  ): PropertySchema {
    return {
      type,
      default: defaultValue,
      description,
      required,
      ...options
    };
  }

  /**
   * Create basic security configuration
   */
  static createBasicSecurity(additionalImports: string[] = []): NodeSecurity {
    return {
      allowedImports: ['torch', 'numpy', 'os', 'json', ...additionalImports],
      maxExecutionTime: 30000,
      memoryLimit: 512 * 1024 * 1024, // 512MB
      sandbox: true
    };
  }

  /**
   * Create basic quality configuration
   */
  static createBasicQuality(
    version: string = '1.0.0', 
    examples: string[] = []
  ): NodeQuality {
    return {
      testCoverage: 0.8,
      documentation: 'Plugin node created with Tensorify SDK',
      version,
      examples
    };
  }

  /**
   * Validate plugin configuration
   */
  static validatePlugin(plugin: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!plugin.name || typeof plugin.name !== 'string') {
      errors.push('Plugin name is required and must be a string');
    }
    if (!plugin.version || typeof plugin.version !== 'string') {
      errors.push('Plugin version is required and must be a string');
    }
    if (!plugin.description || typeof plugin.description !== 'string') {
      errors.push('Plugin description is required and must be a string');
    }
    if (!plugin.nodes || typeof plugin.nodes !== 'object') {
      errors.push('Plugin nodes is required and must be an object');
    }

    // Validate nodes
    if (plugin.nodes) {
      for (const [nodeName, NodeClass] of Object.entries(plugin.nodes)) {
        try {
          if (typeof NodeClass !== 'function') {
            errors.push(`Node "${nodeName}" must be a class constructor`);
            continue;
          }
          
          const instance = new (NodeClass as any)();
          if (!(instance instanceof BaseNode)) {
            errors.push(`Node "${nodeName}" must extend BaseNode`);
          }
        } catch (error) {
          errors.push(`Node "${nodeName}" validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Create and validate a plugin
 */
export function createPlugin(config: PluginExport): PluginExport {
  const validation = DevUtils.validatePlugin(config);
  if (!validation.valid) {
    throw new Error(`Plugin validation failed:\n${validation.errors.join('\n')}`);
  }
  return config;
} 