/**
 * @tensorify.io/sdk
 *
 * TypeScript SDK for creating Tensorify plugins with comprehensive base classes,
 * utilities, and full compatibility with both transpiler and plugin-engine systems.
 */
export { INode, IPlugin, IUniversalNode, NodeType } from "./interfaces/INode";
export type { Layer, LayerSettings, NestedLayerSettings, Children, PluginPayload, PluginManifest, PluginEntryPoint, CodeGenerationContext, } from "./types";
export { BaseNode } from "./base/BaseNode";
export { ModelLayerNode, ModelLayerSettings } from "./base/ModelLayerNode";
export { TrainerNode, TrainerSettings } from "./base/TrainerNode";
export { DataNode, DataSettings } from "./base/DataNode";
export { generateVariableName, sanitizeVariableName, formatPythonCode, camelToSnake, snakeToCamel, deepMerge, normalizeSettings, buildImports, validateTensorDimensions, formatTensorShape, parseVersion, compareVersions, } from "./utils";
export { PluginValidator, validatePlugin, ManifestSchema, PackageJsonSchema, CURRENT_SDK_VERSION, } from "./validation";
export type { ValidationResult, ValidationError } from "./validation";
import { PluginManifest, PluginEntryPoint } from "./types";
export declare const SDK_VERSION = "0.0.1";
/**
 * Create a new plugin manifest with default values
 */
export declare function createManifest(overrides?: Partial<PluginManifest>): PluginManifest;
/**
 * Validate a plugin manifest
 */
export declare function validateManifest(manifest: PluginManifest): boolean;
/**
 * Helper function to create entry point configuration
 */
export declare function createEntryPoint(description: string, parameters?: Record<string, any>): PluginEntryPoint;
//# sourceMappingURL=index.d.ts.map