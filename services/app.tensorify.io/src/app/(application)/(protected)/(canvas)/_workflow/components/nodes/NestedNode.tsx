"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { FolderOpen, AlertCircle } from "lucide-react";
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

export default function NestedNode(props: NodeProps<WorkflowNode>) {
  const { selected, id } = props;
  const engine = useUIEngine();
  // For NestedNode, we check for missing connections differently since it uses different handle IDs
  const nodeValidation = engine.nodes[id];
  const needsPrev = nodeValidation?.missingPrev || false;
  const needsNext = nodeValidation?.missingNext || false;

  // Define the input handle for the nested node
  const inputHandle: InputHandle = {
    id: "nested-input",
    label: "Input",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.CIRCLE_LG,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    required: false,
  };

  // Define the output handle for the nested node
  const outputHandle: OutputHandle = {
    id: "nested-output",
    label: "Output",
    position: HandlePosition.RIGHT,
    viewType: HandleViewType.CIRCLE_LG,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
  };

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-card border-2 rounded-lg shadow-sm
          min-w-[160px] min-h-[100px]
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
                  <p className="font-medium">Missing "prev" connection</p>
                  <p>Connect an incoming edge to the "prev" handle.</p>
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
                  <p className="font-medium">Missing "next" connection</p>
                  <p>Connect an outgoing edge from the "next" handle.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="flex flex-col items-center justify-center p-4 space-y-2">
          <div
            className={`
              p-2 rounded-md transition-colors duration-200
              ${
                selected
                  ? "bg-primary-readable/10 text-primary-readable"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-muted"
              }
            `}
          >
            <FolderOpen className="w-6 h-6" />
          </div>

          <div className="text-center w-full">
            <p className="text-sm font-medium text-foreground">Nested Node</p>
            <p className="text-xs text-muted-foreground">Components</p>
          </div>
        </div>

        <CustomHandle
          handle={inputHandle}
          type="target"
          nodeId={id}
          index={0}
          totalHandles={1}
        />

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
