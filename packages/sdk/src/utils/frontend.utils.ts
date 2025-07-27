/**
 * Frontend Integration Utilities
 * Helper functions for integrating TensorifyPlugin with React Flow frontend
 */

import { TensorifyPlugin } from "../base/TensorifyPlugin";
import type {
  FrontendPluginManifest,
  HandleDefinition,
  SettingsField,
} from "../types/plugin.types";

/**
 * NodeItem interface matching the frontend structure
 */
export interface NodeItem {
  id: string;
  draggable: boolean;
  version?: string;
  Icon: any; // Lucide icon component
  title: string;
  description: string;
  children?: NodeItem[];
}

/**
 * Settings field metadata for frontend rendering
 */
export interface FrontendSettingsFieldMeta {
  key: string;
  label: string;
  type:
    | "input-text"
    | "input-number"
    | "textarea"
    | "dropdown"
    | "radio"
    | "checkbox"
    | "toggle";
  dataType: "string" | "number" | "boolean" | "array" | "object";
  required?: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  description?: string;
}

/**
 * Handle metadata for frontend rendering
 */
export interface FrontendHandleMeta {
  id: string;
  position: string;
  viewType: string;
  required?: boolean;
  label?: string;
  edgeType?: string;
}

/**
 * Complete plugin metadata for frontend integration
 */
export interface FrontendPluginMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;

  // Visual configuration
  title?: string;
  titleDescription?: string;
  containerType: string;
  size: {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
  };
  extraPadding: boolean;
  primaryIcon?: any;
  secondaryIcons: any[];

  // Handle configuration
  inputHandles: FrontendHandleMeta[];
  outputHandles: FrontendHandleMeta[];

  // Settings configuration
  settingsFields: FrontendSettingsFieldMeta[];

  // Dynamic label template
  dynamicLabelTemplate?: string;
}

/**
 * Convert TensorifyPlugin to NodeItem for defaultNodes.ts integration
 */
export function pluginToNodeItem(
  plugin: TensorifyPlugin,
  iconComponent: any
): NodeItem {
  const definition = plugin.getDefinition();

  return {
    id: definition.id,
    draggable: true,
    version: definition.version,
    Icon: iconComponent,
    title: definition.name,
    description: definition.description,
  };
}

/**
 * Convert multiple plugins to NodeItem array for category-based organization
 */
export function pluginsToNodeItems(
  plugins: TensorifyPlugin[],
  iconResolver: (pluginId: string) => any
): NodeItem[] {
  return plugins.map((plugin) =>
    pluginToNodeItem(plugin, iconResolver(plugin.getId()))
  );
}

/**
 * Generate FrontendPluginMeta from TensorifyPlugin for enhanced TNode.tsx rendering
 */
export function generateFrontendPluginMeta(
  plugin: TensorifyPlugin
): FrontendPluginMeta {
  const definition = plugin.getDefinition();
  const visual = plugin.getVisualConfig();

  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    version: definition.version,

    // Visual configuration
    title: visual.title,
    titleDescription: visual.titleDescription,
    containerType: visual.containerType,
    size: visual.size,
    extraPadding: visual.extraPadding,
    primaryIcon: visual.primaryIcon,
    secondaryIcons: visual.secondaryIcons,

    // Handles
    inputHandles: plugin.getInputHandles().map(convertHandleToFrontend),
    outputHandles: plugin.getOutputHandles().map(convertHandleToFrontend),

    // Settings
    settingsFields: plugin
      .getSettingsFields()
      .map(convertSettingsFieldToFrontend),

    // Dynamic label
    dynamicLabelTemplate: plugin.getDynamicLabelTemplate(),
  };
}

/**
 * Convert HandleDefinition to frontend format
 */
function convertHandleToFrontend(handle: HandleDefinition): FrontendHandleMeta {
  return {
    id: handle.id,
    position: handle.position,
    viewType: handle.viewType,
    required: handle.required,
    label: handle.label,
    edgeType: handle.edgeType,
  };
}

/**
 * Convert SettingsField to frontend format
 */
function convertSettingsFieldToFrontend(
  field: SettingsField
): FrontendSettingsFieldMeta {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    dataType: field.dataType,
    required: field.required,
    defaultValue: field.defaultValue,
    options: field.options,
    description: field.description,
  };
}

/**
 * Check if a node type is a TensorifyPlugin by ID pattern
 */
export function isTensorifyPluginNode(nodeType: string): boolean {
  // Check for plugin-like patterns
  return (
    nodeType.includes("@") ||
    nodeType.includes("/") ||
    nodeType.startsWith("tensorify-") ||
    nodeType.includes("plugin")
  );
}

/**
 * Extract plugin ID from node type string
 */
export function extractPluginId(nodeType: string): string {
  // Handle various plugin ID formats
  if (nodeType.startsWith("@")) {
    return nodeType;
  }

  if (nodeType.includes("/")) {
    return nodeType;
  }

  return nodeType;
}

/**
 * Get default icon name based on plugin category
 */
export function getDefaultIconForCategory(category: string): string {
  const categoryIconMap: Record<string, string> = {
    model_layer: "Layers",
    model: "Brain",
    trainer: "ChartNetwork",
    evaluator: "BarChart3",
    dataloader: "Loader",
    dataset: "Database",
    optimizer: "Settings",
    criterion: "InfinityIcon",
    loss_function: "Calculator",
    metric: "Activity",
    scheduler: "Clock",
    regularizer: "Filter",
    preprocessor: "Filter",
    postprocessor: "Workflow",
    augmentation_stack: "Layers",
    train_one_epoch_function: "CopyCheck",
    report: "FileText",
    function: "GitBranch",
    pipeline: "Workflow",
    custom: "Wrench",
    miscellaneous: "HelpCircle",
  };

  return categoryIconMap[category] || "HelpCircle";
}

/**
 * Create plugin manifest integration helper for NodeSearch.tsx
 */
export function integratePluginIntoCategories(
  plugin: TensorifyPlugin,
  existingCategories: NodeItem[],
  iconResolver: (pluginId: string) => any
): NodeItem[] {
  const definition = plugin.getDefinition();
  const pluginNodeItem = pluginToNodeItem(plugin, iconResolver(definition.id));

  return existingCategories.map((category) => {
    if (category.id === definition.category) {
      return {
        ...category,
        children: [...(category.children || []), pluginNodeItem],
      };
    }
    return category;
  });
}
