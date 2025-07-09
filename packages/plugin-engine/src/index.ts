/**
 * @tensorify.io/plugin-engine
 *
 * A professional TypeScript library for executing Tensorify plugins in isolated environments.
 * Supports dependency injection, proper error handling, and comprehensive type safety.
 */

// Main classes - Primary API
export { PluginEngine } from "./core/plugin-engine";
export { createPluginEngine } from "./factory/engine.factory";

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
  PluginEngineOptions,

  // Storage types
  S3Config,
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

// Export interfaces separately for better intellisense
export * from "./interfaces";
export * from "./types";
