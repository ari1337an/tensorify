/**
 * @tensorify.io/plugin-engine
 *
 * A professional TypeScript library for executing Tensorify plugins in isolated environments.
 * Supports dependency injection, proper error handling, and comprehensive type safety.
 */

// Main classes - Primary API
export { PluginEngine } from "./core/plugin-engine";
export { PluginEngineFactory } from "./factory/engine.factory";

// Service implementations
export { S3StorageService } from "./services/storage.service";
export { IsolatedVMExecutorService } from "./services/executor.service";

// Interfaces for dependency injection
export type { IStorageService } from "./interfaces/storage.interface";
export type { IExecutorService } from "./interfaces/executor.interface";

// Type definitions - Export all types for user convenience
export type {
  // Plugin types
  PluginSettings,
  PluginExecutionResult,
  PluginManifest,
  PluginCodeStructure,

  // Engine types
  EngineConfig,
  EngineOptions,
  EngineFactoryConfig,

  // Storage types
  StorageConfig,
  StorageFileInfo,
  StorageOperationResult,

  // Executor types
  ExecutorConfig,
  ExecutionContext,
  ExecutionResult,
  VMContextOptions,
} from "./types";

// Error classes
export {
  PluginEngineError,
  StorageError,
  PluginNotFoundError,
  ExecutionError,
  PluginValidationError,
  TimeoutError,
  MemoryLimitError,
  InvalidPluginStructureError,
  ConfigurationError,
} from "./errors/plugin-engine.errors";

/**
 * Main function for simple plugin execution - Primary API
 *
 * @example
 * ```typescript
 * import { getExecutionResult } from '@tensorify.io/plugin-engine';
 *
 * const result = await getExecutionResult('my-plugin', { inputData: 'test' });
 * console.log(result.code); // Generated code string
 * ```
 *
 * @param pluginSlug - Unique identifier for the plugin
 * @param settings - Settings to pass to the plugin
 * @param s3Client - Optional S3 client instance (if not provided, uses default)
 * @param bucketName - S3 bucket name (optional if set in environment)
 * @returns Promise resolving to the execution result with generated code
 */
export async function getExecutionResult(
  pluginSlug: string,
  settings: Record<string, any>,
  options?: {
    s3Client?: any; // Using any to avoid forcing users to import S3Client
    bucketName?: string;
    region?: string;
    debug?: boolean;
    executionTimeout?: number;
    memoryLimit?: number;
  }
): Promise<string> {
  // Lazy import S3Client to avoid requiring AWS SDK at module level
  const { S3Client } = await import("@aws-sdk/client-s3");

  // Use environment variables as defaults
  const bucketName = options?.bucketName || process.env.TENSORIFY_PLUGIN_BUCKET;
  const region = options?.region || process.env.AWS_REGION || "us-east-1";

  if (!bucketName) {
    throw new Error(
      "Bucket name must be provided either as parameter or TENSORIFY_PLUGIN_BUCKET environment variable"
    );
  }

  // Create or use provided S3 client
  const s3Client = options?.s3Client || new S3Client({ region });

  // Create factory and engine
  const { PluginEngineFactory } = await import('./factory/engine.factory');
  const factory = new PluginEngineFactory();
  const engine = factory.createWithS3Client(s3Client, {
    bucketName,
    debug: options?.debug || false,
    executionTimeout: options?.executionTimeout,
    memoryLimit: options?.memoryLimit,
  });

  try {
    const result = await engine.getExecutionResult(pluginSlug, settings);
    return result.code;
  } finally {
    await engine.dispose();
  }
}

// Export interfaces separately for better intellisense
export * from "./interfaces";
export * from "./types";
