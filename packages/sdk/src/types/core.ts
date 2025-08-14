/**
 * Core type definitions for the Tensorify SDK
 * These types form the foundation of the plugin system
 */

// ========================================
// CORE SETTINGS TYPE SYSTEM
// ========================================

/**
 * Base settings type that all plugin settings must extend
 * Every plugin must have these core fields
 */
export interface CorePluginSettings {
  /** Internal variable identifier for code generation */
  variableName: string;
  /** Display name for UI/labels */
  labelName: string;
}

/**
 * Extended settings type for plugins - allows any additional properties
 * while enforcing the core requirements
 */
export interface PluginSettings extends CorePluginSettings {
  [key: string]: any;
}

// ========================================
// PLUGIN CODE GENERATION CONTEXT
// ========================================

/**
 * Context provided during code generation
 * Contains all necessary information for generating executable code
 */
export interface PluginCodeGenerationContext {
  /** Unique identifier for the current workflow */
  workflowId: string;
  /** Unique identifier for the current node */
  nodeId: string;
  /** Mapping of handle number to input data */
  inputData: Record<number, any>;
  /** Global workflow context and variables */
  globalContext: any;
  /** Execution metadata */
  executionMetadata: {
    timestamp: number;
    userId: string;
    environmentType: "development" | "production";
  };
}

// ========================================
// NODE TYPE SYSTEM
// ========================================

/**
 * Comprehensive enumeration of all possible node types/categories
 * Each plugin must belong to one of these categories
 */
export enum NodeType {
  // Core Types
  CUSTOM = "custom",
  TRAINER = "trainer",
  EVALUATOR = "evaluator",
  MODEL = "model",
  MODEL_LAYER = "model_layer",
  SEQUENCE = "sequence",

  // Data Processing
  DATALOADER = "dataloader",
  PREPROCESSOR = "preprocessor",
  POSTPROCESSOR = "postprocessor",
  AUGMENTATION_STACK = "augmentation_stack",

  // Training Components
  OPTIMIZER = "optimizer",
  LOSS_FUNCTION = "loss_function",
  METRIC = "metric",
  SCHEDULER = "scheduler",
  REGULARIZER = "regularizer",

  // Workflow Components
  FUNCTION = "function",
  PIPELINE = "pipeline",
  REPORT = "report",
}

// ========================================
// PLUGIN CAPABILITIES
// ========================================

/**
 * Capabilities that a plugin can declare
 * Used for filtering and validation in the frontend
 */
export enum PluginCapability {
  CODE_GENERATION = "code-generation",
  DATA_PROCESSING = "data-processing",
  REAL_TIME = "real-time",
  BATCH_PROCESSING = "batch-processing",
  EXTERNAL_API = "external-api",
  FILE_PROCESSING = "file-processing",
  AI_INTEGRATION = "ai-integration",
}

/**
 * Requirements that a plugin needs to run
 */
export interface PluginRequirements {
  /** Minimum SDK version required */
  minSdkVersion: string;
  /** Required system dependencies */
  dependencies: string[];
  /** Python package requirements */
  pythonPackages?: string[];
  /** Node.js package requirements */
  nodePackages?: string[];
  /** Required environment variables */
  environmentVariables?: string[];
}
