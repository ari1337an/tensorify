import {
  Children,
  LayerSettings,
  PluginPayload,
  CodeGenerationContext,
} from "../types";

/**
 * Node types enumeration for categorizing different plugin types
 */
export enum NodeType {
  CUSTOM = "custom",
  TRAINER = "trainer",
  EVALUATOR = "evaluator",
  MODEL = "model",
  MODEL_LAYER = "model_layer",
  DATALOADER = "dataloader",
  OPTIMIZER = "optimizer",
  REPORT = "report",
  FUNCTION = "function",
  PIPELINE = "pipeline",
  AUGMENTATION_STACK = "augmentation_stack",
  PREPROCESSOR = "preprocessor",
  POSTPROCESSOR = "postprocessor",
  LOSS_FUNCTION = "loss_function",
  METRIC = "metric",
  SCHEDULER = "scheduler",
  REGULARIZER = "regularizer",
}

/**
 * Core interface that all nodes/plugins must implement
 * This interface provides the basic structure for code generation
 */
export interface INode<TSettings extends LayerSettings = LayerSettings> {
  /** Name of the node */
  readonly name: string;

  /** Template used for translation - can be dynamic */
  readonly translationTemplate: string;

  /** Number of input lines */
  readonly inputLines: number;

  /** Number of output lines */
  readonly outputLinesCount: number;

  /** Number of secondary input lines */
  readonly secondaryInputLinesCount: number;

  /** Type of the node */
  readonly nodeType: NodeType;

  /** Default settings for the node */
  readonly settings: TSettings;

  /** Optional child nodes */
  readonly child?: Children;

  /**
   * Main function to get the translation code
   * @param settings - Node-specific settings
   * @param children - Child nodes if any
   * @param context - Optional code generation context
   * @returns Generated code string
   */
  getTranslationCode(
    settings: TSettings,
    children?: Children,
    context?: CodeGenerationContext
  ): string;

  /**
   * Validate settings before code generation
   * @param settings - Settings to validate
   * @returns True if valid, throws error if invalid
   */
  validateSettings?(settings: TSettings): boolean;

  /**
   * Get required dependencies for this node
   * @returns Array of dependency names
   */
  getDependencies?(): string[];

  /**
   * Get imports needed for this node
   * @param context - Code generation context
   * @returns Import statements as strings
   */
  getImports?(context?: CodeGenerationContext): string[];
}

/**
 * Extended interface for plugins that support multiple entry points
 * This is compatible with the plugin-engine's flexible entry point system
 */
export interface IPlugin {
  /**
   * Process payload data (new plugin-engine style)
   * @param payload - Input data from plugin-engine
   * @returns Generated code string
   */
  processPayload?(payload: PluginPayload): string;

  /**
   * Get available entry points for this plugin
   * @returns Object with entry point names and descriptions
   */
  getEntryPoints?(): Record<string, string>;

  /**
   * Get plugin manifest information
   * @returns Manifest object
   */
  getManifest?(): Partial<import("../types").PluginManifest>;
}

/**
 * Combined interface for nodes that can work in both transpiler and plugin-engine
 */
export interface IUniversalNode<TSettings extends LayerSettings = LayerSettings>
  extends INode<TSettings>,
    IPlugin {
  /**
   * Handle payload data and convert to settings + children format
   * @param payload - Payload from plugin-engine
   * @returns Object with settings and children
   */
  payloadToSettings?(payload: PluginPayload): {
    settings: TSettings;
    children?: Children;
  };
}
