"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import * as LucideIcons from "lucide-react";
import TNode from "./TNode/TNode";
import { type WorkflowNode } from "../../store/workflowStore";
import useWorkflowStore from "../../store/workflowStore";
import useStore from "@/app/_store/store";

// Icon size mapping
const ICON_SIZE_MAP = {
  small: "w-4 h-4",
  medium: "w-6 h-6",
  large: "w-8 h-8",
};

// Shadow level mapping
const SHADOW_LEVEL_MAP = {
  0: "",
  1: "shadow-sm",
  2: "shadow-md",
  3: "shadow-lg",
  4: "shadow-xl",
};

// Position mapping for handles (8-point system)
const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
  "top-left": Position.Top,
  "top-right": Position.Top,
  "bottom-left": Position.Bottom,
  "bottom-right": Position.Bottom,
};

// Container type styling
const CONTAINER_STYLES = {
  default: "rounded-lg",
  box: "rounded-xl",
  circle: "rounded-full aspect-square",
  "left-round": "rounded-l-full rounded-r-lg",
};

// Edge type colors
const EDGE_TYPE_COLORS = {
  default: "bg-muted-foreground",
  solid: "bg-foreground",
  dotted: "bg-muted-foreground",
  dashed: "bg-muted-foreground",
  accent: "bg-primary",
  muted: "bg-muted",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

// NodeType category colors for badges
const NODE_TYPE_COLORS = {
  // Core Types
  custom: "bg-gray-500",
  trainer: "bg-blue-600",
  evaluator: "bg-purple-600",
  model: "bg-indigo-600",
  model_layer: "bg-indigo-500",

  // Data Processing
  dataloader: "bg-green-600",
  preprocessor: "bg-green-500",
  postprocessor: "bg-green-400",
  augmentation_stack: "bg-teal-500",

  // Training Components
  optimizer: "bg-orange-600",
  loss_function: "bg-red-600",
  metric: "bg-yellow-600",
  scheduler: "bg-pink-600",
  regularizer: "bg-rose-600",

  // Workflow Components
  function: "bg-cyan-600",
  pipeline: "bg-violet-600",
  report: "bg-amber-600",
};

// Icon component wrapper for different icon types
function IconWrapper({
  icon,
  className,
  iconUrl,
}: {
  icon: any;
  className?: string;
  iconUrl?: string | null;
}) {
  if (!icon) return null;

  const iconType = (icon.type || "lucide").toLowerCase();
  const iconValue = icon.value || "";

  // Handle S3 URL icons (future implementation)
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt="Plugin Icon"
        className={className}
        onError={(e) => {
          // Fallback to icon value if URL fails
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  // Handle SVG icons
  if (iconType === "svg") {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: iconValue }}
      />
    );
  }

  // Handle FontAwesome icons
  if (iconType === "fontawesome") {
    return <i className={`${iconValue} ${className}`} />;
  }

  // Handle Lucide icons (default)
  if (iconType === "lucide") {
    const LucideIcon = getIconComponent(iconValue);
    if (LucideIcon) {
      return <LucideIcon className={className} />;
    }
  }

  // Fallback to text
  return <span className={className}>{iconValue.charAt(0).toUpperCase()}</span>;
}

// Get Lucide icon component by name
function getIconComponent(
  iconName: string
): React.ComponentType<{ className?: string }> | null {
  if (!iconName) return null;

  // Convert icon name to PascalCase (e.g., "droplets" -> "Droplets")
  const pascalCaseName = iconName
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  // Try to get the icon from lucide-react
  const icon = (LucideIcons as any)[pascalCaseName];

  // Return the icon if found, otherwise return null
  return icon || null;
}

// Get handle position based on 8-point system
function getHandlePosition(
  position: string,
  index: number,
  totalHandles: number
) {
  const offset = ((index + 1) / (totalHandles + 1)) * 100;

  switch (position) {
    case "left":
      return { top: `${offset}%`, left: 0 };
    case "right":
      return { top: `${offset}%`, right: 0 };
    case "top":
      return { left: `${offset}%`, top: 0 };
    case "bottom":
      return { left: `${offset}%`, bottom: 0 };
    case "top-left":
      return { top: 0, left: 0 };
    case "top-right":
      return { top: 0, right: 0 };
    case "bottom-left":
      return { bottom: 0, left: 0 };
    case "bottom-right":
      return { bottom: 0, right: 0 };
    default:
      return { top: `${offset}%`, left: 0 };
  }
}

export default function CustomPluginNode(props: NodeProps<WorkflowNode>) {
  const { data, selected, id } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label || "Plugin Node");
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const pluginManifests = useStore((state) => state.pluginManifests);

  // Find the manifest for this plugin node with error handling
  const manifest = useMemo(() => {
    try {
      const pluginId = data.pluginId || id;
      const found = pluginManifests.find(
        (p) => p.slug === pluginId || p.id === pluginId
      );
      if (found) {
        setHasError(false);
      }
      return found;
    } catch (error) {
      console.error("Error finding plugin manifest:", error);
      setHasError(true);
      return null;
    }
  }, [pluginManifests, data.pluginId, id]);

  // Extract visual properties from manifest with comprehensive fallbacks
  const visualProps = useMemo(() => {
    if (!manifest?.manifest) {
      return {
        containerType: "default",
        width: 200,
        height: 120,
        primaryIcon: null,
        secondaryIcons: [],
        iconSize: "medium",
        showIconBackground: true,
        title: data.label || "Plugin",
        titleDescription: null,
        showLabels: true,
        labelPosition: "top",
        dynamicLabelTemplate: null,
        innerPadding: 16,
        outerPadding: 8,
        extraPadding: false,
        borderWidth: 2,
        shadowLevel: 1,
        borderRadius: 8,
        borderColor: null,
        backgroundColor: null,
        theme: "auto",
      };
    }

    const visual = (manifest.manifest.visual as any) || {};
    const size = visual.size || {};
    const icons = visual.icons || {};
    const labels = visual.labels || {};
    const padding = visual.padding || {};
    const styling = visual.styling || {};

    // Normalize container type
    const containerType = (visual.containerType || "default").toLowerCase();

    return {
      containerType,
      width: size.width || 200,
      height: size.height || 120,
      minWidth: size.minWidth,
      minHeight: size.minHeight,
      maxWidth: size.maxWidth,
      maxHeight: size.maxHeight,
      aspectRatio: size.aspectRatio,
      primaryIcon: icons.primary || null,
      secondaryIcons: icons.secondary || [],
      iconSize: icons.iconSize || "medium",
      showIconBackground: icons.showIconBackground !== false,
      title: labels.title || data.label || "Plugin",
      titleDescription: labels.titleDescription,
      showLabels: labels.showLabels !== false,
      labelPosition: labels.labelPosition || "top",
      dynamicLabelTemplate: labels.dynamicLabelTemplate || null,
      innerPadding: padding.inner ?? 16,
      outerPadding: padding.outer ?? 8,
      extraPadding: padding.extraPadding || false,
      borderWidth: styling.borderWidth ?? 2,
      shadowLevel: styling.shadowLevel ?? 1,
      borderRadius: styling.borderRadius ?? 8,
      borderColor: styling.borderColor,
      backgroundColor: styling.backgroundColor,
      theme: styling.theme || "auto",
    };
  }, [manifest, data.label]);

  // Extract handle configurations
  const { inputHandles, outputHandles } = useMemo(() => {
    if (!manifest?.manifest) {
      return { inputHandles: [], outputHandles: [] };
    }

    return {
      inputHandles: (manifest.manifest.inputHandles as any[]) || [],
      outputHandles: (manifest.manifest.outputHandles as any[]) || [],
    };
  }, [manifest]);

  // Process dynamic label
  const processedLabel = useMemo(() => {
    if (!visualProps.dynamicLabelTemplate || !data) {
      return visualProps.title;
    }

    // Replace placeholders in the template with actual values
    let label = visualProps.dynamicLabelTemplate;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (label.includes(placeholder)) {
        label = label.replace(placeholder, String(value));
      }
    });

    return label;
  }, [visualProps.dynamicLabelTemplate, visualProps.title, data]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingLabel(processedLabel);
  };

  const handleLabelSave = () => {
    const newLabel = editingLabel.trim() || visualProps.title;
    updateNodeData(id, { label: newLabel });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLabelSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditingLabel(processedLabel);
    }
  };

  // Get the appropriate styling based on container type
  const containerStyle =
    CONTAINER_STYLES[
      visualProps.containerType as keyof typeof CONTAINER_STYLES
    ] || CONTAINER_STYLES.default;

  const iconSizeClass =
    ICON_SIZE_MAP[visualProps.iconSize as keyof typeof ICON_SIZE_MAP] ||
    ICON_SIZE_MAP.medium;

  const shadowClass =
    SHADOW_LEVEL_MAP[
      visualProps.shadowLevel as keyof typeof SHADOW_LEVEL_MAP
    ] || SHADOW_LEVEL_MAP[1];

  // Get node type for badge with safe fallback
  const nodeType = useMemo(() => {
    try {
      const type =
        manifest?.manifest?.pluginType ||
        manifest?.manifest?.nodeType ||
        manifest?.pluginType ||
        "custom";
      return typeof type === "string" ? type.toLowerCase() : "custom";
    } catch {
      return "custom";
    }
  }, [manifest]);

  const nodeTypeColor =
    NODE_TYPE_COLORS[nodeType as keyof typeof NODE_TYPE_COLORS] ||
    NODE_TYPE_COLORS.custom;

  // Handle error state
  if (hasError || !manifest) {
    return (
      <TNode {...props}>
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 min-w-[180px] min-h-[80px]">
          <div className="flex flex-col items-center justify-center space-y-2">
            <LucideIcons.AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Plugin Error
            </p>
            <p className="text-xs text-red-600 dark:text-red-400">
              Missing manifest
            </p>
          </div>
        </div>
      </TNode>
    );
  }

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-card transition-all duration-200
          ${containerStyle}
          ${shadowClass}
          ${selected ? "shadow-primary/20" : ""}
          ${visualProps.extraPadding ? "p-4" : ""}
        `}
        style={{
          width: `${visualProps.width}px`,
          height: `${visualProps.height}px`,
          minWidth: visualProps.minWidth
            ? `${visualProps.minWidth}px`
            : undefined,
          minHeight: visualProps.minHeight
            ? `${visualProps.minHeight}px`
            : undefined,
          maxWidth: visualProps.maxWidth
            ? `${visualProps.maxWidth}px`
            : undefined,
          maxHeight: visualProps.maxHeight
            ? `${visualProps.maxHeight}px`
            : undefined,
          borderWidth: `${visualProps.borderWidth}px`,
          borderRadius:
            visualProps.containerType === "circle"
              ? "50%"
              : `${visualProps.borderRadius}px`,
          borderColor: selected
            ? "var(--primary)"
            : visualProps.borderColor || "var(--border)",
          backgroundColor: visualProps.backgroundColor || undefined,
          padding: `${visualProps.outerPadding}px`,
        }}
      >
        {/* Input Handles */}
        {inputHandles.map((handle, index) => (
          <Handle
            key={`input-${handle.id}`}
            id={handle.id}
            type="target"
            position={
              POSITION_MAP[handle.position as keyof typeof POSITION_MAP] ||
              Position.Left
            }
            className={`w-3 h-3 border-2 border-background ${
              EDGE_TYPE_COLORS[
                handle.edgeType as keyof typeof EDGE_TYPE_COLORS
              ] || EDGE_TYPE_COLORS.default
            }`}
            style={{
              top: getHandlePosition(
                handle.position,
                index,
                inputHandles.length
              ).top,
              left: getHandlePosition(
                handle.position,
                index,
                inputHandles.length
              ).left,
              right: getHandlePosition(
                handle.position,
                index,
                inputHandles.length
              ).right,
              bottom: getHandlePosition(
                handle.position,
                index,
                inputHandles.length
              ).bottom,
            }}
          />
        ))}

        <div
          className="flex flex-col items-center justify-center h-full space-y-2"
          style={{ padding: `${visualProps.innerPadding}px` }}
        >
          {/* Primary Icon */}
          {visualProps.primaryIcon && (
            <div
              className={`
                rounded-md transition-colors duration-200
                ${
                  visualProps.showIconBackground
                    ? selected
                      ? "bg-primary/10 text-primary p-2"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-muted p-2"
                    : selected
                      ? "text-primary"
                      : "text-muted-foreground"
                }
              `}
            >
              <IconWrapper
                icon={visualProps.primaryIcon}
                className={iconSizeClass}
                iconUrl={data.iconUrl}
              />
            </div>
          )}

          {/* Secondary Icons */}
          {visualProps.secondaryIcons.length > 0 && (
            <div className="absolute top-2 right-2 flex gap-1">
              {visualProps.secondaryIcons.map((icon: any, idx: number) => (
                <div
                  key={`secondary-icon-${idx}`}
                  className="p-1 bg-background/80 rounded"
                >
                  <IconWrapper
                    icon={icon}
                    className="w-3 h-3 text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Label */}
          {visualProps.showLabels && (
            <div className="text-center w-full">
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingLabel}
                  onChange={(e) => setEditingLabel(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={handleKeyDown}
                  className="text-sm font-medium text-foreground bg-transparent border-none outline-none text-center w-full px-1 py-0.5 rounded border-b-2 border-primary focus:border-primary"
                  maxLength={50}
                />
              ) : (
                <p
                  className="text-sm font-medium text-foreground cursor-pointer hover:text-primary-readable transition-colors truncate"
                  onDoubleClick={handleLabelDoubleClick}
                  title={`${processedLabel} - Double-click to edit`}
                  style={{ maxWidth: `${visualProps.width - 40}px` }}
                >
                  {processedLabel}
                </p>
              )}
              {visualProps.titleDescription && (
                <p className="text-xs text-muted-foreground mt-1">
                  {visualProps.titleDescription}
                </p>
              )}
              {/* Node Type Badge */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <div
                  className={`${nodeTypeColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                >
                  {nodeType.replace(/_/g, " ")}
                </div>
                {manifest?.manifest?.version && (
                  <span className="text-xs text-muted-foreground">
                    v{manifest.manifest.version}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Output Handles */}
        {outputHandles.map((handle, index) => (
          <Handle
            key={`output-${handle.id}`}
            id={handle.id}
            type="source"
            position={
              POSITION_MAP[handle.position as keyof typeof POSITION_MAP] ||
              Position.Right
            }
            className={`w-3 h-3 border-2 border-background ${
              EDGE_TYPE_COLORS[
                handle.edgeType as keyof typeof EDGE_TYPE_COLORS
              ] || EDGE_TYPE_COLORS.default
            }`}
            style={{
              top: getHandlePosition(
                handle.position,
                index,
                outputHandles.length
              ).top,
              left: getHandlePosition(
                handle.position,
                index,
                outputHandles.length
              ).left,
              right: getHandlePosition(
                handle.position,
                index,
                outputHandles.length
              ).right,
              bottom: getHandlePosition(
                handle.position,
                index,
                outputHandles.length
              ).bottom,
            }}
          />
        ))}
      </div>
    </TNode>
  );
}
