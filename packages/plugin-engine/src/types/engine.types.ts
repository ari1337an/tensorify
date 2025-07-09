/**
 * Engine configuration type definitions
 */

import type { IStorageService } from "../interfaces/storage.interface";
import type { IExecutorService } from "../interfaces/executor.interface";

/** Engine configuration options */
export interface EngineConfig {
  /** S3 storage service instance for dependency injection */
  storageService: IStorageService;
  /** Code executor service instance for dependency injection */
  executorService?: IExecutorService;
  /** S3 bucket name where plugins are stored */
  bucketName: string;
  /** Optional base path for plugin folders in S3 */
  basePath?: string;
  /** Timeout for plugin execution in milliseconds */
  executionTimeout?: number;
  /** Memory limit for isolated VM in MB */
  memoryLimit?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/** Engine options for creating instances */
export interface EngineOptions {
  /** S3 bucket name where plugins are stored */
  bucketName: string;
  /** Optional base path for plugin folders in S3 */
  basePath?: string;
  /** Timeout for plugin execution in milliseconds (default: 30000) */
  executionTimeout?: number;
  /** Memory limit for isolated VM in MB (default: 128) */
  memoryLimit?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/** Engine factory configuration */
export interface EngineFactoryConfig {
  /** Default bucket name */
  defaultBucketName?: string;
  /** Default execution timeout */
  defaultExecutionTimeout?: number;
  /** Default memory limit */
  defaultMemoryLimit?: number;
  /** Default debug setting */
  defaultDebug?: boolean;
}
