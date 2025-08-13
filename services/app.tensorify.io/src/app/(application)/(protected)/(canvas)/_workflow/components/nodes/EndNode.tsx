"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Square } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
import { AlertCircle } from "lucide-react";
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
} from "@packages/sdk/src/types/visual";

export default function EndNode(props: NodeProps<WorkflowNode>) {
  const { selected, id } = props;
  const engine = useUIEngine();
  const needsPrev = engine.nodes[id]?.missingPrev || false;

  // Define the input handle for the end node
  const inputHandle: InputHandle = {
    id: "prev",
    label: "Prev",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    required: true,
  };

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-accent rounded-r-full rounded-l-lg shadow-sm
          ring-5 ring-primary
          min-w-[160px] min-h-[100px]
          transition-all duration-200
          ${selected ? "shadow-lg shadow-primary/20" : ""}
        `}
      >
        {needsPrev && (
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
                  <p className="font-medium">Missing "prev" connection</p>
                  <p>Connect an incoming edge to the "prev" handle.</p>
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
                  ? "bg-accent-foreground/20 text-accent-foreground"
                  : "bg-accent-foreground/10 text-accent-foreground group-hover:bg-accent-foreground/20"
              }
            `}
          >
            <Square className="w-6 h-6" />
          </div>

          <div className="text-center w-full">
            <p className="text-sm font-medium text-accent-foreground">End</p>
            <p className="text-xs text-accent-foreground/70">Exit Point</p>
          </div>
        </div>

        <CustomHandle
          handle={inputHandle}
          type="target"
          nodeId={id}
          index={0}
          totalHandles={1}
        />
      </div>
    </TNode>
  );
}
