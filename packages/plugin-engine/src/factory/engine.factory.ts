/**
 * Factory for creating Plugin Engine instances
 */

import { PluginEngine } from "../core/plugin-engine";
import { S3StorageService } from "../services/storage.service";
import type { PluginEngineOptions } from "../types/engine.types";
import type { S3Config } from "../types/storage.types";
import { ConfigurationError } from "../errors/plugin-engine.errors";

/**
 * Create a plugin engine with S3 configuration
 *
 * @param s3Config - S3 configuration that maps directly to S3Client constructor options
 * @param bucketName - S3 bucket name where plugins are stored
 * @param options - Optional engine options
 * @returns New PluginEngine instance
 *
 * @example
 * ```typescript
 * const engine = createPluginEngine({
 *   region: process.env.S3_REGION || "us-east-1",
 *   endpoint: process.env.S3_ENDPOINT,
 *   credentials: {
 *     accessKeyId: process.env.S3_ACCESS_KEY_ID!,
 *     secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
 *   },
 *   forcePathStyle: !!process.env.S3_ENDPOINT,
 * }, "my-plugins-bucket", {
 *   debug: true,
 *   executionTimeout: 60000,
 * });
 * ```
 */
export function createPluginEngine(
  s3Config: S3Config,
  bucketName: string,
  options: PluginEngineOptions = {}
): PluginEngine {
  // Validate required parameters
  if (!bucketName || bucketName.trim() === "") {
    throw new ConfigurationError(
      "Bucket name is required and cannot be empty",
      "bucketName"
    );
  }

  if (options.executionTimeout && options.executionTimeout <= 0) {
    throw new ConfigurationError(
      "Execution timeout must be greater than 0",
      "executionTimeout"
    );
  }

  if (options.memoryLimit && options.memoryLimit <= 0) {
    throw new ConfigurationError(
      "Memory limit must be greater than 0",
      "memoryLimit"
    );
  }

  // Create storage service with provided S3 config
  const storageService = S3StorageService.create(s3Config);

  // Create engine configuration
  const engineConfig = {
    storageService,
    bucketName,
    basePath: options.basePath,
    executionTimeout: options.executionTimeout || 30000,
    memoryLimit: options.memoryLimit || 128,
    debug: options.debug || false,
  };

  return new PluginEngine(engineConfig);
}
