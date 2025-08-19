"use client";

import React, { useMemo } from "react";
import { type NodeProps } from "@xyflow/react";
import { Code, AlertCircle } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
import { useUIEngine } from "@workflow/engine";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";

// Define the data structure for custom code node
export interface CustomCodeNodeData {
  label?: string;
  code?: string;
  emitsConfig?: {
    variables?: Array<{
      value: string;
      switchKey: string;
      isOnByDefault: boolean;
      type: string;
    }>;
    imports?: Array<{
      path: string;
      items: string[];
      as?: Record<string, string>;
    }>;
  };
  customImports?: Array<{
    path: string;
    items: string[];
    as?: Record<string, string>;
  }>;
  variableMap?: Record<string, any>;
}

export default function CustomCodeNode(props: NodeProps<WorkflowNode>) {
  const { selected, id, data } = props;
  const engine = useUIEngine();
  const nodeValidation = engine.nodes[id];
  const needsPrev = nodeValidation?.missingPrev || false;
  const needsNext = nodeValidation?.missingNext || false;

  // Cast data to our specific type
  const customCodeData = data as CustomCodeNodeData;

  // Define the input handle for the custom code node (same as End node)
  const inputHandle: InputHandle = {
    id: "prev",
    label: "Prev",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    required: true,
  };

  // Define the output handle for the custom code node (same as Start node)
  const outputHandle: OutputHandle = {
    id: "next",
    label: "Next",
    position: HandlePosition.RIGHT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
  };

  // Get code preview for display
  const codePreview = useMemo(() => {
    const code = customCodeData.code || "";
    if (!code.trim()) return "# Write your custom code here...";

    // Get first non-empty line for preview
    const lines = code.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return "# Write your custom code here...";

    const firstLine = lines[0];
    if (firstLine.length > 30) {
      return firstLine.substring(0, 27) + "...";
    }
    return firstLine;
  }, [customCodeData.code]);

  // Count emitted variables
  const emittedVariableCount = useMemo(() => {
    return customCodeData.emitsConfig?.variables?.length || 0;
  }, [customCodeData.emitsConfig?.variables]);

  // Count imports
  const importCount = useMemo(() => {
    const emitsImports = customCodeData.emitsConfig?.imports?.length || 0;
    const customImports = customCodeData.customImports?.length || 0;
    return emitsImports + customImports;
  }, [customCodeData.emitsConfig?.imports, customCodeData.customImports]);

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-card border-2 rounded-lg shadow-sm
          min-w-[220px] min-h-[140px]
          transition-all duration-200
          ${
            selected
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border hover:border-muted-foreground"
          }
        `}
      >
        {needsPrev && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute -top-2 -left-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                  aria-label="Node connection issue"
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Missing input connection</p>
                  <p>Connect an incoming edge to the input handle.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {needsNext && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md"
                  aria-label="Node connection issue"
                >
                  <AlertCircle className="w-4 h-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" align="center" className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p className="font-medium">Missing output connection</p>
                  <p>Connect an outgoing edge from the output handle.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className="flex flex-col p-4 space-y-3">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3">
            <div
              className={`
                p-2 rounded-md transition-colors duration-200
                ${
                  selected
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
                }
              `}
            >
              <Code className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Custom Code</p>
              <p className="text-xs text-muted-foreground">
                Executable Function
              </p>
            </div>
          </div>

          {/* Code Preview */}
          <div className="bg-muted/30 rounded-md p-2 border border-border/50">
            <code className="text-xs text-muted-foreground font-mono leading-relaxed block truncate">
              {codePreview}
            </code>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <span className="font-medium text-primary-readable">
                {emittedVariableCount}
              </span>{" "}
              vars
            </span>
            <span className="text-muted-foreground">
              <span className="font-medium text-primary-readable">
                {importCount}
              </span>{" "}
              imports
            </span>
            {/* <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Ready</span>
            </div> */}
          </div>
        </div>

        {/* Input Handle */}
        <CustomHandle
          handle={inputHandle}
          type="target"
          nodeId={id}
          index={0}
          totalHandles={1}
        />

        {/* Output Handle */}
        <CustomHandle
          handle={outputHandle}
          type="source"
          nodeId={id}
          index={0}
          totalHandles={1}
        />
      </div>
    </TNode>
  );
}
