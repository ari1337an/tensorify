/**
 * Frontend Plugin System Type Definitions
 * Complete type system for the new Tensorify plugin architecture
 */

/**
 * Handle view types for React Flow node handles
 */
export type HandleViewType =
  | "default"
  | "verticalBox"
  | "circle-lg"
  | "diamond";

/**
 * Edge types for custom edge styling
 */
export type EdgeType = "default" | "solid" | "dotted" | "accent" | "muted";

/**
 * Handle positions using 8-point positioning system
 */
export type HandlePosition =
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "top-right"
  | "top-left"
  | "bottom-left"
  | "bottom-right";

/**
 * Node container types for outer container shape
 */
export type NodeViewContainerType = "default" | "box" | "circle" | "left-round";

/**
 * Icon types supported by the frontend
 */
export type IconType = "svg" | "fontawesome" | "lucide";

/**
 * Settings field types for UI components
 */
export type SettingsFieldType =
  | "dropdown"
  | "textarea"
  | "input-text"
  | "input-number"
  | "toggle"
  | "checkbox"
  | "radio";

/**
 * Data types for settings fields
 */
export type SettingsDataType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object";

/**
 * Icon configuration interface
 */
export interface NodeIcon {
  type: IconType;
  value: string; // SVG path, FA icon name (e.g., "fa:discord"), or Lucide icon ID
  position?: "center" | "top" | "left" | "bottom" | "right"; // For secondary icons
}

/**
 * Handle definition structure
 */
export interface HandleDefinition {
  id: string;
  position: HandlePosition;
  viewType: HandleViewType;
  required?: boolean; // Shows red star (*) in UI if true
  label?: string; // Handle label text
  edgeType?: EdgeType; // Custom edge styling
}

/**
 * Node visual configuration interface
 */
export interface NodeVisualConfig {
  // Container Configuration
  containerType: NodeViewContainerType;
  size: {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
  };
  extraPadding: boolean; // For nodes like "Failure" that need more outer padding

  // Title Configuration
  title?: string; // Main title like "AI Agent"
  titleDescription?: string; // Subtitle like "Tools Agent"

  // Icon Configuration
  primaryIcon?: NodeIcon; // Main center icon
  secondaryIcons: NodeIcon[]; // Additional positioned icons (like lightning bolt)

  // Dynamic Label Template
  dynamicLabelTemplate?: string; // Template with {placeholders}
}

/**
 * Settings field structure
 */
export interface SettingsField {
  key: string; // Unique identifier
  label: string; // UI display label
  type: SettingsFieldType; // UI component type
  dataType: SettingsDataType; // Primitive data type
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>; // For dropdown/radio
  required?: boolean;
  description?: string; // Help text
}

/**
 * Plugin definition interface - main plugin configuration
 */
export interface IPluginDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;

  // Visual Configuration
  visual: NodeVisualConfig;

  // Handle Configuration
  inputHandles: HandleDefinition[];
  outputHandles: HandleDefinition[];

  // Settings Configuration
  settingsFields: SettingsField[];
}

/**
 * Plugin settings type - runtime settings values
 */
export type PluginSettings = Record<string, any>;

/**
 * Frontend plugin manifest structure - what the frontend consumes
 */
export interface FrontendPluginManifest {
  name: string; // from package.json
  version: string; // from package.json
  description: string; // from package.json
  author: string; // from package.json
  main: string; // from package.json
  entrypointClassName: string; // CRITICAL: exact class name
  keywords: string[]; // from package.json

  frontendConfigs: {
    id: string;
    name: string;
    category: string;

    // Visual Configuration
    title?: string;
    titleDescription?: string;
    containerType: NodeViewContainerType;
    size: {
      width: number;
      height: number;
      minWidth?: number;
      minHeight?: number;
    };
    extraPadding: boolean;
    primaryIcon?: NodeIcon;
    secondaryIcons: NodeIcon[];

    // Handle Configuration
    inputHandles: HandleDefinition[];
    outputHandles: HandleDefinition[];

    // Settings Configuration
    settingsFields: SettingsField[];

    // Dynamic Label Template
    dynamicLabelTemplate?: string;
  };

  capabilities: string[];
  requirements: {
    minSdkVersion: string;
    dependencies: string[];
  };
}

/**
 * Package.json structure for manifest generation
 */
export interface PackageJsonInfo {
  name: string;
  version: string;
  description?: string;
  author?: string;
  main?: string;
  keywords?: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Plugin validation result
 */
export interface PluginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Code generation context for plugins
 */
export interface PluginCodeGenerationContext {
  /** Target framework (pytorch, tensorflow, etc.) */
  framework?: string;
  /** Output language (python, javascript, etc.) */
  language?: string;
  /** Workflow-level context and global state */
  workflowContext?: Record<string, any>;
  /** Connected child node data */
  childrenContext?: Record<string, any>;
  /** Additional context data */
  [key: string]: any;
}
