"use client";

/**
 * CustomHandle Component - Clean n8n-inspired handle design
 *
 * Features:
 * - Ring/donut style handles: DEFAULT (16px, 5px border), CIRCLE_LG (20px, 8px border)
 * - Consistent gray color (#9ca3af) for all handle types
 * - 6 different view types: DEFAULT (ring), VERTICAL_BOX (auto-rotates 90° for top/bottom), CIRCLE_LG (large ring), DIAMOND, SQUARE, TRIANGLE (points in handle direction)
 * - ReactFlow 4-position system: maps 8-point visual positions to left/right/top/bottom
 * - Simple positioning: Only offset in handle direction (ReactFlow handles edge distribution)
 * - Hover effects with scale and brightness
 * - White hollow centers for ring handles
 * - Smart label positioning: labels adapt to handle position (left/right/top/bottom)
 * - No background labels - clean text on hover only
 * - No coloring or styling - completely clean and minimal
 */

import React, { forwardRef } from "react";
import { Handle as ReactFlowHandle, Position } from "@xyflow/react";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  HandleDataType,
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";
import useWorkflowStore, { NodeMode } from "../../../store/workflowStore";
import useAppStore from "@/app/_store/store";
import { HandleTooltip, useHandleShapeValidation } from "./HandleTooltip";

// Position mapping: 8-point visual system mapped to ReactFlow's 4 positions
// ReactFlow only supports left/right/top/bottom, so corner positions map to nearest edge
const REACTFLOW_POSITION_MAP: Record<HandlePosition, Position> = {
  [HandlePosition.LEFT]: Position.Left,
  [HandlePosition.RIGHT]: Position.Right,
  [HandlePosition.TOP]: Position.Top,
  [HandlePosition.BOTTOM]: Position.Bottom,
  [HandlePosition.TOP_LEFT]: Position.Left, // Corner → Left edge
  [HandlePosition.TOP_RIGHT]: Position.Right, // Corner → Right edge
  [HandlePosition.BOTTOM_LEFT]: Position.Left, // Corner → Left edge
  [HandlePosition.BOTTOM_RIGHT]: Position.Right, // Corner → Right edge
};

// Consistent gray color for all handle types
const HANDLE_COLOR = "#9ca3af";

/**
 * Determines if a handle is a variable handle (not prev/next workflow handle)
 */
const isVariableHandle = (handle: InputHandle | OutputHandle): boolean => {
  return handle.id !== "prev" && handle.id !== "next";
};

/**
 * Generates the enhanced label with receives/emits information and type
 */
const getEnhancedLabel = (
  handle: InputHandle | OutputHandle,
  type: "source" | "target",
  nodeId: string
): string => {
  const nodes = useWorkflowStore.getState().nodes;
  const node = nodes.find((n) => n.id === nodeId);

  // If no label, return empty
  if (!handle.label) return "";

  // If not a variable handle, return original label
  if (!isVariableHandle(handle)) {
    return handle.label;
  }

  // For variable handles, add receives/emits information with type
  const nodeMode = (node?.data as any)?.nodeMode || NodeMode.WORKFLOW;

  if (nodeMode === NodeMode.VARIABLE_PROVIDER && type === "source") {
    // Variable provider nodes emit data - get type from emits config
    const nodeData = node?.data as any;
    let emitsConfig;
    let variable;

    // Check if this is a native node or plugin node
    if (
      node?.type === "@tensorify/core/CustomCodeNode" ||
      node?.type === "@tensorify/core/ClassNode"
    ) {
      // Native node - get emits from node data
      emitsConfig = nodeData?.emitsConfig;
      variable = emitsConfig?.variables?.find(
        (v: any) => v.value === handle.id
      );
    } else {
      // Plugin node - get emits from plugin manifest
      const pluginManifests = useAppStore.getState().pluginManifests;
      const pluginId = nodeData?.pluginId || node?.id;
      const manifest = pluginManifests.find(
        (p) => p.slug === pluginId || p.id === pluginId
      );
      emitsConfig = manifest?.manifest?.emits;
      variable = emitsConfig?.variables?.find(
        (v: any) => v.value === handle.id
      );
    }

    const variableType = variable?.type;

    if (variableType) {
      // Convert enum value to uppercase (e.g., "model_layer" -> "MODEL_LAYER")
      const typeDisplay =
        typeof variableType === "string"
          ? variableType.toUpperCase()
          : variableType;
      return `${handle.label} (emits: ${typeDisplay})`;
    }

    return `${handle.label} (emits)`;
  } else if (nodeMode === NodeMode.WORKFLOW && type === "target") {
    // Workflow nodes receive data - get type from handle dataType
    const dataType = handle.dataType;
    if (dataType && dataType !== "any") {
      return `${handle.label} (receives: ${dataType.toUpperCase()})`;
    }

    return `${handle.label} (receives)`;
  }

  // Fallback for other cases
  const action = nodeMode === NodeMode.VARIABLE_PROVIDER ? "emits" : "receives";
  return `${handle.label} (${action})`;
};

interface CustomHandleProps {
  handle: InputHandle | OutputHandle;
  type: "source" | "target";
  nodeId: string;
  index: number;
  totalHandles: number;
  borderWidth?: number;
  onConnect?: (params: any) => void;
  isValidConnection?: (connection: any) => boolean;
}

// Calculate label position based on handle position (visual positioning for labels)
function calculateLabelPosition(position: HandlePosition): React.CSSProperties {
  return calculateLabelPositionWithMargin(position, 8);
}

// Calculate label position with custom margin
function calculateLabelPositionWithMargin(
  position: HandlePosition,
  margin: number
): React.CSSProperties {
  switch (position) {
    case HandlePosition.LEFT:
    case HandlePosition.TOP_LEFT:
    case HandlePosition.BOTTOM_LEFT:
      return {
        right: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        marginRight: `${margin}px`,
      };
    case HandlePosition.RIGHT:
    case HandlePosition.TOP_RIGHT:
    case HandlePosition.BOTTOM_RIGHT:
      return {
        left: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        marginLeft: `${margin}px`,
      };
    case HandlePosition.TOP:
      return {
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginBottom: `${margin}px`,
      };
    case HandlePosition.BOTTOM:
      return {
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        marginTop: `${margin}px`,
      };
    default:
      return {
        right: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        marginRight: `${margin}px`,
      };
  }
}

// Get handle view style as CSS properties with consistent gray color
function getHandleViewStyle(viewType: HandleViewType): React.CSSProperties {
  switch (viewType) {
    case HandleViewType.DEFAULT:
      // Ring handles are handled as special cases above
      return {};
    case HandleViewType.VERTICAL_BOX:
      // Vertical box handles are handled as special cases above
      return {};
    case HandleViewType.CIRCLE_LG:
      // Large circle handles are handled as special cases above
      return {};
    case HandleViewType.DIAMOND:
      return {
        width: "10px",
        height: "10px",
        transform: "rotate(45deg)",
        borderRadius: "0px",
      };
    case HandleViewType.SQUARE:
      return {
        width: "10px",
        height: "10px",
        borderRadius: "0px",
      };
    case HandleViewType.TRIANGLE:
      // Triangle handles use custom component above
      return {};
    default:
      return {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
      };
  }
}

// Get handle offset based on view type
function getHandleOffset(viewType: HandleViewType): number {
  switch (viewType) {
    case HandleViewType.CIRCLE_LG:
      return 1; // Larger offset for 24px diameter handle
    case HandleViewType.DIAMOND:
      return 5;
    case HandleViewType.SQUARE:
      return 1; // Medium offset for 10px handles
    case HandleViewType.VERTICAL_BOX:
      return 1; // Offset for 8px wide rectangular handle
    case HandleViewType.DEFAULT:
      return 1; // Offset for 16px diameter ring handle
    case HandleViewType.TRIANGLE:
      return 1; // Small offset for triangle
    default:
      return 1; // Minimal offset for other types
  }
}

function calculateHandlePosition(
  position: HandlePosition,
  index: number,
  totalHandles: number,
  viewType: HandleViewType = HandleViewType.DEFAULT,
  borderWidth: number = 0
): React.CSSProperties {
  const baseOffset = getHandleOffset(viewType);
  const handleOffset = baseOffset + borderWidth * 0.4; // Add border width to offset

  // Get the ReactFlow position (maps 8-point to 4-point)
  const reactFlowPosition = REACTFLOW_POSITION_MAP[position];

  // Calculate handle distribution for multiple handles
  const getDistributedPosition = (idx: number, total: number) => {
    // Single handle → center
    if (total <= 1) return 50;

    /*
     * Improved distribution algorithm
     * 1. Treat the available side (0-100%) as divided into (total + 1) equal slices.
     * 2. Place each handle in the center of its slice → ensures equal margins
     *    between the first/last handle and the edges as well as between handles.
     *    Position = ((idx + 1) / (total + 1)) * 100
     * 3. Clamp to a minimal margin so handles never touch absolute edges even
     *    when `total` is very large.
     */
    const MIN_MARGIN = 5; // percent – small buffer from the edge

    const raw = ((idx + 1) / (total + 1)) * 100; // evenly spaced

    // Ensure we keep a small buffer from the edges
    return Math.min(100 - MIN_MARGIN, Math.max(MIN_MARGIN, raw));
  };

  // Provide proper positioning: centering + directional offset + distribution
  switch (reactFlowPosition) {
    case Position.Left:
      return {
        top: `${getDistributedPosition(index, totalHandles)}%`,
        left: -handleOffset,
        transform: "translateY(-50%)",
      };
    case Position.Right:
      return {
        top: `${getDistributedPosition(index, totalHandles)}%`,
        right: -handleOffset,
        transform: "translateY(-50%)",
      };
    case Position.Top:
      return {
        left: `${getDistributedPosition(index, totalHandles)}%`,
        top: -handleOffset,
        transform: "translateX(-50%)",
      };
    case Position.Bottom:
      return {
        left: `${getDistributedPosition(index, totalHandles)}%`,
        bottom: -handleOffset,
        transform: "translateX(-50%)",
      };
    default:
      return {
        top: `${getDistributedPosition(index, totalHandles)}%`,
        left: -handleOffset,
        transform: "translateY(-50%)",
      };
  }
}

// Triangle handle with n8n-style design - points in direction of handle position
const TriangleHandle = forwardRef<
  HTMLDivElement,
  {
    className: string;
    style: React.CSSProperties;
    position: HandlePosition;
    color?: string;
  }
>((props, ref) => {
  const { position, color = HANDLE_COLOR, ...otherProps } = props;

  // Get triangle border styles based on position direction
  const getTriangleStyle = (pos: HandlePosition): React.CSSProperties => {
    const reactFlowPosition = REACTFLOW_POSITION_MAP[pos];

    switch (reactFlowPosition) {
      case Position.Top:
        // Point upward (base at bottom)
        return {
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderBottom: `6px solid ${color}`,
          borderTop: 0,
        };
      case Position.Bottom:
        // Point downward (base at top)
        return {
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `6px solid ${color}`,
          borderBottom: 0,
        };
      case Position.Left:
        // Point left (base at right)
        return {
          width: 0,
          height: 0,
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderRight: `6px solid ${color}`,
          borderLeft: 0,
        };
      case Position.Right:
        // Point right (base at left)
        return {
          width: 0,
          height: 0,
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: `6px solid ${color}`,
          borderRight: 0,
        };
      default:
        // Fallback to upward pointing
        return {
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderBottom: `6px solid ${color}`,
          borderTop: 0,
        };
    }
  };

  return (
    <div
      ref={ref}
      {...otherProps}
      className="transition-all duration-200 hover:scale-110 hover:brightness-110"
      style={getTriangleStyle(position)}
    />
  );
});

TriangleHandle.displayName = "TriangleHandle";

const CustomHandle = forwardRef<HTMLDivElement, CustomHandleProps>(
  (
    {
      handle,
      type,
      nodeId,
      index,
      totalHandles,
      borderWidth = 0,
      onConnect,
      isValidConnection,
    },
    ref
  ) => {
    const handleStyle = calculateHandlePosition(
      handle.position,
      index,
      totalHandles,
      handle.viewType,
      borderWidth
    );

    // Get shape validation status for this handle
    const { hasShape, hasValidationError } = useHandleShapeValidation(
      nodeId,
      handle.id,
      type === "target"
    );

    // Determine handle color based on shape validation
    const getHandleColor = () => {
      if (!hasShape) return HANDLE_COLOR; // Default gray
      if (hasValidationError) return "#ef4444"; // Red for validation errors
      return "#22c55e"; // Green for valid shapes
    };

    const handleColor = getHandleColor();

    // Add glow effect for shape validation states
    const getHandleGlow = () => {
      if (!hasShape) return undefined;
      if (hasValidationError) return "0 0 8px rgba(239, 68, 68, 0.6)"; // Red glow
      return "0 0 6px rgba(34, 197, 94, 0.4)"; // Green glow
    };

    const handleGlow = getHandleGlow();

    // Special case for triangle handles
    if (handle.viewType === HandleViewType.TRIANGLE) {
      return (
        <HandleTooltip
          nodeId={nodeId}
          handleId={handle.id}
          isInput={type === "target"}
        >
          <div className="absolute group" style={handleStyle}>
            <ReactFlowHandle
              ref={ref}
              id={handle.id}
              type={type}
              position={REACTFLOW_POSITION_MAP[handle.position]}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              className="opacity-0 w-3 h-3"
            />
            <TriangleHandle
              className=""
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                filter: handleGlow ? `drop-shadow(${handleGlow})` : undefined,
              }}
              position={handle.position}
              color={handleColor}
            />
            {/* Handle label */}
            {handle.label && (
              <div
                className="absolute text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={calculateLabelPosition(handle.position)}
              >
                {getEnhancedLabel(handle, type, nodeId)}
              </div>
            )}
          </div>
        </HandleTooltip>
      );
    }

    // Special case for DEFAULT (ring/donut handles - medium)
    if (handle.viewType === HandleViewType.DEFAULT) {
      return (
        <HandleTooltip
          nodeId={nodeId}
          handleId={handle.id}
          isInput={type === "target"}
        >
          <div className="absolute group" style={handleStyle}>
            <ReactFlowHandle
              ref={ref}
              id={handle.id}
              type={type}
              position={REACTFLOW_POSITION_MAP[handle.position]}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              className="w-4 h-4 rounded-full bg-transparent transition-all duration-200 hover:scale-110 relative z-10"
              style={
                {
                  border: `5px solid ${handleColor}`,
                  backgroundColor: "white",
                  boxShadow: `inset 0 0 0 1px white${handleGlow ? `, 0 0 0 1px ${handleColor}` : ""}`,
                  filter: handleGlow ? `drop-shadow(${handleGlow})` : undefined,
                } as React.CSSProperties
              }
            />
            {/* Handle label */}
            {handle.label && (
              <div
                className="absolute text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={calculateLabelPosition(handle.position)}
              >
                {getEnhancedLabel(handle, type, nodeId)}
              </div>
            )}
          </div>
        </HandleTooltip>
      );
    }

    // Special case for VERTICAL_BOX (rectangular handles)
    if (handle.viewType === HandleViewType.VERTICAL_BOX) {
      // Check if handle is on top or bottom (needs 90-degree rotation)
      const isTopOrBottom =
        handle.position === HandlePosition.TOP ||
        handle.position === HandlePosition.BOTTOM;

      return (
        <HandleTooltip
          nodeId={nodeId}
          handleId={handle.id}
          isInput={type === "target"}
        >
          <div className="absolute group" style={handleStyle}>
            <ReactFlowHandle
              ref={ref}
              id={handle.id}
              type={type}
              position={REACTFLOW_POSITION_MAP[handle.position]}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              className="border-0 transition-all duration-200 hover:scale-110 hover:brightness-110 relative z-10"
              style={
                {
                  width: isTopOrBottom ? "24px" : "8px",
                  height: isTopOrBottom ? "8px" : "24px",
                  borderRadius: "2px",
                  border: "none",
                  backgroundColor: handleColor,
                  filter: handleGlow ? `drop-shadow(${handleGlow})` : undefined,
                } as React.CSSProperties
              }
            />
            {/* Handle label */}
            {handle.label && (
              <div
                className="absolute text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={calculateLabelPosition(handle.position)}
              >
                {getEnhancedLabel(handle, type, nodeId)}
              </div>
            )}
          </div>
        </HandleTooltip>
      );
    }

    // Special case for CIRCLE_LG (ring/donut handles - large)
    if (handle.viewType === HandleViewType.CIRCLE_LG) {
      return (
        <HandleTooltip
          nodeId={nodeId}
          handleId={handle.id}
          isInput={type === "target"}
        >
          <div className="absolute group" style={handleStyle}>
            <ReactFlowHandle
              ref={ref}
              id={handle.id}
              type={type}
              position={REACTFLOW_POSITION_MAP[handle.position]}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              className="w-5 h-5 rounded-full bg-transparent transition-all duration-200 hover:scale-110 relative z-10"
              style={
                {
                  border: `5px solid ${handleColor}`,
                  backgroundColor: "white",
                  boxShadow: `inset 0 0 0 1px white${handleGlow ? `, 0 0 0 1px ${handleColor}` : ""}`,
                  filter: handleGlow ? `drop-shadow(${handleGlow})` : undefined,
                } as React.CSSProperties
              }
            />

            {/* Handle label */}
            {handle.label && (
              <div
                className="absolute text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={calculateLabelPositionWithMargin(handle.position, 12)}
              >
                {handle.label}
              </div>
            )}
          </div>
        </HandleTooltip>
      );
    }

    return (
      <HandleTooltip
        nodeId={nodeId}
        handleId={handle.id}
        isInput={type === "target"}
      >
        <div className="absolute group" style={handleStyle}>
          <ReactFlowHandle
            ref={ref}
            id={handle.id}
            type={type}
            position={REACTFLOW_POSITION_MAP[handle.position]}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            className="transition-all duration-200 hover:scale-110 hover:brightness-110 relative z-10"
            style={
              {
                backgroundColor: handleColor,
                border: "none",
                filter: handleGlow ? `drop-shadow(${handleGlow})` : undefined,
                ...getHandleViewStyle(handle.viewType),
              } as React.CSSProperties
            }
          />

          {/* Handle label */}
          {handle.label && (
            <div
              className="absolute text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={calculateLabelPosition(handle.position)}
            >
              {getEnhancedLabel(handle, type, nodeId)}
            </div>
          )}
        </div>
      </HandleTooltip>
    );
  }
);

CustomHandle.displayName = "CustomHandle";

export default CustomHandle;
