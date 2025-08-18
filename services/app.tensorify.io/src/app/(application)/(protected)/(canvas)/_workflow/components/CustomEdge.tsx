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

  // Get error message based on validation reason
  const getErrorMessage = () => {
    if (!edgeState || edgeState.isCompatible) return null;

    switch (edgeState.reason) {
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

  // If no error, render a simple edge
  if (!errorMessage) {
    return <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />;
  }

  // Render edge with tooltip for errors
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <g>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
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
        <TooltipContent className="bg-background border border-destructive-500/20 shadow-2xl ring-4 ring-destructive-500/20 max-w-xs p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
              <div className="text-xs text-destructive font-semibold">
                Connection Issue
              </div>
            </div>
            <div className="text-xs text-foreground leading-relaxed pl-4">
              {errorMessage}
            </div>
            {edgeState.reason === "multi-next" && (
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
