/**
 * Handle Tooltip Component with Shape IntelliSense
 *
 * Displays tensor shape information and validation results
 * when hovering over workflow handles.
 */

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { useUIEngine } from "@workflow/engine";
import { ShapeCalculator } from "../../../utils/ShapeCalculator";
import type { HandleHoverInfo } from "../../../utils/ShapeIntelliSense";
import useWorkflowStore from "@workflow/store/workflowStore";

interface HandleTooltipProps {
  children: React.ReactNode;
  nodeId: string;
  handleId: string;
  isInput: boolean;
  className?: string;
}

export function HandleTooltip({
  children,
  nodeId,
  handleId,
  isInput,
  className,
}: HandleTooltipProps) {
  const engine = useUIEngine();

  // Get handle hover information
  const edges = useWorkflowStore((state) => state.edges);
  const hoverInfo: HandleHoverInfo = React.useMemo(() => {
    const shapeInfo = engine.nodeShapes[nodeId];

    // Get shape for this handle
    let shape;
    if (shapeInfo) {
      if (isInput) {
        shape = shapeInfo.expectedInputShapes[handleId];
      } else {
        // For output handles, find the corresponding emitted variable shape
        shape = engine.shapeIntelliSenseManager.getOutputShapeForHandle(
          shapeInfo,
          handleId
        );
      }
    }

    // Get connection information
    const connections = edges
      .filter((edge) =>
        isInput
          ? edge.target === nodeId && edge.targetHandle === handleId
          : edge.source === nodeId && edge.sourceHandle === handleId
      )
      .map((edge) => {
        const validationKey = `${edge.source}:${edge.sourceHandle}->${edge.target}:${edge.targetHandle}`;
        const validation = engine.connectionShapeValidations[validationKey];

        return {
          edgeId: edge.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          sourceHandle: edge.sourceHandle || "",
          targetHandle: edge.targetHandle || "",
          isValid: validation?.isValid ?? true,
          validationMessage: validation?.message || "No validation info",
        };
      });

    return {
      handleId,
      nodeId,
      isInput,
      shape,
      connections,
    };
  }, [engine, nodeId, handleId, isInput, edges]);

  // Don't show tooltip if no shape information available
  if (!hoverInfo.shape && hoverInfo.connections.length === 0) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-2">
            {/* Handle Information */}
            <div className="font-medium text-sm">
              {isInput ? "📥 Input" : "📤 Output"}: {handleId}
            </div>

            {/* Shape Information */}
            {hoverInfo.shape && (
              <div className="text-sm">
                <div className="font-medium text-blue-600 dark:text-blue-400">
                  Shape: {ShapeCalculator.formatShape(hoverInfo.shape)}
                </div>
                {hoverInfo.shape.description && (
                  <div className="text-muted-foreground text-xs">
                    {hoverInfo.shape.description}
                  </div>
                )}
              </div>
            )}

            {/* Connection Information */}
            {hoverInfo.connections.length > 0 && (
              <div className="space-y-1">
                <div className="font-medium text-xs text-muted-foreground">
                  Connections:
                </div>
                {hoverInfo.connections.map((conn) => (
                  <div
                    key={conn.edgeId}
                    className={`text-xs p-1 rounded ${
                      conn.isValid
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{conn.isValid ? "✅" : "❌"}</span>
                      <span className="font-mono">
                        {isInput ? conn.sourceNodeId : conn.targetNodeId}
                      </span>
                    </div>
                    <div className="mt-1 text-xs">{conn.validationMessage}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Shape Validation Details */}
            {!isInput && hoverInfo.connections.length > 0 && (
              <div className="border-t pt-2 space-y-1">
                <div className="font-medium text-xs text-muted-foreground">
                  Shape Validation:
                </div>
                {hoverInfo.connections.map((conn) => {
                  const validationKey = `${conn.sourceNodeId}:${conn.sourceHandle}->${conn.targetNodeId}:${conn.targetHandle}`;
                  const validation =
                    engine.connectionShapeValidations[validationKey];

                  if (!validation) return null;

                  return (
                    <div key={conn.edgeId} className="text-xs">
                      {validation.outputShape && validation.expectedShape && (
                        <div className="font-mono">
                          {ShapeCalculator.formatShape(validation.outputShape)}{" "}
                          →{" "}
                          {ShapeCalculator.formatShape(
                            validation.expectedShape
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Hook to get shape validation status for styling
 */
export function useHandleShapeValidation(
  nodeId: string,
  handleId: string,
  isInput: boolean
) {
  const engine = useUIEngine();
  const edges = useWorkflowStore((state) => state.edges);

  return React.useMemo(() => {
    const shapeInfo = engine.nodeShapes[nodeId];
    if (!shapeInfo) return { hasShape: false, hasValidationError: false };

    // Check if handle has shape information
    const hasShape = isInput
      ? Boolean(shapeInfo.expectedInputShapes[handleId])
      : Boolean(
          engine.shapeIntelliSenseManager.getOutputShapeForHandle(
            shapeInfo,
            handleId
          )
        );

    // Check for validation errors in connections
    let hasValidationError = false;

    if (hasShape) {
      const relevantEdges = edges.filter((edge) =>
        isInput
          ? edge.target === nodeId && edge.targetHandle === handleId
          : edge.source === nodeId && edge.sourceHandle === handleId
      );

      hasValidationError = relevantEdges.some((edge) => {
        const validationKey = `${edge.source}:${edge.sourceHandle}->${edge.target}:${edge.targetHandle}`;
        const validation = engine.connectionShapeValidations[validationKey];
        return validation && !validation.isValid;
      });
    }

    return { hasShape, hasValidationError };
  }, [engine, nodeId, handleId, isInput, edges]);
}
