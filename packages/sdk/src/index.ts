/**
 * @tensorify.io/sdk
 *
 * TypeScript SDK for creating Tensorify plugins with comprehensive frontend support,
 * React Flow node integration, and full plugin system capabilities.
 */

// ===== NEW PLUGIN SYSTEM EXPORTS =====

// Core Plugin Types
export type {
  // Handle Types
  HandleViewType,
  EdgeType,
  HandlePosition,

  // Visual Types
  NodeViewContainerType,
  IconType,
  NodeIcon,

  // Settings Types
  SettingsFieldType,
  SettingsDataType,

  // Core Interfaces
  HandleDefinition,
  NodeVisualConfig,
  SettingsField,
  IPluginDefinition,
  PluginSettings,
  FrontendPluginManifest,
  PackageJsonInfo,
  PluginValidationResult,
  PluginCodeGenerationContext,
} from "./types/plugin.types";

// Core Plugin Classes
export { TensorifyPlugin } from "./base/TensorifyPlugin";

// Plugin Validation Utilities
export {
  validatePlugin,
  PluginValidator,
  ManifestSchema,
  PackageJsonSchema,
  CURRENT_SDK_VERSION,
  type ValidationError,
  type ValidationResult,
} from "./validation/index";

// NodeType enum for CLI compatibility
export { NodeType } from "./interfaces/INode";

// Plugin Utilities
export {
  generatePluginManifest,
  readPackageJson,
  writeManifestFile,
  buildPluginManifest,
  createDefaultSettings,
  mergeSettings,
  generateDynamicLabel,
  getPluginMetadata,
  createPluginSummary,
  validateSettingsWithFeedback,
  autoDetectEntrypointClassName,
  generateBuildScript,
  createPluginTemplate,
} from "./utils/plugin.utils";

// Frontend Integration Utilities
export {
  pluginToNodeItem,
  pluginsToNodeItems,
  generateFrontendPluginMeta,
  isTensorifyPluginNode,
  extractPluginId,
  getDefaultIconForCategory,
  integratePluginIntoCategories,
} from "./utils/frontend.utils";

export type {
  NodeItem,
  FrontendSettingsFieldMeta,
  FrontendHandleMeta,
  FrontendPluginMeta,
} from "./utils/frontend.utils";

// Sample Plugin (for reference)
export { AIChatAgentPlugin } from "./examples/AIChatAgentPlugin";

// ===== LEGACY TYPES (Backward Compatibility) =====

// Legacy core types - kept for backward compatibility
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

// Utilities - kept for backward compatibility
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

/**
 * SDK Version Information
 */
export const SDK_VERSION = "2.0.0";
export const PLUGIN_SYSTEM_VERSION = "1.0.0";

/**
 * Supported Plugin Categories
 */
export const PLUGIN_CATEGORIES = [
  "model_layer",
  "model",
  "trainer",
  "evaluator",
  "dataloader",
  "dataset",
  "optimizer",
  "criterion",
  "loss_function",
  "metric",
  "scheduler",
  "regularizer",
  "preprocessor",
  "postprocessor",
  "augmentation_stack",
  "train_one_epoch_function",
  "report",
  "function",
  "pipeline",
  "custom",
  "miscellaneous",
] as const;

export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];
