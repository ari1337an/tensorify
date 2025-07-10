/**
 * Executor service type definitions
 */

/** Executor configuration options */
export interface ExecutorConfig {
  /** Memory limit in MB for the isolated VM (default: 128) */
  memoryLimit?: number;
  /** Execution timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable debug mode for detailed execution logs (default: false) */
  debug?: boolean;
}

/**
 * Code execution context for plugin execution
 *
 * This interface defines the execution context for plugins, supporting
 * flexible entry points and payload-based data passing.
 */
export interface ExecutionContext {
  /** The JavaScript code to execute (plugin source code) */
  code: string;

  /**
   * Payload data to pass to the plugin
   *
   * Can be any JSON-serializable data structure. This replaces the old 'settings'
   * parameter and provides more flexibility for plugin data.
   *
   * @example
   * ```typescript
   * // Simple data
   * { dataset: "users.csv", threshold: 0.5 }
   *
   * // Complex nested data
   * {
   *   source: {
   *     type: "database",
   *     connection: "postgresql://localhost/db",
   *     query: "SELECT * FROM users"
   *   },
   *   transformations: [
   *     { type: "filter", condition: "age > 18" },
   *     { type: "sort", field: "name" }
   *   ],
   *   output: {
   *     format: "json",
   *     destination: "/output/processed.json"
   *   }
   * }
   * ```
   */
  payload: any;

  /**
   * Entry point to execute in the plugin
   *
   * Supports various entry point patterns:
   * - Simple functions: "functionName"
   * - Class methods: "ClassName.methodName"
   * - Nested object methods: "object.nested.method"
   * - Deep nesting: "services.ml.models.predict"
   *
   * The executor will automatically handle class instantiation and
   * method resolution.
   *
   * @example
   * ```typescript
   * // Simple function call
   * "processData"
   *
   * // Class method (auto-instantiated)
   * "DataProcessor.transform"
   *
   * // Nested object method
   * "utils.math.calculate"
   *
   * // Deep service method
   * "services.ml.models.RandomForest.train"
   * ```
   */
  entryPointString: string;

  /** Optional additional context data for advanced use cases */
  context?: Record<string, any>;
}

/**
 * Code execution result
 *
 * Contains the result of plugin execution along with metadata
 * about performance and resource usage.
 */
export interface ExecutionResult {
  /** The generated code string returned by the plugin */
  result: string;

  /** Execution statistics and performance metrics */
  stats: {
    /** Execution time in milliseconds */
    executionTime: number;
    /** Memory usage information */
    memoryUsage: {
      /** Heap memory used in bytes */
      heapUsed: number;
      /** Total heap memory allocated in bytes */
      heapTotal: number;
      /** External memory used in bytes */
      external: number;
    };
  };

  /** Console logs and debug output from plugin execution */
  logs?: string[];

  /** Any errors that occurred during execution */
  errors?: string[];
}

/**
 * VM context setup options
 *
 * Advanced options for customizing the isolated VM environment.
 * Most users won't need to use these options directly.
 */
export interface VMContextOptions {
  /** Global objects to make available in the VM context */
  globals?: Record<string, any>;

  /** Modules to make available for require() calls */
  modules?: Record<string, any>;

  /** Whether to enable console logging in the VM (default: false) */
  enableConsole?: boolean;
}
