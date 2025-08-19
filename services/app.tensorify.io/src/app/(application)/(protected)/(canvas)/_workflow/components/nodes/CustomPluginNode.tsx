"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { type NodeProps } from "@xyflow/react";
import * as LucideIcons from "lucide-react";
import TNode from "./TNode/TNode";
import { type WorkflowNode } from "../../store/workflowStore";
import useWorkflowStore, { addRouteLevel } from "../../store/workflowStore";
import useAppStore from "@/app/_store/store";
import CustomHandle from "./handles/CustomHandle";
import { useHandleValidation } from "./handles/useHandleValidation";
import {
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";
import { useUIEngine } from "@workflow/engine";
import {
  AlertCircle,
  Plus,
  X,
  Settings as SettingsIcon,
  Grip,
} from "lucide-react";
import { useDragDrop } from "../../context/DragDropContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";

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
  const [hasError, setHasError] = useState(false);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodesInStore = useWorkflowStore((state) => state.nodes);
  const setRoute = useWorkflowStore((state) => state.setRoute);
  const openNodeSettingsDialog = useWorkflowStore(
    (state) => state.openNodeSettingsDialog
  );
  const pluginManifests = useAppStore((state) => state.pluginManifests);
  const { isConnectionValid, validateNodeInputs } = useHandleValidation();
  const engine = useUIEngine();
  const { draggedNodeType, onDropSuccess } = useDragDrop();

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
  // Priority: data.visualConfig > manifest.visual > defaults
  const visualProps = useMemo(() => {
    // Get base defaults
    const defaults = {
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

    // Get manifest visual config (if available)
    const fc = (manifest?.manifest as any)?.frontendConfigs;
    const manifestVisual = (fc?.visual ||
      (manifest?.manifest as any)?.visual) as any;
    const manifestSize = manifestVisual?.size || {};
    const manifestIcons = manifestVisual?.icons || {};
    const manifestLabels = manifestVisual?.labels || {};
    const manifestPadding = manifestVisual?.padding || {};
    const manifestStyling = manifestVisual?.styling || {};

    // Get user visual config from node data (this takes precedence)
    const userVisual = data.visualConfig || {};
    const userSize = userVisual.size || {};
    const userIcons = userVisual.icons || {};
    const userLabels = userVisual.labels || {};
    const userPadding = userVisual.padding || {};
    const userStyling = userVisual.styling || {};

    // Merge configurations: user config > manifest config > defaults
    return {
      // Container type (direct property)
      containerType: (
        userVisual.containerType ||
        manifestVisual?.containerType ||
        defaults.containerType
      ).toLowerCase(),

      // Size properties
      width: userSize.width ?? manifestSize.width ?? defaults.width,
      height: userSize.height ?? manifestSize.height ?? defaults.height,
      minWidth: userSize.minWidth ?? manifestSize.minWidth,
      minHeight: userSize.minHeight ?? manifestSize.minHeight,
      maxWidth: userSize.maxWidth ?? manifestSize.maxWidth,
      maxHeight: userSize.maxHeight ?? manifestSize.maxHeight,
      aspectRatio: userSize.aspectRatio ?? manifestSize.aspectRatio,

      // Icon properties - merge user config with manifest
      primaryIcon:
        userIcons.primaryType && userIcons.primaryValue
          ? { type: userIcons.primaryType, value: userIcons.primaryValue }
          : manifestIcons.primary || defaults.primaryIcon,
      secondaryIcons: manifestIcons.secondary || defaults.secondaryIcons,
      iconSize:
        userIcons.iconSize ?? manifestIcons.iconSize ?? defaults.iconSize,
      showIconBackground:
        userIcons.showIconBackground ??
        manifestIcons.showIconBackground ??
        defaults.showIconBackground,

      // Label properties
      title:
        userLabels.title ??
        manifestLabels.title ??
        data.label ??
        defaults.title,
      titleDescription:
        userLabels.titleDescription ??
        manifestLabels.titleDescription ??
        defaults.titleDescription,
      showLabels:
        userLabels.showLabels ??
        manifestLabels.showLabels ??
        defaults.showLabels,
      labelPosition:
        userLabels.labelPosition ??
        manifestLabels.labelPosition ??
        defaults.labelPosition,
      dynamicLabelTemplate:
        userLabels.dynamicLabelTemplate ??
        manifestLabels.dynamicLabelTemplate ??
        defaults.dynamicLabelTemplate,

      // Padding properties
      innerPadding:
        userPadding.inner ?? manifestPadding.inner ?? defaults.innerPadding,
      outerPadding:
        userPadding.outer ?? manifestPadding.outer ?? defaults.outerPadding,
      extraPadding:
        userPadding.extraPadding ??
        manifestPadding.extraPadding ??
        defaults.extraPadding,

      // Styling properties
      borderWidth:
        userStyling.borderWidth ??
        manifestStyling.borderWidth ??
        defaults.borderWidth,
      shadowLevel:
        userStyling.shadowLevel ??
        manifestStyling.shadowLevel ??
        defaults.shadowLevel,
      borderRadius:
        userStyling.borderRadius ??
        manifestStyling.borderRadius ??
        defaults.borderRadius,
      borderColor:
        userStyling.borderColor ??
        manifestStyling.borderColor ??
        defaults.borderColor,
      backgroundColor:
        userStyling.backgroundColor ??
        manifestStyling.backgroundColor ??
        defaults.backgroundColor,
      theme: userStyling.theme ?? manifestStyling.theme ?? defaults.theme,
    };
  }, [manifest, data.label, data.visualConfig, pluginManifests]);

  // Debug visual props changes
  // React.useEffect(() => {
  //   console.log(
  //     `🔄 Node ${id}: ${visualProps.width}x${visualProps.height}, container: ${visualProps.containerType}`
  //   );
  // }, [visualProps, id]);

  // Extract handle configurations with proper typing and ensure unique IDs
  const { inputHandles, outputHandles } = useMemo((): {
    inputHandles: ExtendedInputHandle[];
    outputHandles: ExtendedOutputHandle[];
  } => {
    if (!manifest?.manifest) {
      return { inputHandles: [], outputHandles: [] };
    }

    // Support contracts shape (frontendConfigs) and legacy
    const fc = (manifest.manifest as any).frontendConfigs;

    const inputHandles: ExtendedInputHandle[] =
      (
        (fc?.inputHandles ||
          (manifest.manifest as any).inputHandles) as InputHandle[]
      )?.map((handle, index) => ({
        ...handle,
        uniqueKey: `${handle.id}-${index}-${crypto.randomUUID().slice(0, 8)}`,
      })) || [];

    const outputHandles: ExtendedOutputHandle[] =
      (
        (fc?.outputHandles ||
          (manifest.manifest as any).outputHandles) as OutputHandle[]
      )?.map((handle, index) => ({
        ...handle,
        uniqueKey: `${handle.id}-${index}-${crypto.randomUUID().slice(0, 8)}`,
      })) || [];

    return { inputHandles, outputHandles };
  }, [manifest]);

  // Validate node inputs
  const inputValidationResults = useMemo(() => {
    return validateNodeInputs(id, inputHandles, data);
  }, [validateNodeInputs, id, inputHandles, data]);

  // Process dynamic label template with placeholder replacement
  const processedDynamicLabel = useMemo(() => {
    // If no dynamic template is available, return null
    if (!visualProps.dynamicLabelTemplate || !data) {
      return null;
    }

    // Start with the dynamic template
    let label = visualProps.dynamicLabelTemplate;

    // Debug logging (can be removed in production)
    // console.log(`🔄 Processing dynamic label for node ${id}:`);
    // console.log(`  Template: "${label}"`);
    // console.log(`  Node data:`, data);
    // console.log(`  Settings:`, data.settings);
    // console.log(`  Plugin Settings:`, data.pluginSettings);

    // Helper function to safely convert values to strings
    const formatValue = (value: any): string => {
      if (value === null || value === undefined) {
        return "";
      }
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      }
      return String(value);
    };

    // First, try to replace from top-level data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (label.includes(placeholder)) {
        // console.log(`  ✅ Replacing {${key}} with "${value}" from top-level data`);
        label = label.replace(
          new RegExp(`\\{${key}\\}`, "g"),
          formatValue(value)
        );
      }
    });

    // Then, try to replace from settings data (if it exists)
    if (data.settings && typeof data.settings === "object") {
      Object.entries(data.settings as Record<string, any>).forEach(
        ([key, value]) => {
          const placeholder = `{${key}}`;
          if (label.includes(placeholder)) {
            // console.log(`  ✅ Replacing {${key}} with "${value}" from settings`);
            label = label.replace(
              new RegExp(`\\{${key}\\}`, "g"),
              formatValue(value)
            );
          }
        }
      );
    }

    // Also try to replace from pluginSettings data (if it exists)
    if (data.pluginSettings && typeof data.pluginSettings === "object") {
      Object.entries(data.pluginSettings as Record<string, any>).forEach(
        ([key, value]) => {
          const placeholder = `{${key}}`;
          if (label.includes(placeholder)) {
            // console.log(`  ✅ Replacing {${key}} with "${value}" from pluginSettings`);
            label = label.replace(
              new RegExp(`\\{${key}\\}`, "g"),
              formatValue(value)
            );
          }
        }
      );
    }

    // console.log(`  Final dynamic label: "${label}"`);
    return label;
  }, [visualProps.dynamicLabelTemplate, visualProps.title, data, id]);

  // Inline label editing is disabled; use the Info tab to edit the label

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
      const fc = (manifest?.manifest as any)?.frontendConfigs;
      const type =
        (manifest?.manifest as any)?.pluginType ||
        (fc?.nodeType as any) ||
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

  // Sequence-specific helpers
  const isSequence = nodeType === "sequence";
  const fcSeq = useMemo(() => {
    try {
      return (manifest?.manifest as any)?.frontendConfigs?.sequence || null;
    } catch {
      return null;
    }
  }, [manifest]);
  const allowedItemType: string | null = fcSeq?.allowedItemType || null;
  const sequenceItems: any[] = (data as any)?.sequenceItems || [];
  const sequenceConfig: any = (data as any)?.sequenceConfig || {};
  const containerRef = useRef<HTMLDivElement | null>(null);
  const droppedInContainerRef = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const addSequenceItem = (slug: string) => {
    if (!slug) return;
    // Optional: enforce allowed item type using loaded manifests if available
    try {
      if (allowedItemType) {
        let nodeType: string | undefined;

        // Handle native CustomCodeNode
        if (slug === "@tensorify/core/CustomCodeNode") {
          nodeType = "function";
        } else {
          // Handle plugin nodes
          const store = useAppStore.getState();
          const pm = store.pluginManifests?.find(
            (p: any) => p.slug === slug || p.id === slug
          );
          nodeType =
            (pm?.manifest as any)?.pluginType ||
            (pm?.manifest as any)?.frontendConfigs?.nodeType;
        }

        if (
          nodeType &&
          String(nodeType).toLowerCase() !== String(allowedItemType)
        ) {
          return; // reject silently for now
        }
      }
    } catch {}
    const next = [...sequenceItems, { slug }];
    updateNodeData(id, {
      sequenceItems: next,
      pluginSettings: {
        ...(data as any)?.pluginSettings,
        itemsCount: next.length,
      },
    });
    onDropSuccess();
  };

  const handleDropIntoSequence = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    droppedInContainerRef.current = true;
    const draggedRow = e.dataTransfer.getData("application/sequence-index");
    if (draggedRow !== "") {
      // Move dragged row to end
      const from = parseInt(draggedRow, 10);
      if (!isNaN(from) && from >= 0 && from < sequenceItems.length) {
        const to = sequenceItems.length - 1;
        const next = moveItem(sequenceItems, from, to);
        updateNodeData(id, { sequenceItems: next });
      }
      setDraggingIndex(null);
      setOverIndex(null);
      return;
    }
    // Otherwise treat as external plugin slug drop
    const dt = e.dataTransfer.getData("application/reactflow");
    const slug = draggedNodeType || dt;
    if (!slug) return;
    // Create a real canvas node for this slug
    try {
      const parentNode = nodesInStore.find((n) => n.id === id);
      const parentRoute = parentNode?.route || "/";
      const childRoute = addRouteLevel(parentRoute, `sequence-${id}`);
      const childId = crypto.randomUUID();
      // Resolve label and settings from manifest or defaults for native nodes
      let childLabel = slug.split("/").pop() || "item";
      const defaultSettings: Record<string, any> = {};

      if (slug === "@tensorify/core/CustomCodeNode") {
        // Handle native CustomCodeNode
        childLabel = "Custom Code";
        // CustomCodeNode doesn't need default settings from manifest
      } else {
        // Handle plugin nodes
        const manifest = pluginManifests.find((m) => m.slug === slug);
        const fc = (manifest?.manifest as any)?.frontendConfigs;
        const visual = (fc?.visual ||
          (manifest?.manifest as any)?.visual) as any;
        childLabel =
          visual?.labels?.title ||
          (manifest?.manifest as any)?.name ||
          childLabel;

        // Build default settings for the child from its manifest
        const settingsFields = (fc?.settingsFields ||
          (manifest?.manifest as any)?.settingsFields) as any[] | undefined;
        if (settingsFields) {
          settingsFields.forEach((field: any) => {
            if (field.defaultValue !== undefined) {
              defaultSettings[field.key] = field.defaultValue;
            }
          });
        }
      }

      addNode({
        id: childId,
        type: slug,
        position: {
          x: (parentNode?.position?.x || 0) + 40,
          y: (parentNode?.position?.y || 0) + 80 * (sequenceItems.length + 1),
        },
        route: childRoute,
        version: "1.0.0",
        data: {
          label: childLabel,
          pluginId: slug,
          pluginSettings: defaultSettings,
        },
        selected: false,
        dragging: false,
      } as any);

      // Add to sequence items with reference & name
      const next = [
        ...sequenceItems,
        { slug, nodeId: childId, name: childLabel },
      ];
      updateNodeData(id, {
        sequenceItems: next,
        pluginSettings: {
          ...(data as any)?.pluginSettings,
          itemsCount: next.length,
        },
      });
    } finally {
      onDropSuccess();
    }
  };

  const removeSequenceItem = (index: number) => {
    const next = sequenceItems.filter((_, i) => i !== index);
    updateNodeData(id, {
      sequenceItems: next,
      pluginSettings: {
        ...(data as any)?.pluginSettings,
        itemsCount: next.length,
      },
    });
  };

  const moveItem = (arr: any[], from: number, to: number) => {
    const copy = arr.slice();
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  };

  const onRowDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.stopPropagation();
    setDraggingIndex(index);
    droppedInContainerRef.current = false;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/sequence-index", String(index));
    // add a plain text as well for compatibility
    e.dataTransfer.setData("text/plain", String(index));
  };

  const onRowDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingIndex !== null && index !== overIndex) {
      setOverIndex(index);
    }
  };

  const onRowDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    droppedInContainerRef.current = true;
    const fromStr = e.dataTransfer.getData("application/sequence-index");
    const from = parseInt(fromStr, 10);
    if (!isNaN(from) && from >= 0 && from < sequenceItems.length) {
      const next = moveItem(sequenceItems, from, index);
      updateNodeData(id, { sequenceItems: next });
    }
    setDraggingIndex(null);
    setOverIndex(null);
  };

  const onRowDragEnd = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    // If not dropped inside the container, treat as removal
    if (!droppedInContainerRef.current && draggingIndex !== null) {
      removeSequenceItem(draggingIndex);
    }
    setDraggingIndex(null);
    setOverIndex(null);
    droppedInContainerRef.current = false;
  };

  const clearSequenceItems = () => {
    updateNodeData(id, {
      sequenceItems: [],
      pluginSettings: {
        ...(data as any)?.pluginSettings,
        itemsCount: 0,
      },
    });
  };

  const updateSequenceConfig = (key: string, value: any) => {
    const next = { ...(sequenceConfig || {}), [key]: value };
    updateNodeData(id, { sequenceConfig: next });
  };

  // UIEngine-driven validation state for prev/next
  const invalidPrevNext = useMemo(() => {
    const state = engine?.nodes[id];
    if (!state) return { missingPrev: false, missingNext: false };
    return { missingPrev: state.missingPrev, missingNext: state.missingNext };
  }, [engine, id]);

  // UIEngine-driven export error state
  const nodeErrorState = useMemo(() => {
    const state = engine?.nodes[id];
    if (!state) return { hasExportError: false, isFlashingError: false };
    return {
      hasExportError: state.hasExportError || false,
      isFlashingError: state.isTransientError || false,
    };
  }, [engine, id]);

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

  // Theme-aware background color - only for explicit backgroundColor
  const getBackgroundColor = useMemo(() => {
    // If explicit backgroundColor is set, use it
    if (visualProps.backgroundColor) {
      return visualProps.backgroundColor;
    }

    // Otherwise, use bg-card class instead of inline styles
    return undefined;
  }, [visualProps.backgroundColor]);

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
          bg-card
          ${containerStyle}
          ${shadowClass}
          ${selected ? "shadow-primary/20" : ""}
          ${visualProps.extraPadding ? "p-4" : ""}
          ${
            nodeErrorState.hasExportError
              ? nodeErrorState.isFlashingError
                ? "border-4 border-destructive animate-pulse shadow-lg shadow-destructive/50"
                : "border-4 border-destructive shadow-lg shadow-destructive/30"
              : "border border-border"
          }
        `}
        style={{
          width: `${visualProps.width}px`,
          height: isSequence ? undefined : `${visualProps.height}px`,
          minWidth: visualProps.minWidth
            ? `${visualProps.minWidth}px`
            : undefined,
          minHeight: isSequence
            ? undefined
            : visualProps.minHeight
              ? `${visualProps.minHeight}px`
              : undefined,
          maxWidth: visualProps.maxWidth
            ? `${visualProps.maxWidth}px`
            : undefined,
          maxHeight: isSequence
            ? undefined
            : visualProps.maxHeight
              ? `${visualProps.maxHeight}px`
              : undefined,
          borderWidth: nodeErrorState.hasExportError
            ? "4px"
            : `${visualProps.borderWidth}px`,
          borderRadius:
            visualProps.containerType === "circle"
              ? "50%"
              : visualProps.containerType === "left-round"
                ? undefined // Let CSS classes handle left-round styling
                : `${visualProps.borderRadius}px`,
          borderColor: nodeErrorState.hasExportError
            ? "var(--destructive)"
            : invalidPrevNext.missingPrev || invalidPrevNext.missingNext
              ? "var(--destructive)"
              : selected
                ? "var(--primary)"
                : visualProps.borderColor || "var(--border)",
          backgroundColor: getBackgroundColor,
          padding: `${visualProps.outerPadding}px`,
        }}
      >
        {(invalidPrevNext.missingPrev || invalidPrevNext.missingNext) && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md cursor-help"
                  title={
                    invalidPrevNext.missingPrev && invalidPrevNext.missingNext
                      ? "Connect prev and next"
                      : invalidPrevNext.missingPrev
                        ? "Connect prev"
                        : "Connect next"
                  }
                  aria-label="Node connection issue"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  {invalidPrevNext.missingPrev &&
                    invalidPrevNext.missingNext && (
                      <>
                        <p className="font-medium">Missing connections</p>
                        <ul className="list-disc pl-4">
                          <li>Connect an incoming edge to the "prev" handle</li>
                          <li>
                            Connect an outgoing edge from the "next" handle
                          </li>
                        </ul>
                      </>
                    )}
                  {invalidPrevNext.missingPrev &&
                    !invalidPrevNext.missingNext && (
                      <>
                        <p className="font-medium">Missing "prev" connection</p>
                        <p>Connect an incoming edge to the "prev" handle.</p>
                      </>
                    )}
                  {!invalidPrevNext.missingPrev &&
                    invalidPrevNext.missingNext && (
                      <>
                        <p className="font-medium">Missing "next" connection</p>
                        <p>Connect an outgoing edge from the "next" handle.</p>
                      </>
                    )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
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
          onDragOver={(e) => {
            if (isSequence) {
              e.preventDefault();
            }
          }}
          onDrop={(e) => {
            if (isSequence) handleDropIntoSequence(e);
          }}
        >
          {/* Primary Icon (hide for sequence to declutter) */}
          {!isSequence && visualProps.primaryIcon && (
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

          {/* Sequence container UI (minimal: title → rows → drag target) */}
          {isSequence && (
            <div className="w-full flex flex-col gap-2">
              <p className="text-sm font-medium text-center">
                {visualProps.title}
              </p>
              <div
                className="w-full min-h-[64px] rounded-lg border border-dashed border-input bg-accent p-3 flex flex-col gap-2 overflow-y-auto relative nodrag nowheel"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropIntoSequence}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              >
                {sequenceItems.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic">
                    Empty
                  </div>
                ) : (
                  sequenceItems.map((it, idx) => {
                    // Check if this sequence child has export errors
                    const childNodeId = it.nodeId;
                    const childHasError =
                      childNodeId &&
                      engine?.nodes?.[childNodeId]?.hasExportError;

                    const sequenceRowContent = (
                      <div
                        key={`seq-${idx}`}
                        className={`w-full flex items-center justify-between gap-2 pl-3 pr-4 py-2 rounded-md bg-background text-xs border border-input/80 shadow-sm overflow-hidden transition-colors ${
                          childHasError
                            ? "ring-4 ring-destructive bg-destructive/10 "
                            : overIndex === idx
                              ? "ring-primary/60"
                              : "hover:ring-primary/50"
                        }`}
                        draggable
                        onDragStart={(e) => onRowDragStart(e, idx)}
                        onDragOver={(e) => onRowDragOver(e, idx)}
                        onDrop={(e) => onRowDrop(e, idx)}
                        onDragEnd={(e) => onRowDragEnd(e, idx)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        <input
                          className="flex-1 min-w-0 bg-transparent outline-none border-none text-foreground truncate nodrag nowheel"
                          value={String(it.name || "item")}
                          onChange={(e) => {
                            const next = sequenceItems.slice();
                            next[idx] = { ...next[idx], name: e.target.value };
                            updateNodeData(id, { sequenceItems: next });
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent"
                            title="Settings"
                            aria-label="Settings"
                            onClick={() => {
                              const row = sequenceItems[idx];
                              if (row?.nodeId) {
                                openNodeSettingsDialog(row.nodeId);
                              }
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <SettingsIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-sm text-muted-foreground hover:bg-accent hover:text-destructive"
                            title="Remove"
                            aria-label="Remove"
                            onClick={() => removeSequenceItem(idx)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );

                    // Wrap with tooltip if there's an error
                    if (childHasError) {
                      return (
                        <TooltipProvider key={`seq-${idx}`} delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {sequenceRowContent}
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-sm p-4 bg-background border border-destructive/20 shadow-2xl ring-4 ring-destructive/20"
                              sideOffset={8}
                            >
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-destructive/10 rounded-md">
                                    <AlertCircle className="w-3 h-3 text-destructive" />
                                  </div>
                                  <div className="font-semibold text-sm text-foreground">
                                    Sequence Item Error
                                  </div>
                                </div>
                                <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                                  <div className="text-xs font-mono text-destructive leading-relaxed">
                                    {engine?.nodes?.[childNodeId]
                                      ?.exportErrorMessage ||
                                      "This item has an error"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-border">
                                  <div className="p-1 bg-muted rounded">
                                    <span className="text-xs">⚙️</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Click settings button to fix
                                  </span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return sequenceRowContent;
                  })
                )}
                <div
                  className="w-full h-9 rounded-md border border-dashed border-input bg-accent flex items-center justify-center text-[11px] text-muted-foreground mt-1 select-none nodrag nowheel"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <Grip className="w-3 h-3 mr-1" /> Drag Here
                </div>
              </div>
            </div>
          )}

          {/* Label (hide for sequence – title already shown above) */}
          {!isSequence && visualProps.showLabels && (
            <div className="text-center w-full">
              <div className="text-center">
                {/* Main Title (non-editable – edit in Info tab) */}
                <p
                  className={`text-sm font-medium ${getTextClasses.primary} ${getTextClasses.primaryHover} transition-colors text-center`}
                  title={`${visualProps.title}`}
                  style={{
                    maxWidth: `${visualProps.width - 40}px`,
                    margin: "0 auto",
                  }}
                >
                  {visualProps.title}
                </p>
                {/* Dynamic Label below main title */}
                {processedDynamicLabel && (
                  <p
                    className={`text-xs ${getTextClasses.secondary} mt-1 font-mono text-center`}
                    style={{
                      maxWidth: `${visualProps.width - 40}px`,
                      margin: "0 auto",
                    }}
                  >
                    {processedDynamicLabel}
                  </p>
                )}
              </div>
              {visualProps.titleDescription && (
                <p
                  className={`text-xs ${getTextClasses.secondary} mt-1 text-center`}
                >
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
