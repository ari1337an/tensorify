/**
 * Isolated VM executor service implementation with TypeScript support
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
import {
  TypeScriptCompilerService,
  CompilationOptions,
} from "./typescript-compiler.service";

/**
 * Enhanced execution context with TypeScript support
 */
export interface EnhancedExecutionContext extends ExecutionContext {
  /** Whether the code is TypeScript */
  isTypeScript?: boolean;
  /** SDK dependencies to resolve */
  sdkDependencies?: Record<string, any>;
  /** Compilation options */
  compilationOptions?: CompilationOptions;
}

/**
 * Enhanced executor config with TypeScript support
 */
export interface EnhancedExecutorConfig extends ExecutorConfig {
  /** Whether to enable TypeScript compilation */
  enableTypeScript?: boolean;
  /** Whether to enable SDK imports */
  enableSDKImports?: boolean;
  /** SDK dependencies to provide */
  sdkDependencies?: Record<string, any>;
}

/**
 * Isolated VM implementation of the executor service with TypeScript support
 */
export class IsolatedVMExecutorService implements IExecutorService {
  private readonly defaultConfig: Required<ExecutorConfig>;
  private readonly enhancedDefaultConfig: Required<EnhancedExecutorConfig>;
  private readonly tsCompiler: TypeScriptCompilerService;

  constructor(defaultConfig?: EnhancedExecutorConfig) {
    this.defaultConfig = {
      memoryLimit: defaultConfig?.memoryLimit || 128,
      timeout: defaultConfig?.timeout || 30000,
      debug: defaultConfig?.debug || false,
    };

    this.enhancedDefaultConfig = {
      ...this.defaultConfig,
      enableTypeScript: defaultConfig?.enableTypeScript ?? true,
      enableSDKImports: defaultConfig?.enableSDKImports ?? true,
      sdkDependencies: defaultConfig?.sdkDependencies ?? {},
    };

    this.tsCompiler = new TypeScriptCompilerService({
      debug: this.defaultConfig.debug,
    });
  }

  /**
   * Execute JavaScript/TypeScript code in an isolated environment
   */
  async execute(
    context: EnhancedExecutionContext,
    config?: EnhancedExecutorConfig
  ): Promise<ExecutionResult> {
    const effectiveConfig = { ...this.enhancedDefaultConfig, ...config };
    const startTime = Date.now();
    let isolate: ivm.Isolate | undefined;

    try {
      // Pre-process code if TypeScript support is enabled
      let processedCode = context.code;
      let compilationResult;

      if (
        effectiveConfig.enableTypeScript ||
        effectiveConfig.enableSDKImports
      ) {
        compilationResult = await this.preprocessCode(
          context.code,
          effectiveConfig,
          context
        );
        processedCode = compilationResult.code;

        // if (effectiveConfig.debug) {
        //   console.log("Code compilation completed:", {
        //     original: context.code.length,
        //     processed: processedCode.length,
        //     diagnostics: compilationResult.diagnostics,
        //   });
        // }
      }

      // Create isolated VM with memory limit
      isolate = new ivm.Isolate({
        memoryLimit: effectiveConfig.memoryLimit,
        inspector: effectiveConfig.debug,
      });

      // Create a new context
      const vmContext = await isolate.createContext();

      // Execute with timeout using processed code
      const result = await Promise.race([
        this.executeWithContext(
          vmContext,
          context.payload,
          context.entryPointString,
          processedCode
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
          compilationInfo: compilationResult
            ? {
                diagnostics: compilationResult.diagnostics,
                dependencies: Object.keys(compilationResult.dependencies),
              }
            : undefined,
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
   * Validate JavaScript/TypeScript code syntax without executing it
   */
  async validateCode(
    code: string,
    config?: EnhancedExecutorConfig
  ): Promise<boolean> {
    const effectiveConfig = { ...this.enhancedDefaultConfig, ...config };
    let isolate: ivm.Isolate | undefined;

    try {
      // If TypeScript support is enabled, try compiling first
      if (effectiveConfig.enableTypeScript) {
        try {
          const compilationResult = await this.tsCompiler.compileTypeScript(
            code,
            {
              debug: effectiveConfig.debug,
              sdkDependencies: effectiveConfig.sdkDependencies,
            }
          );

          const errors = compilationResult.diagnostics.filter(
            (d) => d.includes("error") || d.includes("Error")
          );

          if (errors.length > 0) {
            throw new PluginValidationError(
              `TypeScript validation failed: ${errors.join(", ")}`,
              errors
            );
          }

          code = compilationResult.code;
        } catch (error) {
          if (error instanceof PluginValidationError) {
            throw error;
          }
          // If TypeScript compilation fails, try as regular JavaScript
          console.warn(
            "TypeScript compilation failed, trying as JavaScript:",
            error
          );
        }
      }

      // Validate the final JavaScript code
      isolate = new ivm.Isolate({ memoryLimit: 32 }); // Small memory limit for validation
      await isolate.compileScript(code);
      return true;
    } catch (error) {
      if (error instanceof PluginValidationError) {
        throw error;
      }
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
   * Pre-process code for TypeScript compilation and SDK import resolution
   */
  private async preprocessCode(
    code: string,
    config: Required<EnhancedExecutorConfig>,
    context: EnhancedExecutionContext
  ) {
    const compilationOptions: CompilationOptions = {
      debug: config.debug,
      sdkDependencies: {
        ...config.sdkDependencies,
        ...context.sdkDependencies,
      },
      ...context.compilationOptions,
    };

    // Use bundling for better import resolution
    if (config.enableSDKImports && code.includes("@tensorify.io/sdk")) {
      return await this.tsCompiler.bundleWithDependencies(
        code,
        compilationOptions
      );
    } else if (config.enableTypeScript) {
      return await this.tsCompiler.compileTypeScript(code, compilationOptions);
    }

    // Fallback to basic import resolution
    return {
      code,
      diagnostics: [],
      dependencies: {},
    };
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
   * Execute the script with the plugin context
   */
  private async executeWithContext(
    context: ivm.Context,
    payload: any,
    entryPointString: string, // This should be the className
    processedCode: string
  ): Promise<string> {
    const payloadJson = JSON.stringify(payload);
    const className = entryPointString;

    // Create a single script that includes the plugin code and execution logic
    const combinedCode = `
      ${processedCode}
      
      (function() {
        try {
          var payload = JSON.parse('${payloadJson.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}');
          var className = '${className}';
          
          // The IIFE bundle creates a global PluginBundle variable
          if (typeof PluginBundle === 'undefined') {
            return 'Error: PluginBundle not found. Make sure the bundle was created with globalName: "PluginBundle"';
          }
          
          var PluginClass;
          
          // Handle different export patterns for the class
          if (typeof PluginBundle === 'function') {
            // Direct class export
            PluginClass = PluginBundle;
          } else if (PluginBundle[className]) {
            // Named class export
            PluginClass = PluginBundle[className];
          } else if (PluginBundle.default) {
            // Default export (most common with esbuild IIFE)
            PluginClass = PluginBundle.default;
          } else {
            // Try to find the class in the bundle
            for (var key in PluginBundle) {
              if (typeof PluginBundle[key] === 'function' && key === className) {
                PluginClass = PluginBundle[key];
                break;
              }
            }
          }
          
          if (typeof PluginClass !== 'function') {
            return 'Error: Class ' + className + ' not found in PluginBundle. Available: ' + Object.keys(PluginBundle).join(', ');
          }
          
          // Create an instance of the plugin class
          var pluginInstance = new PluginClass();
          
          // Call getTranslationCode method with the payload
          if (typeof pluginInstance.getTranslationCode !== 'function') {
            return 'Error: getTranslationCode method not found on ' + className + '. Available methods: ' + Object.getOwnPropertyNames(pluginInstance).filter(p => typeof pluginInstance[p] === 'function').join(', ');
          }
          
          var childrenArg = (payload && payload.children) ? payload.children : undefined;
          var result = pluginInstance.getTranslationCode(payload, childrenArg);
          return String(result);
          
        } catch (error) {
          return 'Error: ' + error.message + '\\nStack: ' + (error.stack || 'No stack trace');
        }
      })()
    `;

    // Execute everything as a single script to avoid transferable value issues
    const result = context.evalSync(combinedCode);
    const resultString = String(result);

    // TODO: fix this later, right now its mimicking docker id like random id
    const randomId = Array.from({ length: 12 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const sanitizedResult = resultString.replace(
      /<isolated-vm>/g,
      `${randomId}`
    );

    return sanitizedResult;
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
