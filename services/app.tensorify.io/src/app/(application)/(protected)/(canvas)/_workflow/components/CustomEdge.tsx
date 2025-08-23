"use client";

import React from "react";
import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { useUIEngine } from "@workflow/engine";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  ...props
}: EdgeProps) {
  const engine = useUIEngine();
  const edgeState = engine.edges[id];

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get edge handles from props
  const sourceHandle = (props as any).sourceHandle;
  const targetHandle = (props as any).targetHandle;
  const sourceNodeId = (props as any).source;
  const targetNodeId = (props as any).target;

  // Get shape validation information
  const validationKey = `${sourceNodeId}:${sourceHandle || ""}->${targetNodeId}:${targetHandle || ""}`;
  const shapeValidation = engine.connectionShapeValidations[validationKey];

  // Try alternative key formats if the main one doesn't work
  const alternativeKey1 = `${sourceNodeId}:linear_layer->${targetNodeId}:input_tensor`;
  const alternativeKey2 = `${sourceNodeId}:${sourceHandle}->${targetNodeId}:${targetHandle}`;
  const alternativeValidation =
    engine.connectionShapeValidations[alternativeKey1] ||
    engine.connectionShapeValidations[alternativeKey2];

  // For debugging
  console.log("🔍 Edge Validation Keys:", {
    mainKey: validationKey,
    mainValidation: shapeValidation,
    alternativeKey1,
    alternativeKey2,
    alternativeValidation,
    allKeys: Object.keys(engine.connectionShapeValidations || {}),
    allValidations: engine.connectionShapeValidations,
  });

  // Debug: Check if we're getting the right validation
  React.useEffect(() => {
    console.log("🔍 CustomEdge Debug:", {
      edgeId: id,
      validationKey,
      sourceHandle,
      targetHandle,
      sourceHandleType: typeof sourceHandle,
      targetHandleType: typeof targetHandle,
      availableKeys: Object.keys(engine.connectionShapeValidations || {}),
      shapeValidation,
      hasValidation: !!shapeValidation,
      isValid: shapeValidation?.isValid,
      engineHasConnectionShapeValidations: !!engine.connectionShapeValidations,
    });
  }, [
    id,
    validationKey,
    engine.connectionShapeValidations,
    sourceHandle,
    targetHandle,
  ]);

  // Get error message based on validation reason
  const getErrorMessage = () => {
    if (!edgeState || edgeState.isCompatible) return null;

    // If there's a custom error message, use it
    if (edgeState.errorMessage) {
      return edgeState.errorMessage;
    }

    switch (edgeState.reason) {
      case "type-mismatch":
        return "Variable type mismatch: The emitted variable type is not compatible with the expected input type";
      case "workflow-mode-error":
        return "Node mode mismatch: Both nodes are in workflow mode but connecting via variable handles";
      case "incompatible":
        const actualConnection = `'${sourceHandle || "unknown"}' → '${targetHandle || "unknown"}'`;
        return `Incompatible connection: Got ${actualConnection} but only 'next' → 'prev' connections are allowed`;
      case "multi-prev":
        return "Multiple connections to 'prev' handle: Only one connection allowed per 'prev' handle";
      case "multi-next":
        return "Multiple connections from 'next' handle: Branch nodes can have multiple 'next' outputs, but regular nodes should only have one";
      default:
        return "Invalid connection";
    }
  };

  const errorMessage = getErrorMessage();

  // Determine edge styling based on validation state
  const getEdgeStyle = () => {
    const baseStyle = {
      ...style,
      // stroke: "#64748b", // Default gray color (slate-500)
      strokeWidth: 5,
    };

    // Use alternative validation if direct lookup failed
    const finalValidation = shapeValidation || alternativeValidation;

    // Shape validation error - red edge with glow
    if (finalValidation && !finalValidation.isValid) {
      return {
        ...baseStyle,
        stroke: "#ef4444", // Red color for shape errors
        filter: "drop-shadow(0px 0px 6px rgba(239, 68, 68, 0.4))",
      };
    }

    // Other validation errors - orange edge
    if (errorMessage) {
      return {
        ...baseStyle,
        stroke: "#f97316", // Orange color for other errors
        strokeWidth: 2,
        filter: "drop-shadow(0px 0px 4px rgba(249, 115, 22, 0.3))",
      };
    }

    // Valid connection - use default style
    return baseStyle;
  };

  const edgeStyle = getEdgeStyle();
  const finalValidation = shapeValidation || alternativeValidation;
  const hasAnyError =
    errorMessage || (finalValidation && !finalValidation.isValid);

  // If no error, render a simple edge with potential shape-based styling
  if (!hasAnyError) {
    return <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />;
  }

  // Get the primary error to display (shape validation takes precedence)
  const primaryError =
    finalValidation && !finalValidation.isValid
      ? finalValidation.message
      : errorMessage;

  const isShapeError = finalValidation && !finalValidation.isValid;

  // Render edge with tooltip for errors
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <g>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
            {/* Invisible wider path for easier hover targeting */}
            <path
              d={edgePath}
              fill="none"
              stroke="transparent"
              strokeWidth={20}
              className="pointer-events-auto cursor-help"
            />
          </g>
        </TooltipTrigger>
        <TooltipContent
          className={`bg-background border shadow-2xl ring-4 max-w-xs p-4 ${
            isShapeError
              ? "border-red-500/20 ring-red-500/20"
              : "border-destructive-500/20 ring-destructive-500/20"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isShapeError ? "bg-red-500" : "bg-destructive"
                }`}
              />
              <div
                className={`text-xs font-semibold ${
                  isShapeError ? "text-red-600" : "text-destructive"
                }`}
              >
                {isShapeError ? "Tensor Shape Mismatch" : "Connection Issue"}
              </div>
            </div>
            <div className="text-xs text-foreground leading-relaxed pl-4">
              {primaryError}
            </div>

            {/* Shape validation details */}
            {isShapeError &&
              finalValidation?.outputShape &&
              finalValidation?.expectedShape && (
                <div className="pl-4 space-y-1 border-t pt-2">
                  <div className="text-xs text-muted-foreground">
                    Shape Details:
                  </div>
                  <div className="text-xs font-mono">
                    Output: (
                    {finalValidation.outputShape.dimensions
                      ?.map((d) => (d === -1 ? "N" : d))
                      .join(", ")}
                    )
                  </div>
                  <div className="text-xs font-mono">
                    Expected: (
                    {finalValidation.expectedShape.dimensions
                      ?.map((d) => (d === -1 ? "N" : d))
                      .join(", ")}
                    )
                  </div>
                </div>
              )}

            {/* Original error details for non-shape errors */}
            {!isShapeError && edgeState?.reason === "multi-next" && (
              <div className="text-xs text-muted-foreground italic pl-4">
                Note: This may be expected behavior for Branch nodes with
                multiple outputs.
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
