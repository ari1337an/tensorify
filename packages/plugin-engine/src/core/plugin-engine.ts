/**
 * Main Plugin Engine class
 */

import type { IStorageService } from "../interfaces/storage.interface";
import type { IExecutorService } from "../interfaces/executor.interface";
import type {
  EngineConfig,
  PluginSettings,
  PluginExecutionResult,
} from "../types";
import {
  PluginNotFoundError,
  ConfigurationError,
  InvalidPluginStructureError,
} from "../errors/plugin-engine.errors";

/**
 * The main plugin execution engine
 * Orchestrates fetching plugins from storage and executing them in isolation
 */
export class PluginEngine {
  private readonly config: EngineConfig;
  private readonly storageService: IStorageService;
  private readonly executorService: IExecutorService;

  /**
   * Create a new plugin engine instance
   * @param config - Engine configuration with injected dependencies
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
   * @param settings - Settings to pass to the plugin
   * @returns Promise resolving to the execution result with generated code
   */
  async getExecutionResult(
    pluginSlug: string,
    settings: PluginSettings
  ): Promise<PluginExecutionResult> {
    try {
      this.log(`Starting execution for plugin: ${pluginSlug}`);

      // Step 1: Fetch the plugin code from storage
      const pluginCode = await this.fetchPluginCode(pluginSlug);

      // Step 2: Validate the plugin structure (optional but recommended)
      await this.validatePluginCode(pluginCode);

      // Step 3: Execute the plugin in isolated environment
      const executionResult = await this.executorService.execute(
        {
          code: pluginCode,
          settings,
        },
        {
          memoryLimit: this.config.memoryLimit || 128,
          timeout: this.config.executionTimeout || 30000,
          debug: this.config.debug || false,
        }
      );

      this.log(`Plugin execution completed successfully for: ${pluginSlug}`);

      return {
        code: executionResult.result,
        metadata: {
          executionTime: executionResult.stats.executionTime,
          memoryUsage: executionResult.stats.memoryUsage,
          warnings: executionResult.logs || [],
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
   * @param pluginSlug - Unique identifier for the plugin
   * @returns Promise resolving to true if plugin exists
   */
  async pluginExists(pluginSlug: string): Promise<boolean> {
    try {
      const pluginPath = this.getPluginPath(pluginSlug);
      return await this.storageService.fileExists(
        this.config.bucketName,
        pluginPath
      );
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
        maxResults * 2 // Get more files to account for filtering
      );

      // Filter for index.js files and extract plugin slugs
      const pluginSlugs = files
        .filter((file) => file.endsWith("/index.js"))
        .map((file) => {
          const relativePath = basePath
            ? file.replace(basePath + "/", "")
            : file;
          return relativePath.replace("/index.js", "");
        })
        .slice(0, maxResults);

      return pluginSlugs;
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
   * Validate plugin code structure
   * @private
   */
  private async validatePluginCode(code: string): Promise<void> {
    try {
      // Basic syntax validation
      await this.executorService.validateCode(code);

      // TODO: Add more sophisticated validation for plugin structure
      // e.g., check for required exports, class structure, etc.
    } catch (error) {
      throw new InvalidPluginStructureError(
        "unknown",
        "Plugin must export a class with codeGeneration.generateCode method",
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
    const pluginPath = `${pluginSlug}/index.js`;

    return basePath ? `${basePath}/${pluginPath}` : pluginPath;
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
