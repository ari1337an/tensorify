/**
 * Visual configuration types for the Tensorify SDK
 * Defines how plugins appear and behave in the frontend
 */

// ========================================
// HANDLE CONFIGURATION TYPES
// ========================================

/**
 * Visual appearance types for handles
 */
export enum HandleViewType {
  DEFAULT = "default", // Standard circular
  VERTICAL_BOX = "verticalBox", // Rectangular vertical
  CIRCLE_LG = "circle-lg", // Large circular
  DIAMOND = "diamond", // Diamond shaped
  SQUARE = "square", // Square shaped
  TRIANGLE = "triangle", // Triangle shaped
}

/**
 * Physical positions for handles on the node (8-point system)
 */
export enum HandlePosition {
  TOP = "top",
  TOP_RIGHT = "top-right",
  RIGHT = "right",
  BOTTOM_RIGHT = "bottom-right",
  BOTTOM = "bottom",
  BOTTOM_LEFT = "bottom-left",
  LEFT = "left",
  TOP_LEFT = "top-left",
}

/**
 * Edge styling types for connections
 */
export enum EdgeType {
  DEFAULT = "default",
  SOLID = "solid",
  DOTTED = "dotted",
  DASHED = "dashed",
  ACCENT = "accent",
  MUTED = "muted",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

/**
 * Data types for handle validation
 */
export type HandleDataType =
  | "any"
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array";

/**
 * Validation rules for handle inputs
 */
export interface HandleValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: string;
}

/**
 * Input handle definition
 */
export interface InputHandle {
  /** Unique handle identifier */
  id: string;
  /** Physical position on node */
  position: HandlePosition;
  /** Visual appearance type */
  viewType: HandleViewType;
  /** Shows red star (*) if true */
  required: boolean;
  /** Display label */
  label: string;
  /** Edge styling */
  edgeType: EdgeType;
  /** Data type for validation */
  dataType: HandleDataType;
  /** Optional validation rules */
  validation?: HandleValidation;
  /** Tooltip description */
  description?: string;
}

/**
 * Output handle definition
 */
export interface OutputHandle {
  /** Unique handle identifier */
  id: string;
  /** Physical position on node */
  position: HandlePosition;
  /** Visual appearance type */
  viewType: HandleViewType;
  /** Display label */
  label: string;
  /** Edge styling */
  edgeType: EdgeType;
  /** Data type information */
  dataType: HandleDataType;
  /** Tooltip description */
  description?: string;
}

// ========================================
// NODE VISUAL CONFIGURATION
// ========================================

/**
 * Container types for nodes
 */
export enum NodeViewContainerType {
  DEFAULT = "default", // Standard rectangular
  BOX = "box", // Rounded rectangular
  CIRCLE = "circle", // Circular
  LEFT_ROUND = "left-round", // Left-rounded
}

/**
 * Icon types supported
 */
export enum IconType {
  SVG = "svg", // Raw SVG markup
  FONTAWESOME = "fontawesome", // FontAwesome icons
  LUCIDE = "lucide", // Lucide React icons
}

/**
 * Icon position options
 */
export type IconPosition = "center" | "top" | "left" | "bottom" | "right";

/**
 * Node icon configuration
 */
export interface NodeIcon {
  /** Icon type */
  type: IconType;
  /** Icon value (SVG, FA name like "fa:discord", or Lucide ID) */
  value: string;
  /** Position for secondary icons */
  position?: IconPosition;
}

/**
 * Node size configuration
 */
export interface NodeSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: "fixed" | "flexible";
}

/**
 * Node padding configuration
 */
export interface NodePadding {
  /** Internal content padding */
  inner: number;
  /** External border padding */
  outer: number;
  /** Additional padding like "Failure" node */
  extraPadding: boolean;
}

/**
 * Node styling configuration
 */
export interface NodeStyling {
  borderRadius: number;
  borderWidth: number;
  borderColor?: string;
  backgroundColor?: string;
  /** Shadow intensity */
  shadowLevel: 0 | 1 | 2 | 3;
  theme: "light" | "dark" | "auto";
}

/**
 * Node icons configuration
 */
export interface NodeIcons {
  /** Center icon */
  primary?: NodeIcon;
  /** Positioned icons */
  secondary: NodeIcon[];
  showIconBackground: boolean;
  iconSize: "small" | "medium" | "large";
}

/**
 * Node labels configuration
 */
export interface NodeLabels {
  /** Main title */
  title?: string;
  /** Subtitle */
  titleDescription?: string;
  /** Template with {placeholders} */
  dynamicLabelTemplate?: string;
  showLabels: boolean;
  labelPosition: "top" | "bottom" | "overlay";
}

/**
 * Complete visual configuration for a node
 */
export interface NodeVisualConfig {
  containerType: NodeViewContainerType;
  size: NodeSize;
  padding: NodePadding;
  styling: NodeStyling;
  icons: NodeIcons;
  labels: NodeLabels;
  /** Optional sequence-specific UI config (for NodeType.SEQUENCE) */
  sequence?: {
    /** Restrict sequence items to this pluginType (lowercase snake_case) */
    allowedItemType?: string;
    /** Whether to show inline items UI */
    showItems?: boolean;
  };
}
