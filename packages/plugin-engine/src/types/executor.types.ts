/**
 * Executor service type definitions
 */

import type { PluginSettings } from "./plugin.types";

/** Executor configuration options */
export interface ExecutorConfig {
  /** Memory limit in MB for the isolated VM */
  memoryLimit?: number;
  /** Execution timeout in milliseconds */
  timeout?: number;
  /** Enable debug mode */
  debug?: boolean;
}

/** Code execution context */
export interface ExecutionContext {
  /** The JavaScript code to execute */
  code: string;
  /** Settings to pass to the plugin */
  settings: PluginSettings;
  /** Optional context data */
  context?: Record<string, any>;
}

/** Code execution result */
export interface ExecutionResult {
  /** The generated code string */
  result: string;
  /** Execution statistics */
  stats: {
    /** Execution time in milliseconds */
    executionTime: number;
    /** Memory usage information */
    memoryUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  /** Any warnings or logs from execution */
  logs?: string[];
  /** Any errors that occurred during execution */
  errors?: string[];
}

/** VM context setup options */
export interface VMContextOptions {
  /** Global objects to make available in the VM */
  globals?: Record<string, any>;
  /** Modules to make available for require() */
  modules?: Record<string, any>;
  /** Whether to enable console logging */
  enableConsole?: boolean;
}
