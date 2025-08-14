/**
 * @tensorify.io/sdk
 *
 * TypeScript SDK for developing Tensorify plugins with comprehensive validation,
 * frontend enforcement, and publishing tools.
 *
 * @version 1.0.0
 * @author AlphaWolf Ventures, Inc.
 * @license ISC
 */

// ========================================
// CORE CLASSES
// ========================================

// Main abstract class that all plugins extend
export { TensorifyPlugin } from "./core/TensorifyPlugin";

// ========================================
// TYPE DEFINITIONS
// ========================================

// Core types
export {
  CorePluginSettings,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  PluginRequirements,
} from "./types/core";

// Visual configuration types
export {
  HandleViewType,
  HandlePosition,
  EdgeType,
  HandleDataType,
  HandleValidation,
  InputHandle,
  OutputHandle,
  NodeViewContainerType,
  IconType,
  IconPosition,
  NodeIcon,
  NodeSize,
  NodePadding,
  NodeStyling,
  NodeIcons,
  NodeLabels,
  NodeVisualConfig,
} from "./types/visual";

// Convenience handle presets for mandatory flow
export { PrevNodeAsInput, NextNodeAsOutput } from "./constants/handles";

// Settings field types
export {
  SettingsUIType,
  SettingsDataType,
  SelectOption,
  FieldValidation,
  ConditionalDisplay,
  SettingsField,
  SettingsGroup,
  UI_TYPE_TO_DATA_TYPE_MAP,
  DEFAULT_VALUES,
} from "./types/settings";

// Plugin definition and manifest types
export {
  IPluginDefinition,
  PackageJsonInfo,
  FrontendPluginManifest,
  EmitsConfig,
  EmittedVariableConfig,
  ImportConfig,
  PluginValidationResult,
  PluginValidationError,
  PluginValidationWarning,
  PluginCreationResult,
  PluginBuildOptions,
  PluginExecutionContext,
  PluginExecutionResult,
  PluginExecutionError,
} from "./types/plugin";

// Import types for local use in functions
import { FrontendPluginManifest } from "./types/plugin";
import { NodeType, PluginCapability } from "./types/core";
import { NodeViewContainerType } from "./types/visual";

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Plugin development utilities
export {
  generatePluginManifest,
  readPackageJson,
  writeManifestFile,
  buildPluginManifest,
  validatePlugin,
  validatePluginSettings,
  createDefaultSettings,
  mergeSettingsWithDefaults,
  processDynamicLabelTemplate,
  generateVariableName,
  sanitizeVariableName,
  indentCode,
  autoDetectEntrypointClassName,
  isValidPluginDirectory,
  createPluginTemplate,
  getPluginMetadata,
} from "./utils/plugin-utils";

// ========================================
// CONSTANTS AND HELPERS
// ========================================

/**
 * Supported node type categories for plugins
 */
export const PLUGIN_CATEGORIES = [
  "custom",
  "trainer",
  "evaluator",
  "model",
  "model_layer",
  "sequence",
  "dataloader",
  "preprocessor",
  "postprocessor",
  "augmentation_stack",
  "optimizer",
  "loss_function",
  "metric",
  "scheduler",
  "regularizer",
  "function",
  "pipeline",
  "report",
] as const;

/**
 * Plugin category type derived from constants
 */
export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];

/**
 * Current SDK version
 */
export const SDK_VERSION = "1.0.0";

/**
 * Minimum required TypeScript version
 */
export const MIN_TYPESCRIPT_VERSION = "4.5.0";

/**
 * Supported manifest format versions
 */
export const MANIFEST_VERSIONS = ["1.0.0"] as const;

// ========================================
// CONVENIENCE FUNCTIONS
// ========================================

/**
 * Create a new plugin manifest with default values
 *
 * @param overrides Optional properties to override defaults
 * @returns Plugin manifest with defaults applied
 */
export function createManifest(
  overrides: Partial<FrontendPluginManifest> = {}
): FrontendPluginManifest {
  const defaults: FrontendPluginManifest = {
    name: "my-plugin",
    version: "1.0.0",
    description: "A new Tensorify plugin",
    author: "",
    main: "dist/index.js",
    entrypointClassName: "MyPlugin",
    keywords: ["tensorify", "plugin"],

    frontendConfigs: {
      id: "my-plugin",
      name: "My Plugin",
      category: "custom",
      nodeType: NodeType.CUSTOM,
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: { width: 200, height: 120 },
        padding: { inner: 16, outer: 8, extraPadding: false },
        styling: {
          borderRadius: 8,
          borderWidth: 2,
          shadowLevel: 1,
          theme: "auto",
        },
        icons: { secondary: [], showIconBackground: true, iconSize: "medium" },
        labels: { showLabels: true, labelPosition: "top" },
      },
      inputHandles: [],
      outputHandles: [],
      settingsFields: [],
    },

    capabilities: [PluginCapability.CODE_GENERATION],
    requirements: {
      minSdkVersion: SDK_VERSION,
      dependencies: [],
    },

    sdkVersion: SDK_VERSION,
    generatedAt: new Date().toISOString(),
    manifestVersion: "1.0.0",
  };

  return { ...defaults, ...overrides };
}

/**
 * Validate a plugin manifest structure
 *
 * @param manifest Manifest to validate
 * @returns True if valid, throws error if invalid
 */
export function validateManifest(manifest: FrontendPluginManifest): boolean {
  const required = [
    "name",
    "version",
    "entrypointClassName",
    "frontendConfigs",
  ];

  for (const field of required) {
    if (
      !(field in manifest) ||
      !manifest[field as keyof FrontendPluginManifest]
    ) {
      throw new Error(`Required field '${field}' is missing from manifest`);
    }
  }

  // Validate semantic versioning
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(manifest.version)) {
    throw new Error(`Invalid version format: ${manifest.version}`);
  }

  return true;
}

/**
 * Create a plugin entry point for CLI usage
 *
 * @param description Entry point description
 * @param parameters Entry point parameters
 * @returns Plugin entry point object
 */
export function createEntryPoint(
  description: string,
  parameters: Record<string, any> = {}
): { description: string; parameters: Record<string, any> } {
  return {
    description,
    parameters: {
      settings: {
        type: "object",
        required: true,
        description: "Plugin settings object",
      },
      children: {
        type: "any",
        required: false,
        description: "Connected child plugins",
      },
      context: {
        type: "object",
        required: false,
        description: "Code generation context",
      },
      ...parameters,
    },
  };
}
