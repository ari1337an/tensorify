/**
 * Isolated VM executor service implementation
 */

import ivm from "isolated-vm";
import type { IExecutorService } from "../interfaces/executor.interface";
import type {
  ExecutionContext,
  ExecutionResult,
  ExecutorConfig,
  // VMContextOptions,
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
      // Skip VM context setup to test if that's causing the non-transferable value issue
      // await this.setupVMContext(vmContext, effectiveConfig);

      console.log("VM context setup");

      console.log("Ready to execute plugin code");

      // Execute with timeout
      const result = await Promise.race([
        this.executeWithContext(
          vmContext,
          context.payload,
          context.entryPointString,
          context.code
        ),
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
  /*
  private async setupVMContext(
    context: ivm.Context,
    config: Required<ExecutorConfig>,
    options?: VMContextOptions
  ): Promise<void> {
    const jail = context.global;

    // Set up basic globals
    await jail.set("global", jail.derefInto());

    // Set up console if debug is enabled (using transferable functions)
    if (config.debug || options?.enableConsole) {
      await jail.set("console", {
        log: new ivm.Reference((...args: any[]) => console.log(...args)),
        error: new ivm.Reference((...args: any[]) => console.error(...args)),
        warn: new ivm.Reference((...args: any[]) => console.warn(...args)),
        info: new ivm.Reference((...args: any[]) => console.info(...args)),
      });
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
  */

  /**
   * Execute the script with the plugin context
   */
  private async executeWithContext(
    context: ivm.Context,
    payload: any,
    entryPointString: string,
    originalCode: string
  ): Promise<string> {
    // Use the original plugin code instead of script.toString()
    const payloadJson = JSON.stringify(payload);
    const entryPoint = entryPointString;

    // Create a single script that includes the plugin code and execution logic
    const combinedCode = `
      // Set up minimal module system
      var module = { exports: {} };
      var exports = module.exports;
      
      ${originalCode}
      
      (function() {
        try {
          var payload = JSON.parse('${payloadJson.replace(/'/g, "\\'")}');
          var entryPoint = '${entryPoint}';
          
          var exported = module.exports;
          var fn = exported[entryPoint];
          
          if (typeof fn !== 'function') {
            return 'Error: Function ' + entryPoint + ' not found';
          }
          
          var result = fn(payload);
          return String(result);
        } catch (error) {
          return 'Error: ' + error.message;
        }
      })()
    `;

    console.log("Combined script:", combinedCode.slice(0, 200) + "...");

    // Execute everything as a single script to avoid transferable value issues
    const result = await context.evalSync(combinedCode);
    return String(result);
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
