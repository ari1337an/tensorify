/**
 * Isolated VM executor service implementation
 */

import ivm from "isolated-vm";
import type { IExecutorService } from "../interfaces/executor.interface";
import type {
  ExecutionContext,
  ExecutionResult,
  ExecutorConfig,
  VMContextOptions,
} from "../types/executor.types";
import {
  ExecutionError,
  TimeoutError,
  MemoryLimitError,
  PluginValidationError,
} from "../errors/plugin-engine.errors";

/**
 * Isolated VM implementation of the executor service
 */
export class IsolatedVMExecutorService implements IExecutorService {
  private readonly defaultConfig: Required<ExecutorConfig>;

  constructor(defaultConfig?: ExecutorConfig) {
    this.defaultConfig = {
      memoryLimit: defaultConfig?.memoryLimit || 128,
      timeout: defaultConfig?.timeout || 30000,
      debug: defaultConfig?.debug || false,
    };
  }

  /**
   * Execute JavaScript code in an isolated environment
   */
  async execute(
    context: ExecutionContext,
    config?: ExecutorConfig
  ): Promise<ExecutionResult> {
    const effectiveConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();
    let isolate: ivm.Isolate | undefined;

    try {
      // Create isolated VM with memory limit
      isolate = new ivm.Isolate({
        memoryLimit: effectiveConfig.memoryLimit,
        inspector: effectiveConfig.debug,
      });

      // Create a new context
      const vmContext = await isolate.createContext();

      // Set up the VM context with necessary globals
      await this.setupVMContext(vmContext, effectiveConfig);

      // Compile and execute the plugin code
      const script = await isolate.compileScript(context.code);

      // Execute with timeout
      const result = await Promise.race([
        this.executeWithContext(script, vmContext, context.settings),
        this.createTimeoutPromise(effectiveConfig.timeout),
      ]);

      const executionTime = Date.now() - startTime;
      const memoryUsage = this.getMemoryUsage();

      // Check memory usage
      if (memoryUsage.heapUsed > effectiveConfig.memoryLimit * 1024 * 1024) {
        throw new MemoryLimitError(
          effectiveConfig.memoryLimit,
          Math.round(memoryUsage.heapUsed / (1024 * 1024))
        );
      }

      return {
        result: result as string,
        stats: {
          executionTime,
          memoryUsage,
        },
        logs: [], // TODO: Capture console logs if needed
        errors: [],
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (error instanceof TimeoutError || error instanceof MemoryLimitError) {
        throw error;
      }

      throw new ExecutionError(
        `Plugin execution failed: ${(error as Error).message}`,
        executionTime,
        this.getMemoryUsage().heapUsed,
        error as Error
      );
    } finally {
      // Clean up the isolate
      if (isolate) {
        isolate.dispose();
      }
    }
  }

  /**
   * Validate JavaScript code syntax without executing it
   */
  async validateCode(code: string): Promise<boolean> {
    let isolate: ivm.Isolate | undefined;

    try {
      isolate = new ivm.Isolate({ memoryLimit: 32 }); // Small memory limit for validation
      await isolate.compileScript(code);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new PluginValidationError(
          `Code validation failed: ${error.message}`,
          [error.message]
        );
      }
      return false;
    } finally {
      if (isolate) {
        isolate.dispose();
      }
    }
  }

  /**
   * Get memory usage statistics
   */
  getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
    };
  }

  /**
   * Clean up any resources used by the executor
   */
  async cleanup(): Promise<void> {
    // For isolated-vm, cleanup is handled per-isolate
    // This method can be used for global cleanup if needed
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Set up the VM context with necessary globals and modules
   */
  private async setupVMContext(
    context: ivm.Context,
    config: Required<ExecutorConfig>,
    options?: VMContextOptions
  ): Promise<void> {
    const jail = context.global;

    // Set up basic globals
    await jail.set("global", jail.derefInto());

    // Set up console if debug is enabled
    if (config.debug || options?.enableConsole) {
      const console = {
        log: (...args: any[]): void => console.log(...args),
        error: (...args: any[]): void => console.error(...args),
        warn: (...args: any[]): void => console.warn(...args),
        info: (...args: any[]): void => console.info(...args),
      };
      await jail.set("console", console);
    }

    // Add any custom globals
    if (options?.globals) {
      for (const [key, value] of Object.entries(options.globals)) {
        await jail.set(key, value);
      }
    }

    // Set up a basic require function if modules are provided
    if (options?.modules) {
      const modules = options.modules;
      const requireFunction = new ivm.Reference((name: string) => {
        if (modules[name]) {
          return modules[name];
        }
        throw new Error(`Module '${name}' not found`);
      });
      await jail.set("require", requireFunction);
    }
  }

  /**
   * Execute the script with the plugin context
   */
  private async executeWithContext(
    script: ivm.Script,
    context: ivm.Context,
    settings: Record<string, any>
  ): Promise<string> {
    // Execute the script to load the plugin class
    await script.run(context);

    // Create an execution script that instantiates the plugin and calls generateCode
    const executionCode = `
      (function() {
        // The plugin should export a class as the default export
        const PluginClass = (typeof module !== 'undefined' && module.exports) || 
                            (typeof exports !== 'undefined' && exports.default) ||
                            this; // fallback to global context
        
        if (typeof PluginClass !== 'function') {
          throw new Error('Plugin must export a class constructor');
        }
        
        const pluginInstance = new PluginClass();
        
        if (!pluginInstance.codeGeneration || typeof pluginInstance.codeGeneration.generateCode !== 'function') {
          throw new Error('Plugin instance must have codeGeneration.generateCode method');
        }
        
        return pluginInstance.codeGeneration.generateCode(${JSON.stringify(
          settings
        )});
      })()
    `;

    const executionScript = await (context as any).isolate.compileScript(executionCode);
    const result = await executionScript.run(context);

    if (typeof result !== "string") {
      throw new ExecutionError(
        "Plugin generateCode method must return a string"
      );
    }

    return result;
  }

  /**
   * Create a timeout promise that rejects after the specified time
   */
  private createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(timeoutMs));
      }, timeoutMs);
    });
  }
}
