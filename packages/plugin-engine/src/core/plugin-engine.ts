/**
 * Main Plugin Engine class with TypeScript and SDK support
 */

import type { IStorageService } from "../interfaces/storage.interface";
import type { IExecutorService } from "../interfaces/executor.interface";
import type { EngineConfig, PluginExecutionResult } from "../types";
import {
  PluginNotFoundError,
  ConfigurationError,
  InvalidPluginStructureError,
} from "../errors/plugin-engine.errors";
import type {
  EnhancedExecutionContext,
  EnhancedExecutorConfig,
} from "../services/executor.service";

/**
 * The main plugin execution engine with TypeScript and SDK support
 * Orchestrates fetching plugins from storage and executing them in isolation
 */
export class PluginEngine {
  private readonly config: EngineConfig;
  private readonly storageService: IStorageService;
  private readonly executorService: IExecutorService;

  /**
   * Create a new plugin engine instance
   * @param config - Engine configuration with injected dependencies and TypeScript/SDK options
   */
  constructor(config: EngineConfig) {
    this.validateConfig(config);
    this.config = config;
    this.storageService = config.storageService;
    this.executorService =
      config.executorService || this.createDefaultExecutorService();
  }

  /**
   * Main method to execute a plugin and get the generated code
   * @param pluginSlug - Unique identifier for the plugin
   * @param payload - Data to pass to the plugin
   * @param entryPointString - Entry point to execute (function name or class.method like 'sum', 'Calculator.add', etc.)
   * @returns Promise resolving to the execution result with generated code
   */
  async getExecutionResult(
    pluginSlug: string,
    payload: any,
    entryPointString: string
  ): Promise<PluginExecutionResult> {
    try {
      this.log(`Starting execution for plugin: ${pluginSlug}`);

      // Step 1: Fetch the plugin code from storage
      const pluginCode = await this.fetchPluginCode(pluginSlug);

      this.log(`Plugin code fetched: ${pluginCode.slice(0, 20)}...`);

      // Step 2: Validate the plugin structure (optional but recommended)
      await this.validatePluginCode(pluginCode);

      this.log(`Plugin code validated`);

      // Step 3: Execute the plugin in isolated environment with TypeScript/SDK support
      const executionContext: EnhancedExecutionContext = {
        code: pluginCode,
        payload,
        entryPointString,
        sdkDependencies: this.config.sdkDependencies,
      };

      const executorConfig: EnhancedExecutorConfig = {
        memoryLimit: this.config.memoryLimit || 128,
        timeout: this.config.executionTimeout || 30000,
        debug: this.config.debug || false,
        enableTypeScript: this.config.enableTypeScript ?? true,
        enableSDKImports: this.config.enableSDKImports ?? true,
        sdkDependencies: this.config.sdkDependencies || {},
      };

      const executionResult = await this.executorService.execute(
        executionContext,
        executorConfig
      );

      this.log(`Plugin execution completed successfully for: ${pluginSlug}`);

      return {
        code: executionResult.result,
        metadata: {
          executionTime: executionResult.stats.executionTime,
          memoryUsage: executionResult.stats.memoryUsage,
          warnings: executionResult.logs || [],
          compilationInfo: executionResult.stats.compilationInfo,
        },
      };
    } catch (error) {
      this.log(
        `Plugin execution failed for ${pluginSlug}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * Check if a plugin exists in storage
   * A valid plugin must have both index.js and manifest.json files
   * @param pluginSlug - Unique identifier for the plugin
   * @returns Promise resolving to true if plugin exists
   */
  async pluginExists(pluginSlug: string): Promise<boolean> {
    try {
      const pluginPath = this.getPluginPath(pluginSlug);
      const metadataPath = this.getPluginMetadataPath(pluginSlug);

      const [indexExists, metadataExists] = await Promise.all([
        this.storageService.fileExists(this.config.bucketName, pluginPath),
        this.storageService.fileExists(this.config.bucketName, metadataPath),
      ]);

      return indexExists && metadataExists;
    } catch (error) {
      this.log(
        `Error checking plugin existence for ${pluginSlug}: ${
          (error as Error).message
        }`
      );
      return false;
    }
  }

  /**
   * Get metadata about a plugin without executing it
   * @param pluginSlug - Unique identifier for the plugin
   * @returns Promise resolving to plugin metadata
   */
  async getPluginMetadata(pluginSlug: string) {
    try {
      const pluginPath = this.getPluginPath(pluginSlug);
      return await this.storageService.getFileMetadata(
        this.config.bucketName,
        pluginPath
      );
    } catch (error) {
      throw new PluginNotFoundError(
        pluginSlug,
        this.config.bucketName,
        error as Error
      );
    }
  }

  /**
   * Get plugin manifest metadata from manifest.json file
   * @param pluginSlug - Unique identifier for the plugin
   * @returns Promise resolving to plugin manifest
   */
  async getPluginManifest(pluginSlug: string) {
    try {
      const metadataPath = this.getPluginMetadataPath(pluginSlug);
      const fileInfo = await this.storageService.getFile(
        this.config.bucketName,
        metadataPath
      );

      try {
        return JSON.parse(fileInfo.content);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in manifest.json for plugin '${pluginSlug}': ${
            (parseError as Error).message
          }`
        );
      }
    } catch (error) {
      // If it's already our custom JSON error, re-throw it
      if (
        error instanceof Error &&
        error.message.includes("Invalid JSON in manifest.json")
      ) {
        throw error;
      }

      // Otherwise, it's a file not found error
      throw new PluginNotFoundError(
        pluginSlug,
        this.config.bucketName,
        error as Error
      );
    }
  }

  /**
   * List available plugins in the storage
   * @param maxResults - Maximum number of plugins to return
   * @returns Promise resolving to array of plugin slugs
   */
  async listAvailablePlugins(maxResults: number = 100): Promise<string[]> {
    try {
      const basePath = this.config.basePath || "";
      const files = await this.storageService.listFiles(
        this.config.bucketName,
        basePath,
        maxResults * 4 // Get more files to account for filtering (each plugin has 2+ files)
      );

      // Group files by plugin slug and validate that both index.js and manifest.json exist
      const pluginFiles: Record<string, Set<string>> = {};

      files.forEach((file) => {
        const relativePath = basePath ? file.replace(basePath + "/", "") : file;

        // Extract plugin slug and file type
        const parts = relativePath.split("/");
        if (parts.length >= 2) {
          const pluginSlug = parts[0];
          const fileName = parts[parts.length - 1];

          if (!pluginFiles[pluginSlug]) {
            pluginFiles[pluginSlug] = new Set();
          }
          pluginFiles[pluginSlug].add(fileName);
        }
      });

      // Filter for valid plugins that have both index.js and manifest.json
      const validPluginSlugs = Object.entries(pluginFiles)
        .filter(
          ([_, fileSet]) =>
            fileSet.has("index.js") && fileSet.has("manifest.json")
        )
        .map(([pluginSlug, _]) => pluginSlug)
        .slice(0, maxResults);

      return validPluginSlugs;
    } catch (error) {
      this.log(`Error listing plugins: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Get plugin source code without executing it
   * @param pluginSlug - Unique identifier for the plugin
   * @returns Promise resolving to the plugin source code
   */
  async getPluginCode(pluginSlug: string): Promise<string> {
    this.log(`Retrieving plugin code for: ${pluginSlug}`);
    return await this.fetchPluginCode(pluginSlug);
  }

  /**
   * Clean up resources used by the engine
   */
  async dispose(): Promise<void> {
    await this.executorService.cleanup();
    this.log("Plugin engine disposed");
  }

  /**
   * Fetch plugin code from storage
   * @private
   */
  private async fetchPluginCode(pluginSlug: string): Promise<string> {
    const pluginPath = this.getPluginPath(pluginSlug);

    try {
      const fileInfo = await this.storageService.getFile(
        this.config.bucketName,
        pluginPath
      );
      return fileInfo.content;
    } catch (error) {
      throw new PluginNotFoundError(
        pluginSlug,
        this.config.bucketName,
        error as Error
      );
    }
  }

  /**
   * Validate plugin code structure with TypeScript support
   * @private
   */
  private async validatePluginCode(code: string): Promise<void> {
    try {
      // Enhanced validation with TypeScript support
      const executorConfig: EnhancedExecutorConfig = {
        memoryLimit: 32, // Small memory limit for validation
        timeout: 5000, // Short timeout for validation
        debug: this.config.debug || false,
        enableTypeScript: this.config.enableTypeScript ?? true,
        enableSDKImports: this.config.enableSDKImports ?? true,
        sdkDependencies: this.config.sdkDependencies || {},
      };

      await this.executorService.validateCode(code, executorConfig);

      // TODO: Add more sophisticated validation for plugin structure
      // e.g., check for required exports, class structure, etc.
    } catch (error) {
      throw new InvalidPluginStructureError(
        "unknown",
        "Plugin must export a valid class or function with proper entry points",
        error as Error
      );
    }
  }

  /**
   * Get the full path for a plugin in storage
   * @private
   */
  private getPluginPath(pluginSlug: string): string {
    const basePath = this.config.basePath || "";
    const pluginPath = `${pluginSlug}/bundle.js`;

    return basePath ? `${basePath}/${pluginPath}` : pluginPath;
  }

  /**
   * Get the full path for a plugin's manifest.json file in storage
   * @private
   */
  private getPluginMetadataPath(pluginSlug: string): string {
    const basePath = this.config.basePath || "";
    const metadataPath = `${pluginSlug}/manifest.json`;
    return basePath ? `${basePath}/${metadataPath}` : metadataPath;
  }

  /**
   * Create default executor service if none provided
   * @private
   */
  private createDefaultExecutorService(): IExecutorService {
    // Dynamically import the executor service to avoid circular dependencies
    const {
      IsolatedVMExecutorService,
    } = require("../services/executor.service");

    return new IsolatedVMExecutorService({
      memoryLimit: this.config.memoryLimit || 128,
      timeout: this.config.executionTimeout || 30000,
      debug: this.config.debug || false,
      enableTypeScript: this.config.enableTypeScript ?? true,
      enableSDKImports: this.config.enableSDKImports ?? true,
      sdkDependencies: this.config.sdkDependencies || {},
    });
  }

  /**
   * Validate engine configuration
   * @private
   */
  private validateConfig(config: EngineConfig): void {
    if (!config.storageService) {
      throw new ConfigurationError(
        "Storage service is required",
        "storageService"
      );
    }

    if (!config.bucketName || config.bucketName.trim() === "") {
      throw new ConfigurationError(
        "Bucket name is required and cannot be empty",
        "bucketName"
      );
    }

    if (config.executionTimeout && config.executionTimeout <= 0) {
      throw new ConfigurationError(
        "Execution timeout must be greater than 0",
        "executionTimeout"
      );
    }

    if (config.memoryLimit && config.memoryLimit <= 0) {
      throw new ConfigurationError(
        "Memory limit must be greater than 0",
        "memoryLimit"
      );
    }
  }

  /**
   * Log messages if debug is enabled
   * @private
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[PluginEngine] ${new Date().toISOString()}: ${message}`);
    }
  }
}
