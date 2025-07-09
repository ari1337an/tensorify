/**
 * Custom error classes for the plugin engine
 */

/**
 * Base error class for all plugin engine errors
 */
export abstract class PluginEngineError extends Error {
  public readonly timestamp: Date;
  public code: string;

  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();

    if (cause) {
      this.cause = cause;
    }

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when storage operations fail
 */
export class StorageError extends PluginEngineError {
  public readonly bucketName: string | undefined;
  public readonly key: string | undefined;

  constructor(
    message: string,
    bucketName?: string,
    key?: string,
    cause?: Error
  ) {
    super(message, "STORAGE_ERROR", cause);
    this.bucketName = bucketName;
    this.key = key;
  }
}

/**
 * Error thrown when plugin file is not found
 */
export class PluginNotFoundError extends StorageError {
  constructor(pluginSlug: string, bucketName: string, cause?: Error) {
    super(
      `Plugin '${pluginSlug}' not found in bucket '${bucketName}'`,
      bucketName,
      `${pluginSlug}/index.js`,
      cause
    );
    this.code = "PLUGIN_NOT_FOUND";
  }
}

/**
 * Error thrown when code execution fails
 */
export class ExecutionError extends PluginEngineError {
  public readonly executionTime: number | undefined;
  public readonly memoryUsage: number | undefined;

  constructor(
    message: string,
    executionTime?: number,
    memoryUsage?: number,
    cause?: Error
  ) {
    super(message, "EXECUTION_ERROR", cause);
    this.executionTime = executionTime;
    this.memoryUsage = memoryUsage;
  }
}

/**
 * Error thrown when plugin code validation fails
 */
export class PluginValidationError extends PluginEngineError {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[] = [], cause?: Error) {
    super(message, "PLUGIN_VALIDATION_ERROR", cause);
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when execution times out
 */
export class TimeoutError extends ExecutionError {
  public readonly timeoutMs: number;

  constructor(timeoutMs: number, cause?: Error) {
    super(
      `Execution timed out after ${timeoutMs}ms`,
      undefined,
      undefined,
      cause
    );
    this.code = "EXECUTION_TIMEOUT";
    this.timeoutMs = timeoutMs;
  }
}

/**
 * Error thrown when memory limit is exceeded
 */
export class MemoryLimitError extends ExecutionError {
  public readonly limitMB: number;
  public readonly usedMB: number;

  constructor(limitMB: number, usedMB: number, cause?: Error) {
    super(
      `Memory limit exceeded: ${usedMB}MB used, limit: ${limitMB}MB`,
      undefined,
      usedMB,
      cause
    );
    this.code = "MEMORY_LIMIT_EXCEEDED";
    this.limitMB = limitMB;
    this.usedMB = usedMB;
  }
}

/**
 * Error thrown when plugin structure is invalid
 */
export class InvalidPluginStructureError extends PluginValidationError {
  constructor(pluginSlug: string, expectedStructure: string, cause?: Error) {
    super(
      `Plugin '${pluginSlug}' has invalid structure. Expected: ${expectedStructure}`,
      [`Invalid plugin structure for '${pluginSlug}'`],
      cause
    );
    this.code = "INVALID_PLUGIN_STRUCTURE";
  }
}

/**
 * Error thrown when engine configuration is invalid
 */
export class ConfigurationError extends PluginEngineError {
  public readonly configField: string | undefined;

  constructor(message: string, configField?: string, cause?: Error) {
    super(message, "CONFIGURATION_ERROR", cause);
    this.configField = configField;
  }
}
