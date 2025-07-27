/**
 * @tensorify.io/sdk
 *
 * TypeScript SDK for creating Tensorify plugins with comprehensive base classes,
 * utilities, and full compatibility with both transpiler and plugin-engine systems.
 */

// Core interfaces
export { INode, IPlugin, IUniversalNode, NodeType } from "./interfaces/INode";

// Core types
export type {
  Layer,
  LayerSettings,
  NestedLayerSettings,
  Children,
  PluginPayload,
  PluginManifest,
  PluginEntryPoint,
  CodeGenerationContext,
} from "./types";

// Base classes
export { BaseNode } from "./base/BaseNode";
export { ModelLayerNode, ModelLayerSettings } from "./base/ModelLayerNode";
export { TrainerNode, TrainerSettings } from "./base/TrainerNode";
export { DataNode, DataSettings } from "./base/DataNode";

// Utilities
export {
  generateVariableName,
  sanitizeVariableName,
  formatPythonCode,
  camelToSnake,
  snakeToCamel,
  deepMerge,
  normalizeSettings,
  buildImports,
  validateTensorDimensions,
  formatTensorShape,
  parseVersion,
  compareVersions,
} from "./utils";

// Validation
export {
  PluginValidator,
  validatePlugin,
  ManifestSchema,
  PackageJsonSchema,
  CURRENT_SDK_VERSION,
} from "./validation";
export type { ValidationResult, ValidationError } from "./validation";

// Import types for internal use
import { PluginManifest, PluginEntryPoint } from "./types";

// Version information
export const SDK_VERSION = "0.0.1";

/**
 * Create a new plugin manifest with default values
 */
export function createManifest(
  overrides: Partial<PluginManifest> = {}
): PluginManifest {
  const defaultManifest: PluginManifest = {
    slug: "my-plugin",
    name: "My Plugin",
    version: "1.0.0",
    description: "A Tensorify plugin created with the SDK",
    author: "",
    engineVersion: "^0.0.1",
    tags: [],
    category: "general",
    dependencies: [],
    entryPoints: {},
  };

  return { ...defaultManifest, ...overrides };
}

/**
 * Validate a plugin manifest
 */
export function validateManifest(manifest: PluginManifest): boolean {
  const required = ["slug", "name", "version"];

  for (const field of required) {
    if (!manifest[field as keyof PluginManifest]) {
      throw new Error(`Manifest missing required field: ${field}`);
    }
  }

  // Validate version format
  if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
    throw new Error(
      `Invalid version format: ${manifest.version}. Use semantic versioning (e.g., 1.0.0)`
    );
  }

  return true;
}

/**
 * Helper function to create entry point configuration
 */
export function createEntryPoint(
  description: string,
  parameters: Record<string, any> = {}
): PluginEntryPoint {
  return {
    description,
    parameters: Object.fromEntries(
      Object.entries(parameters).map(([key, config]) => [
        key,
        { description: "", ...config },
      ])
    ),
  };
}
