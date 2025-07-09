/**
 * Plugin-related type definitions
 */

/** Settings that can be passed to a plugin */
export type PluginSettings = Record<string, any>;

/** The result returned by a plugin execution */
export interface PluginExecutionResult {
  /** The generated code string */
  code: string;
  /** Optional metadata about the execution */
  metadata?: {
    /** Execution time in milliseconds */
    executionTime?: number;
    /** Memory usage information */
    memoryUsage?: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    /** Any warnings generated during execution */
    warnings?: string[];
  };
}

/** Plugin manifest information */
export interface PluginManifest {
  /** Unique plugin identifier */
  slug: string;
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description?: string;
  /** Plugin author */
  author?: string;
  /** Supported engine versions */
  engineVersion?: string;
}

/** Plugin code structure that should be present in the fetched index.js */
export interface PluginCodeStructure {
  /** The main plugin class constructor */
  new (): {
    /** Code generation module */
    codeGeneration: {
      /** Main function that generates code based on settings */
      generateCode: (settings: PluginSettings) => string;
    };
  };
}
