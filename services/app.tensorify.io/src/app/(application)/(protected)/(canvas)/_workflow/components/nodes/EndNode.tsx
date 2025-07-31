"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Square } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type InputHandle,
} from "@packages/sdk/src/types/visual";

export default function EndNode(props: NodeProps<WorkflowNode>) {
  const { selected, id } = props;

  // Define the input handle for the end node
  const inputHandle: InputHandle = {
    id: "end-input",
    label: "Final Input",
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
          bg-destructive rounded-r-full rounded-l-lg shadow-sm
          ring-5 ring-destructive
          min-w-[160px] min-h-[100px]
          transition-all duration-200
          ${selected ? "shadow-lg shadow-destructive/20" : ""}
        `}
      >
        <div className="flex flex-col items-center justify-center p-4 space-y-2">
          <div
            className={`
              p-2 rounded-md transition-colors duration-200
              ${
                selected
                  ? "bg-destructive-foreground/20 text-destructive-foreground"
                  : "bg-destructive-foreground/10 text-destructive-foreground group-hover:bg-destructive-foreground/20"
              }
            `}
          >
            <Square className="w-6 h-6" />
          </div>

          <div className="text-center w-full">
            <p className="text-sm font-medium text-destructive-foreground">
              End
            </p>
            <p className="text-xs text-destructive-foreground/70">Exit Point</p>
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
