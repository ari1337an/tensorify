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

// Position mapping for handles
const POSITION_MAP = {
  left: Position.Left,
  right: Position.Right,
  top: Position.Top,
  bottom: Position.Bottom,
};

// Get icon component by name with fallback
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

export default function CustomPluginNode(props: NodeProps<WorkflowNode>) {
  const { data, selected, id } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label || "Plugin Node");
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const pluginManifests = useStore((state) => state.pluginManifests);

  // Find the manifest for this plugin node
  const manifest = useMemo(() => {
    const pluginId = data.pluginId || id;
    return pluginManifests.find(
      (p) => p.slug === pluginId || p.id === pluginId
    );
  }, [pluginManifests, data.pluginId, id]);

  // Extract visual properties from manifest
  const visualProps = useMemo(() => {
    if (!manifest?.manifest) {
      return {
        width: 241,
        height: 140,
        primaryIcon: null,
        iconSize: "medium",
        showIconBackground: true,
        title: data.label || "Plugin",
        showLabels: true,
        labelPosition: "top",
        dynamicLabelTemplate: null,
        innerPadding: 16,
        outerPadding: 8,
        borderWidth: 2,
        shadowLevel: 1,
        borderRadius: 8,
        theme: "auto",
      };
    }

    const visual = (manifest.manifest.visual as any) || {};
    const size = visual.size || {};
    const icons = visual.icons || {};
    const labels = visual.labels || {};
    const padding = visual.padding || {};
    const styling = visual.styling || {};

    return {
      width: size.width || 241,
      height: size.height || 140,
      primaryIcon: icons.primary?.value || null,
      iconSize: icons.iconSize || "medium",
      showIconBackground: icons.showIconBackground !== false,
      title: labels.title || data.label || "Plugin",
      showLabels: labels.showLabels !== false,
      labelPosition: labels.labelPosition || "top",
      dynamicLabelTemplate: labels.dynamicLabelTemplate || null,
      innerPadding: padding.inner || 16,
      outerPadding: padding.outer || 8,
      borderWidth: styling.borderWidth || 2,
      shadowLevel: styling.shadowLevel || 1,
      borderRadius: styling.borderRadius || 8,
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

  const IconComponent = visualProps.primaryIcon
    ? getIconComponent(visualProps.primaryIcon)
    : null;
  const iconSizeClass =
    ICON_SIZE_MAP[visualProps.iconSize as keyof typeof ICON_SIZE_MAP] ||
    ICON_SIZE_MAP.medium;
  const shadowClass =
    SHADOW_LEVEL_MAP[
      visualProps.shadowLevel as keyof typeof SHADOW_LEVEL_MAP
    ] || SHADOW_LEVEL_MAP[1];

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-card transition-all duration-200
          ${shadowClass}
          ${selected ? "shadow-primary/20" : ""}
        `}
        style={{
          width: `${visualProps.width}px`,
          height: `${visualProps.height}px`,
          borderWidth: `${visualProps.borderWidth}px`,
          borderRadius: `${visualProps.borderRadius}px`,
          borderColor: selected ? "var(--primary)" : "var(--border)",
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
            className="w-3 h-3 bg-muted-foreground border-2 border-background"
            style={{
              top:
                handle.position === "left" || handle.position === "right"
                  ? `${((index + 1) / (inputHandles.length + 1)) * 100}%`
                  : undefined,
              left:
                handle.position === "top" || handle.position === "bottom"
                  ? `${((index + 1) / (inputHandles.length + 1)) * 100}%`
                  : undefined,
            }}
          />
        ))}

        <div
          className="flex flex-col items-center justify-center h-full space-y-2"
          style={{ padding: `${visualProps.innerPadding}px` }}
        >
          {/* Icon */}
          {IconComponent && (
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
              <IconComponent className={iconSizeClass} />
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
              {manifest?.manifest?.pluginType && (
                <p className="text-xs text-muted-foreground capitalize">
                  {(manifest.manifest.pluginType as string)
                    .toLowerCase()
                    .replace("_", " ")}
                </p>
              )}
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
            className="w-3 h-3 bg-muted-foreground border-2 border-background"
            style={{
              top:
                handle.position === "left" || handle.position === "right"
                  ? `${((index + 1) / (outputHandles.length + 1)) * 100}%`
                  : undefined,
              left:
                handle.position === "top" || handle.position === "bottom"
                  ? `${((index + 1) / (outputHandles.length + 1)) * 100}%`
                  : undefined,
            }}
          />
        ))}
      </div>
    </TNode>
  );
}
