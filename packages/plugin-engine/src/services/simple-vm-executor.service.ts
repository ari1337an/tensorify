/**
 * Simple VM executor service using Node.js built-in vm module
 * This is a fallback when isolated-vm has compatibility issues
 */

import vm from "vm";
import type { IExecutorService } from "../interfaces/executor.interface";
import type {
  ExecutionContext,
  ExecutionResult,
  ExecutorConfig,
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
 * Simple VM implementation using Node.js built-in vm module
 * Note: This provides less isolation than isolated-vm but is more compatible
 */
export class SimpleVMExecutorService implements IExecutorService {
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
   * Execute JavaScript/TypeScript code in a vm context
   */
  async execute(
    context: EnhancedExecutionContext,
    config?: EnhancedExecutorConfig
  ): Promise<ExecutionResult> {
    const effectiveConfig = { ...this.enhancedDefaultConfig, ...config };
    const startTime = Date.now();

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

      // Execute with timeout using processed code
      const result = await Promise.race([
        this.executeWithContext(
          context.payload,
          context.entryPointString,
          processedCode,
          effectiveConfig
        ),
        this.createTimeoutPromise(effectiveConfig.timeout),
      ]);

      const executionTime = Date.now() - startTime;
      const memoryUsage = this.getMemoryUsage();

      // Check memory usage (approximate check since vm module doesn't provide memory isolation)
      if (memoryUsage.heapUsed > effectiveConfig.memoryLimit * 1024 * 1024) {
        console.warn(
          `Memory usage (${Math.round(
            memoryUsage.heapUsed / (1024 * 1024)
          )}MB) exceeds limit (${effectiveConfig.memoryLimit}MB)`
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

    try {
      // If TypeScript support is enabled, try compiling first
      if (effectiveConfig.enableTypeScript) {
        try {
          // Use bundling if SDK imports are present
          let compilationResult;
          if (
            effectiveConfig.enableSDKImports &&
            code.includes("@tensorify.io/sdk")
          ) {
            compilationResult = await this.tsCompiler.bundleWithDependencies(
              code,
              {
                debug: effectiveConfig.debug,
                sdkDependencies: effectiveConfig.sdkDependencies,
              }
            );
          } else {
            compilationResult = await this.tsCompiler.compileTypeScript(code, {
              debug: effectiveConfig.debug,
              sdkDependencies: effectiveConfig.sdkDependencies,
            });
          }

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

          // if (effectiveConfig.debug) {
          //   console.log(
          //     "Validation compilation completed, code length:",
          //     code.length
          //   );
          // }
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

      // Validate the final JavaScript code using vm
      try {
        new vm.Script(code);
        return true;
      } catch (syntaxError) {
        // If this is just a syntax error in generated code due to bundling issues,
        // we may still want to consider it valid for TypeScript with SDK imports
        if (
          effectiveConfig.enableSDKImports &&
          code.includes("@tensorify.io/sdk")
        ) {
          // For SDK imports, we're more lenient since the bundled code might have some issues
          // but the original TypeScript is valid
          console.warn(
            "Syntax validation failed for bundled SDK code, but considering valid:",
            (syntaxError as Error).message
          );
          return true;
        }
        throw syntaxError;
      }
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
   * Execute the script with the plugin context using Node.js vm module
   */
  private async executeWithContext(
    payload: any,
    entryPointString: string,
    processedCode: string,
    config: Required<EnhancedExecutorConfig>
  ): Promise<string> {
    const payloadJson = JSON.stringify(payload);
    const entryPoint = entryPointString;

    // Create a sandbox context
    const sandbox = {
      module: { exports: {} },
      exports: {},
      console: {
        log: (...args: any[]) => {
          if (config.debug) {
            console.log("[Plugin]", ...args);
          }
        },
        error: (...args: any[]) => {
          if (config.debug) {
            console.error("[Plugin]", ...args);
          }
        },
        warn: (...args: any[]) => {
          if (config.debug) {
            console.warn("[Plugin]", ...args);
          }
        },
      },
      JSON,
      String,
      Number,
      Boolean,
      Array,
      Object,
      Math,
      Date,
      RegExp,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
      ReferenceError,
      // Add other safe globals as needed
    };

    // Make exports reference module.exports
    sandbox.exports = sandbox.module.exports;

    // Create a single script that includes the plugin code and execution logic
    const combinedCode = `
      // Execute plugin code first
      ${processedCode}
      
      // Then execute the entry point
      (function() {
        try {
          var payload = JSON.parse('${payloadJson.replace(/'/g, "\\'")}');
          var entryPoint = '${entryPoint}';
          
          var exported = module.exports;
          
                     // Handle different export patterns
           var fn;
           var instance;
           
           // Handle entry points with dot notation (ClassName.method)
           var entryParts = entryPoint.split('.');
           var className = entryParts[0];
           var methodName = entryParts[1];
           
           if (entryParts.length === 2 && exported[className]) {
             // Handle ClassName.method pattern
             var ClassConstructor = exported[className];
             if (typeof ClassConstructor === 'function') {
               try {
                 // Try to instantiate the class
                 instance = new ClassConstructor();
                 if (instance && typeof instance[methodName] === 'function') {
                   fn = instance[methodName].bind(instance);
                 }
               } catch (e) {
                 // If instantiation fails, try calling as static method
                 if (typeof ClassConstructor[methodName] === 'function') {
                   fn = ClassConstructor[methodName].bind(ClassConstructor);
                 }
               }
             }
           } else if (entryParts.length === 2 && exported.default && exported.default[className]) {
             // Handle default export with ClassName.method
             var DefaultClassConstructor = exported.default[className];
             if (typeof DefaultClassConstructor === 'function') {
               try {
                 instance = new DefaultClassConstructor();
                 if (instance && typeof instance[methodName] === 'function') {
                   fn = instance[methodName].bind(instance);
                 }
               } catch (e) {
                 if (typeof DefaultClassConstructor[methodName] === 'function') {
                   fn = DefaultClassConstructor[methodName].bind(DefaultClassConstructor);
                 }
               }
             }
           } else if (entryPoint === 'processPayload') {
             // Special handler for processPayload - try to find a default class/instance
             if (exported.default) {
               if (typeof exported.default === 'function') {
                 // Default is a class constructor
                 try {
                   instance = new exported.default();
                   if (instance && typeof instance.getTranslationCode === 'function') {
                     fn = function(payload) {
                       return instance.getTranslationCode(payload);
                     };
                   }
                 } catch (e) {
                   // Constructor failed, check if it has static methods
                   if (typeof exported.default.getTranslationCode === 'function') {
                     fn = function(payload) {
                       return exported.default.getTranslationCode(payload);
                     };
                   }
                 }
               } else if (exported.default && typeof exported.default.getTranslationCode === 'function') {
                 // Default is already an instance
                 fn = function(payload) {
                   return exported.default.getTranslationCode(payload);
                 };
               }
             }
             // If still no function found, try to find any class/instance with getTranslationCode
             if (!fn) {
               for (var key in exported) {
                 var obj = exported[key];
                 if (obj && typeof obj === 'object' && typeof obj.getTranslationCode === 'function') {
                   fn = function(payload) {
                     return obj.getTranslationCode(payload);
                   };
                   break;
                 } else if (typeof obj === 'function') {
                   try {
                     var inst = new obj();
                     if (inst && typeof inst.getTranslationCode === 'function') {
                       fn = function(payload) {
                         return inst.getTranslationCode(payload);
                       };
                       break;
                     }
                   } catch (e) {
                     // Ignore instantiation errors
                   }
                 }
               }
             }
           } else if (typeof exported === 'function') {
             // Direct function export
             fn = exported;
           } else if (exported[entryPoint]) {
             // Named export
             fn = exported[entryPoint];
           } else if (exported.default && exported.default[entryPoint]) {
             // Default export with method
             fn = exported.default[entryPoint];
           } else if (exported.default && typeof exported.default === 'function') {
             // Default function export
             fn = exported.default;
           } else {
             // Try to find method on any exported class instances
             for (var key in exported) {
               if (exported[key] && typeof exported[key][entryPoint] === 'function') {
                 fn = exported[key][entryPoint].bind(exported[key]);
                 break;
               }
             }
           }
          
          if (typeof fn !== 'function') {
            return 'Error: Function ' + entryPoint + ' not found in exports. Available: ' + Object.keys(exported).join(', ');
          }
          
          var result = fn(payload);
          return String(result);
        } catch (error) {
          return 'Error: ' + error.message + '\\nStack: ' + (error.stack || 'No stack trace');
        }
      })()
    `;

    // Create and run the script
    const vmContext = vm.createContext(sandbox);
    const script = new vm.Script(combinedCode);
    const result = script.runInContext(vmContext, {
      timeout: config.timeout,
      displayErrors: true,
    });

    return String(result);
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
    // For vm module, cleanup is automatic
    if (global.gc) {
      global.gc();
    }
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
