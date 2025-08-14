/**
 * TypeScript compiler service for plugin-engine
 * Handles TypeScript compilation and SDK import resolution
 */

import * as ts from "typescript";
import { build } from "esbuild";
import { ExecutionError } from "../errors/plugin-engine.errors";

export interface CompilationOptions {
  /** Whether to include source maps */
  sourceMap?: boolean;
  /** Target JavaScript version */
  target?: ts.ScriptTarget;
  /** Module system to use */
  module?: ts.ModuleKind;
  /** Whether to enable debug output */
  debug?: boolean;
  /** SDK dependencies to resolve */
  sdkDependencies?: Record<string, any>;
}

export interface CompilationResult {
  /** Compiled JavaScript code */
  code: string;
  /** Source map if enabled */
  sourceMap?: string;
  /** Compilation diagnostics */
  diagnostics: string[];
  /** Resolved dependencies */
  dependencies: Record<string, any>;
}

/**
 * Service for compiling TypeScript code and resolving SDK dependencies
 */
export class TypeScriptCompilerService {
  private readonly defaultOptions: Required<
    Omit<CompilationOptions, "sourceMap" | "sdkDependencies">
  > & {
    sourceMap: boolean;
    sdkDependencies: Record<string, any>;
  };

  constructor(options?: CompilationOptions) {
    this.defaultOptions = {
      sourceMap: options?.sourceMap ?? false,
      target: options?.target ?? ts.ScriptTarget.ES2020,
      module: options?.module ?? ts.ModuleKind.CommonJS,
      debug: options?.debug ?? false,
      sdkDependencies: options?.sdkDependencies ?? {},
    };
  }

  /**
   * Compile TypeScript code to JavaScript with SDK support
   */
  async compileTypeScript(
    code: string,
    options?: CompilationOptions
  ): Promise<CompilationResult> {
    const effectiveOptions = { ...this.defaultOptions, ...options };

    try {
      // First, try to detect if it's TypeScript or JavaScript
      const isTypeScript = this.isTypeScriptCode(code);

      if (!isTypeScript) {
        // If it's already JavaScript, just resolve imports
        return this.resolveImports(code, effectiveOptions);
      }

      // Compile TypeScript to JavaScript
      const compilationResult = this.compileWithTypeScript(
        code,
        effectiveOptions
      );

      // Check for compilation diagnostics
      if (
        compilationResult.diagnostics &&
        compilationResult.diagnostics.length > 0
      ) {
        const errors = compilationResult.diagnostics.filter(
          (d) => d.category === ts.DiagnosticCategory.Error
        );
        if (errors.length > 0) {
          const errorMessages = errors.map((e) => {
            if (typeof e.messageText === "string") {
              return e.messageText;
            } else {
              return e.messageText.messageText;
            }
          });
          throw new ExecutionError(
            `TypeScript compilation failed: ${errorMessages.join(", ")}`
          );
        }
      }

      // Resolve SDK imports in the compiled JavaScript
      return this.resolveImports(
        compilationResult.outputText,
        effectiveOptions
      );
    } catch (error) {
      if (error instanceof ExecutionError) {
        throw error;
      }
      throw new ExecutionError(
        `TypeScript compilation failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Bundle TypeScript/JavaScript code with dependencies using esbuild
   */
  async bundleWithDependencies(
    code: string,
    options?: CompilationOptions
  ): Promise<CompilationResult> {
    const effectiveOptions = { ...this.defaultOptions, ...options };

    try {
      const result = await build({
        stdin: {
          contents: code,
          loader: this.isTypeScriptCode(code) ? "ts" : "js",
          resolveDir: process.cwd(),
        },
        bundle: true,
        write: false,
        format: "cjs",
        target: "es2020",
        platform: "node",
        sourcemap: effectiveOptions.sourceMap,
        external: [], // Bundle everything for isolated execution
        plugins: [
          // Custom plugin to resolve SDK imports
          {
            name: "sdk-resolver",
            setup: (build) => {
              build.onResolve({ filter: /^@tensorify\.io\/sdk$/ }, () => ({
                path: "sdk",
                namespace: "sdk",
              }));

              build.onLoad({ filter: /.*/, namespace: "sdk" }, () => ({
                contents: this.generateSDKStub(
                  effectiveOptions.sdkDependencies
                ),
                loader: "js",
              }));
            },
          },
        ],
      });

      if (result.errors.length > 0) {
        throw new ExecutionError(
          `Bundling failed: ${result.errors.map((e) => e.text).join(", ")}`
        );
      }

      const compiledCode = result.outputFiles[0]?.text || "";
      const sourceMap = result.outputFiles.find((f) =>
        f.path.endsWith(".map")
      )?.text;

      return {
        code: compiledCode,
        sourceMap,
        diagnostics: result.warnings.map((w) => w.text),
        dependencies: effectiveOptions.sdkDependencies,
      };
    } catch (error) {
      if (error instanceof ExecutionError) {
        throw error;
      }
      throw new ExecutionError(
        `Code bundling failed: ${(error as Error).message}`
      );
    }
  }

  /**
   * Check if code is TypeScript
   */
  private isTypeScriptCode(code: string): boolean {
    // Simple heuristics to detect TypeScript
    const tsKeywords = [
      "interface ",
      "type ",
      "enum ",
      "namespace ",
      ": string",
      ": number",
      ": boolean",
      ": any",
      "<T>",
      "extends ",
      "implements ",
      "public ",
      "private ",
      "protected ",
      "readonly ",
      "export interface",
      "export type",
      "export enum",
    ];

    return tsKeywords.some((keyword) => code.includes(keyword));
  }

  /**
   * Compile TypeScript using the TypeScript compiler API
   */
  private compileWithTypeScript(
    code: string,
    options: Required<
      Omit<CompilationOptions, "sourceMap" | "sdkDependencies">
    > & {
      sourceMap: boolean;
      sdkDependencies: Record<string, any>;
    }
  ): ts.TranspileOutput {
    const compilerOptions: ts.CompilerOptions = {
      target: options.target,
      module: options.module,
      sourceMap: options.sourceMap,
      strict: false, // Relax strict mode for plugin compatibility
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    };

    return ts.transpileModule(code, {
      compilerOptions,
      reportDiagnostics: true,
    });
  }

  /**
   * Resolve SDK imports in JavaScript code
   */
  private resolveImports(
    code: string,
    options: Required<
      Omit<CompilationOptions, "sourceMap" | "sdkDependencies">
    > & {
      sourceMap: boolean;
      sdkDependencies: Record<string, any>;
    }
  ): CompilationResult {
    // Replace SDK imports with actual SDK code
    let resolvedCode = code;
    const dependencies = { ...options.sdkDependencies };

    // Handle SDK imports
    if (code.includes("@tensorify.io/sdk")) {
      const sdkStub = this.generateSDKStub(dependencies);

      // Replace require statements
      resolvedCode = resolvedCode.replace(
        /require\(['"`]@tensorify\.io\/sdk['"`]\)/g,
        `(${sdkStub})`
      );

      // Replace import statements (if any remain after transpilation)
      resolvedCode = resolvedCode.replace(
        /import\s+.*\s+from\s+['"`]@tensorify\.io\/sdk['"`];?/g,
        `const sdk = ${sdkStub};`
      );
    }

    return {
      code: resolvedCode,
      diagnostics: [],
      dependencies,
    };
  }

  /**
   * Generate SDK stub for execution context
   */
  private generateSDKStub(_dependencies: Record<string, any>): string {
    // This creates a minimal SDK implementation that can be executed in the isolated VM
    return `
// Base Node implementation for execution context
class BaseNode {
  constructor() {
    this.name = '';
    this.translationTemplate = '';
    this.inputLines = 0;
    this.outputLinesCount = 1;
    this.secondaryInputLinesCount = 0;
    this.nodeType = 'CUSTOM';
    this.settings = {};
  }

  validateSettings(settings) {
    return true;
  }

  getDependencies() {
    return [];
  }

  getImports() {
    return [];
  }

  processPayload(payload) {
    const { settings, children } = this.payloadToSettings(payload);
    return this.getTranslationCode(settings, children);
  }

  payloadToSettings(payload) {
    return {
      settings: payload,
      children: payload.children || payload.child || undefined
    };
  }

  getEntryPoints() {
    return {
      getTranslationCode: 'Generate code using the main translation method',
      processPayload: 'Process payload data from plugin-engine'
    };
  }

  getManifest() {
    return {
      name: this.name,
      entryPoints: this.getEntryPoints()
    };
  }

  indentCode(code, indentLevels) {
    if (!code || indentLevels <= 0) return code;
    const indent = '    '.repeat(indentLevels);
    return code
      .split('\\n')
      .map(line => line.trim().length > 0 ? indent + line : line)
      .join('\\n');
  }

  stringifyParameter(value) {
    if (typeof value === 'string') {
      if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(value)) {
        return value;
      } else {
        return '"' + value.replace(/"/g, '\\\\"') + '"';
      }
    } else if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    } else if (typeof value === 'number') {
      return value.toString();
    } else if (value === null || value === undefined) {
      return 'None';
    } else if (Array.isArray(value)) {
      const items = value.map(item => this.stringifyParameter(item));
      return '[' + items.join(', ') + ']';
    } else if (typeof value === 'object') {
      const entries = Object.entries(value).map(
        ([k, v]) => '"' + k + '": ' + this.stringifyParameter(v)
      );
      return '{' + entries.join(', ') + '}';
    } else {
      throw new Error('Unsupported parameter type: ' + typeof value);
    }
  }

  validateRequiredParams(settings, requiredParams) {
    const missing = requiredParams.filter(param => 
      settings[param] === undefined || settings[param] === null
    );

    if (missing.length > 0) {
      throw new Error('Missing required parameters: ' + missing.join(', '));
    }
  }
}

// Model Layer Node
class ModelLayerNode extends BaseNode {
  constructor() {
    super();
    this.inputLines = 1;
    this.outputLinesCount = 1;
    this.secondaryInputLinesCount = 0;
    this.nodeType = 'MODEL_LAYER';
  }

  getImports() {
    return ['import torch', 'import torch.nn as nn'];
  }

  buildLayerConstructor(layerName, requiredParams, optionalParams, settings) {
    const params = [];
    
    Object.entries(requiredParams).forEach(([key, value]) => {
      params.push(this.stringifyParameter(value));
    });

    Object.entries(optionalParams).forEach(([key, defaultValue]) => {
      const currentValue = settings[key];
      if (currentValue !== undefined && currentValue !== defaultValue) {
        params.push(key + '=' + this.stringifyParameter(currentValue));
      }
    });

    return layerName + '(' + params.join(', ') + ')';
  }
}

// Trainer Node
class TrainerNode extends BaseNode {
  constructor() {
    super();
    this.inputLines = 0;
    this.outputLinesCount = 1;
    this.secondaryInputLinesCount = 0;
    this.nodeType = 'TRAINER';
  }

  getImports() {
    return [
      'import torch',
      'import torch.nn as nn',
      'import torch.optim as optim',
      'from torch.utils.data import DataLoader'
    ];
  }
}

// Data Node
class DataNode extends BaseNode {
  constructor() {
    super();
    this.inputLines = 0;
    this.outputLinesCount = 1;
    this.secondaryInputLinesCount = 0;
    this.nodeType = 'DATALOADER';
  }

  getImports() {
    return [
      'import torch',
      'from torch.utils.data import Dataset, DataLoader',
      'import torchvision.transforms as transforms'
    ];
  }
}

// Node types
const NodeType = {
  CUSTOM: 'custom',
  TRAINER: 'trainer',
  EVALUATOR: 'evaluator',
  MODEL: 'model',
  MODEL_LAYER: 'model_layer',
    SEQUENCE: 'sequence',
  DATALOADER: 'dataloader',
  OPTIMIZER: 'optimizer',
  REPORT: 'report',
  FUNCTION: 'function',
  PIPELINE: 'pipeline'
};

// Export SDK components using module.exports for CommonJS compatibility
module.exports = {
  BaseNode: BaseNode,
  ModelLayerNode: ModelLayerNode,
  TrainerNode: TrainerNode,
  DataNode: DataNode,
  NodeType: NodeType
};

// Also set up named exports for ES modules
if (typeof exports !== 'undefined') {
  exports.BaseNode = BaseNode;
  exports.ModelLayerNode = ModelLayerNode;
  exports.TrainerNode = TrainerNode;
  exports.DataNode = DataNode;
  exports.NodeType = NodeType;
}
    `.trim();
  }
}
