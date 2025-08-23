"use client";

import React from "react";
import { type NodeProps } from "@xyflow/react";
import { Loader2, Package } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import { type WorkflowNode } from "../../store/workflowStore";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";

interface LoadingPluginNodeProps extends NodeProps<WorkflowNode> {
  nodeType?: string;
}

export default function LoadingPluginNode(props: LoadingPluginNodeProps) {
  const { selected, id, nodeType } = props;

  // Extract plugin name from node type for display
  const displayName = nodeType
    ? nodeType.includes("/")
      ? nodeType.split("/").pop()?.split(":")[0] || nodeType
      : nodeType
    : "Plugin";

  // Define the output handle for loading node
  const outputHandle: OutputHandle = {
    id: "next",
    label: "Next",
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
          bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800
          rounded-lg shadow-sm
          min-w-[160px] max-w-[200px] min-h-[100px]
          transition-all duration-200
          ${selected ? "shadow-lg shadow-blue-500/20" : ""}
        `}
      >
        <div className="flex flex-col items-center justify-center p-3 space-y-3">
          {/* Loading indicator */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>

          {/* Content */}
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
              Loading...
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
              {displayName}
            </p>
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
