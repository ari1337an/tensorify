/**
 * Factory for creating Plugin Engine instances
 */

import { S3Client } from "@aws-sdk/client-s3";
import { PluginEngine } from "../core/plugin-engine";
import { S3StorageService } from "../services/storage.service";

import type {
  EngineOptions,
  EngineFactoryConfig,
  StorageConfig,
} from "../types";
import type { IStorageService } from "../interfaces/storage.interface";
import type { IExecutorService } from "../interfaces/executor.interface";
import { ConfigurationError } from "../errors/plugin-engine.errors";

/**
 * Factory for creating and configuring plugin engine instances
 * Simplifies dependency injection and configuration management
 */
export class PluginEngineFactory {
  private readonly config: EngineFactoryConfig;

  /**
   * Create a new plugin engine factory
   * @param config - Factory configuration with defaults
   */
  constructor(config: EngineFactoryConfig = {}) {
    this.config = {
      defaultBucketName: config.defaultBucketName,
      defaultExecutionTimeout: config.defaultExecutionTimeout || 30000,
      defaultMemoryLimit: config.defaultMemoryLimit || 128,
      defaultDebug: config.defaultDebug || false,
    };
  }

  /**
   * Create a plugin engine with S3 storage service
   * @param s3Client - Configured S3 client instance
   * @param options - Engine options
   * @returns New PluginEngine instance
   */
  createWithS3Client(s3Client: S3Client, options: EngineOptions): PluginEngine {
    const storageService = new S3StorageService(s3Client);
    return this.createWithStorageService(storageService, options);
  }

  /**
   * Create a plugin engine with S3 configuration
   * @param storageConfig - S3 storage configuration
   * @param options - Engine options
   * @returns New PluginEngine instance
   */
  createWithS3Config(
    storageConfig: StorageConfig,
    options: EngineOptions
  ): PluginEngine {
    const storageService = S3StorageService.create(storageConfig);
    return this.createWithStorageService(storageService, options);
  }

  /**
   * Create a plugin engine with custom storage service
   * @param storageService - Custom storage service implementation
   * @param options - Engine options
   * @returns New PluginEngine instance
   */
  createWithStorageService(
    storageService: IStorageService,
    options: EngineOptions
  ): PluginEngine {
    this.validateOptions(options);

    const engineConfig = {
      storageService,
      bucketName: options.bucketName || this.config.defaultBucketName!,
      basePath: options.basePath,
      executionTimeout:
        options.executionTimeout || this.config.defaultExecutionTimeout!,
      memoryLimit: options.memoryLimit || this.config.defaultMemoryLimit!,
      debug: options.debug ?? this.config.defaultDebug!,
    };

    if (!engineConfig.bucketName) {
      throw new ConfigurationError(
        "Bucket name must be provided either in options or factory config",
        "bucketName"
      );
    }

    return new PluginEngine(engineConfig);
  }

  /**
   * Create a plugin engine with custom services
   * @param storageService - Custom storage service implementation
   * @param executorService - Custom executor service implementation
   * @param options - Engine options
   * @returns New PluginEngine instance
   */
  createWithCustomServices(
    storageService: IStorageService,
    executorService: IExecutorService,
    options: EngineOptions
  ): PluginEngine {
    this.validateOptions(options);

    const engineConfig = {
      storageService,
      executorService,
      bucketName: options.bucketName || this.config.defaultBucketName!,
      basePath: options.basePath,
      executionTimeout:
        options.executionTimeout || this.config.defaultExecutionTimeout!,
      memoryLimit: options.memoryLimit || this.config.defaultMemoryLimit!,
      debug: options.debug ?? this.config.defaultDebug!,
    };

    if (!engineConfig.bucketName) {
      throw new ConfigurationError(
        "Bucket name must be provided either in options or factory config",
        "bucketName"
      );
    }

    return new PluginEngine(engineConfig);
  }

  /**
   * Create a default plugin engine for quick setup
   * Requires AWS credentials to be available in environment or IAM role
   * @param bucketName - S3 bucket name
   * @param region - AWS region (default: us-east-1)
   * @param options - Additional engine options
   * @returns New PluginEngine instance
   */
  static createDefault(
    bucketName: string,
    region: string = "us-east-1",
    options: Partial<EngineOptions> = {}
  ): PluginEngine {
    const factory = new PluginEngineFactory();

    const storageConfig: StorageConfig = { region };
    const engineOptions: EngineOptions = {
      bucketName,
      ...options,
    };

    return factory.createWithS3Config(storageConfig, engineOptions);
  }

  /**
   * Create a plugin engine with AWS credentials
   * @param bucketName - S3 bucket name
   * @param credentials - AWS credentials
   * @param options - Additional engine options
   * @returns New PluginEngine instance
   */
  static createWithCredentials(
    bucketName: string,
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
      region?: string;
      sessionToken?: string;
    },
    options: Partial<EngineOptions> = {}
  ): PluginEngine {
    const factory = new PluginEngineFactory();

    const storageConfig: StorageConfig = {
      region: credentials.region || "us-east-1",
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    };

    const engineOptions: EngineOptions = {
      bucketName,
      ...options,
    };

    return factory.createWithS3Config(storageConfig, engineOptions);
  }

  /**
   * Create a plugin engine for testing with custom endpoint
   * @param bucketName - S3 bucket name
   * @param endpoint - Custom S3 endpoint (e.g., MinIO, LocalStack)
   * @param options - Additional engine options
   * @returns New PluginEngine instance
   */
  static createForTesting(
    bucketName: string,
    endpoint: string,
    options: Partial<EngineOptions> = {}
  ): PluginEngine {
    const factory = new PluginEngineFactory();

    const storageConfig: StorageConfig = {
      region: "us-east-1",
      endpoint,
      forcePathStyle: true, // Required for custom endpoints
    };

    const engineOptions: EngineOptions = {
      bucketName,
      debug: true, // Enable debug for testing
      ...options,
    };

    return factory.createWithS3Config(storageConfig, engineOptions);
  }

  /**
   * Validate engine options
   * @private
   */
  private validateOptions(options: EngineOptions): void {
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
  }
}
