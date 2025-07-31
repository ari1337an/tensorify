"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";

export default function StartNode(props: NodeProps<WorkflowNode>) {
  const { selected, id } = props;

  // Define the output handle for the start node
  const outputHandle: OutputHandle = {
    id: "start-output",
    label: "Connect me",
    position: HandlePosition.RIGHT,
    viewType: HandleViewType.VERTICAL_BOX,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
  };

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-accent rounded-l-full rounded-r-lg shadow-sm
          ring-5 ring-primary
          min-w-[160px] min-h-[100px]
          transition-all duration-200
          ${selected ? "shadow-lg shadow-primary/20" : ""}
        `}
      >
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
            <Play className="w-6 h-6" />
          </div>

          <div className="text-center w-full">
            <p className="text-sm font-medium text-accent-foreground">Start</p>
            <p className="text-xs text-accent-foreground/70">Entry Point</p>
          </div>
        </div>

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
