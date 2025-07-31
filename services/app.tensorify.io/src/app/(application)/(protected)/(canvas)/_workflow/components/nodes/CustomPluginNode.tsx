"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { type NodeProps } from "@xyflow/react";
import * as LucideIcons from "lucide-react";
import TNode from "./TNode/TNode";
import { type WorkflowNode } from "../../store/workflowStore";
import useWorkflowStore from "../../store/workflowStore";
import useStore from "@/app/_store/store";
import CustomHandle from "./handles/CustomHandle";
import { useHandleValidation } from "./handles/useHandleValidation";
import {
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";

// Extended handle types with unique keys for React rendering
type ExtendedInputHandle = InputHandle & { uniqueKey: string };
type ExtendedOutputHandle = OutputHandle & { uniqueKey: string };

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

// Legacy position mapping - now handled in CustomHandle component
// Kept for backward compatibility with any remaining usage

// Container type styling
const CONTAINER_STYLES = {
  default: "rounded-lg",
  box: "rounded-xl",
  circle: "rounded-full aspect-square",
  "left-round": "rounded-l-full rounded-r-lg",
};

// Legacy edge type colors - now handled in CustomHandle component
// Kept for backward compatibility

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
    // Parse and sanitize SVG to ensure it respects size constraints
    const sanitizedSvg = iconValue.replace(
      /<svg([^>]*)>/i,
      (match: string, attributes: string) => {
        // Remove existing width/height attributes and add responsive ones
        const cleanAttributes = attributes
          .replace(/\s*(width|height)\s*=\s*["'][^"']*["']/gi, "")
          .trim();
        return `<svg${cleanAttributes ? " " + cleanAttributes : ""} width="100%" height="100%" viewBox="0 0 24 24">`;
      }
    );

    return (
      <div
        className={`${className} flex items-center justify-center overflow-hidden`}
        style={{ aspectRatio: "1/1" }}
        dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
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

// Handle positioning is now managed by CustomHandle component
// This function has been replaced by calculateHandlePosition in CustomHandle.tsx

export default function CustomPluginNode(props: NodeProps<WorkflowNode>) {
  const { data, selected, id } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label || "Plugin Node");
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const pluginManifests = useStore((state) => state.pluginManifests);
  const { isConnectionValid, validateNodeInputs } = useHandleValidation();

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

  // Extract handle configurations with proper typing and ensure unique IDs
  const { inputHandles, outputHandles } = useMemo((): {
    inputHandles: ExtendedInputHandle[];
    outputHandles: ExtendedOutputHandle[];
  } => {
    if (!manifest?.manifest) {
      return { inputHandles: [], outputHandles: [] };
    }

    // Ensure unique IDs for handles to prevent React key conflicts
    const inputHandles: ExtendedInputHandle[] =
      (manifest.manifest.inputHandles as InputHandle[])?.map(
        (handle, index) => ({
          ...handle,
          uniqueKey: `${handle.id}-${index}-${crypto.randomUUID().slice(0, 8)}`,
        })
      ) || [];

    const outputHandles: ExtendedOutputHandle[] =
      (manifest.manifest.outputHandles as OutputHandle[])?.map(
        (handle, index) => ({
          ...handle,
          uniqueKey: `${handle.id}-${index}-${crypto.randomUUID().slice(0, 8)}`,
        })
      ) || [];

    return { inputHandles, outputHandles };
  }, [manifest]);

  // Validate node inputs
  const inputValidationResults = useMemo(() => {
    return validateNodeInputs(id, inputHandles, data);
  }, [validateNodeInputs, id, inputHandles, data]);

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

  // Theme-aware text styling
  const getTextClasses = useMemo(() => {
    const isDarkTheme = visualProps.theme === "dark";

    return {
      primary: isDarkTheme ? "text-white" : "text-foreground",
      secondary: isDarkTheme ? "text-gray-300" : "text-muted-foreground",
      primaryHover: isDarkTheme
        ? "hover:text-gray-100"
        : "hover:text-primary-readable",
    };
  }, [visualProps.theme]);

  // Theme-aware icon styling
  const getIconClasses = useMemo(() => {
    const isDarkTheme = visualProps.theme === "dark";

    return {
      primary: isDarkTheme ? "text-gray-200" : "text-muted-foreground",
      primarySelected: "text-primary",
      secondary: isDarkTheme ? "text-gray-300" : "text-muted-foreground",
      background: isDarkTheme ? "bg-gray-800/50" : "bg-muted/50",
      backgroundHover: isDarkTheme
        ? "group-hover:bg-gray-700/50"
        : "group-hover:bg-muted",
      backgroundSelected: "bg-primary/10",
      secondaryBackground: isDarkTheme ? "bg-gray-800/80" : "bg-background/80",
    };
  }, [visualProps.theme]);

  // Theme-aware background color
  const getBackgroundColor = useMemo(() => {
    const isDarkTheme = visualProps.theme === "dark";

    // If explicit backgroundColor is set, use it
    if (visualProps.backgroundColor) {
      return visualProps.backgroundColor;
    }

    // Otherwise, provide theme-appropriate defaults
    return isDarkTheme ? "#1f2937" : "#ffffff"; // gray-800 for dark, white for light
  }, [visualProps.theme, visualProps.backgroundColor]);

  // Calculate secondary icon position based on IconPosition
  const calculateIconPosition = (position: string = "right"): string => {
    switch (position) {
      case "top":
        return "absolute top-2 left-1/2 transform -translate-x-1/2";
      case "bottom":
        return "absolute bottom-2 left-1/2 transform -translate-x-1/2";
      case "left":
        return "absolute top-1/2 left-2 transform -translate-y-1/2";
      case "right":
        return "absolute top-1/2 right-2 transform -translate-y-1/2";
      case "center":
        return "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";
      default:
        return "absolute top-2 right-2"; // Fallback to original position
    }
  };

  // Handle error state
  if (hasError || !manifest) {
    const isDarkTheme = visualProps.theme === "dark";
    return (
      <TNode {...props}>
        <div
          className="rounded-lg p-4 min-w-[180px] min-h-[80px] border-2"
          style={{
            backgroundColor: isDarkTheme ? "#7f1d1d" : "#fef2f2", // red-900 for dark, red-50 for light
            borderColor: isDarkTheme ? "#f87171" : "#ef4444", // red-400 for dark, red-500 for light
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <LucideIcons.AlertCircle
              className={`w-6 h-6 ${
                isDarkTheme ? "text-red-400" : "text-red-500"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                isDarkTheme ? "text-red-200" : "text-red-700"
              }`}
            >
              Plugin Error
            </p>
            <p
              className={`text-xs ${
                isDarkTheme ? "text-red-300" : "text-red-600"
              }`}
            >
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
          transition-all duration-200
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
          backgroundColor: getBackgroundColor,
          padding: `${visualProps.outerPadding}px`,
        }}
      >
        {/* Input Handles */}
        {inputHandles.map((handle, index) => (
          <CustomHandle
            key={`input-${handle.uniqueKey}`}
            handle={handle}
            type="target"
            nodeId={id}
            index={index}
            totalHandles={inputHandles.length}
            borderWidth={visualProps.borderWidth}
            isValidConnection={isConnectionValid}
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
                      ? `${getIconClasses.backgroundSelected} ${getIconClasses.primarySelected} p-2`
                      : `${getIconClasses.background} ${getIconClasses.primary} ${getIconClasses.backgroundHover} p-2`
                    : selected
                      ? getIconClasses.primarySelected
                      : getIconClasses.primary
                }
              `}
            >
              <IconWrapper
                icon={visualProps.primaryIcon}
                className={iconSizeClass}
                iconUrl={data.iconUrl as string | undefined}
              />
            </div>
          )}

          {/* Secondary Icons */}
          {visualProps.secondaryIcons.length > 0 &&
            visualProps.secondaryIcons.map((icon: any, idx: number) => (
              <div
                key={`secondary-icon-${idx}`}
                className={calculateIconPosition(icon.position)}
              >
                <div
                  className={`p-1 rounded ${getIconClasses.secondaryBackground}`}
                >
                  <IconWrapper
                    icon={icon}
                    className={`w-3 h-3 ${getIconClasses.secondary}`}
                  />
                </div>
              </div>
            ))}

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
                  className={`text-sm font-medium ${getTextClasses.primary} bg-transparent border-none outline-none text-center w-full px-1 py-0.5 rounded border-b-2 border-primary focus:border-primary`}
                  maxLength={50}
                />
              ) : (
                <p
                  className={`text-sm font-medium ${getTextClasses.primary} cursor-pointer ${getTextClasses.primaryHover} transition-colors truncate`}
                  onDoubleClick={handleLabelDoubleClick}
                  title={`${processedLabel} - Double-click to edit`}
                  style={{ maxWidth: `${visualProps.width - 40}px` }}
                >
                  {processedLabel}
                </p>
              )}
              {visualProps.titleDescription && (
                <p className={`text-xs ${getTextClasses.secondary} mt-1`}>
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
                {manifest?.manifest?.version ? (
                  <span className={`text-xs ${getTextClasses.secondary}`}>
                    v
                    {typeof manifest.manifest.version === "string"
                      ? (manifest.manifest.version as string)
                      : String(manifest.manifest.version)}
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Output Handles */}
        {outputHandles.map((handle, index) => (
          <CustomHandle
            key={`output-${handle.uniqueKey}`}
            handle={handle}
            type="source"
            nodeId={id}
            index={index}
            totalHandles={outputHandles.length}
            borderWidth={visualProps.borderWidth}
            isValidConnection={isConnectionValid}
          />
        ))}
      </div>
    </TNode>
  );
}
