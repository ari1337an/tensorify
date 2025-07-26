"use client";

import React from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Package, ChevronRight } from "lucide-react";
import TNode from "./TNode/TNode";
import { type WorkflowNode } from "../../store/workflowStore";

export default function CustomNestedNode(props: NodeProps<WorkflowNode>) {
  const { id, data, selected } = props;

  return (
    <TNode {...props}>
      <div
        className={`
          relative group cursor-pointer
          bg-card border-2 rounded-lg shadow-sm
          min-w-[140px] min-h-[80px]
          transition-all duration-200
          ${
            selected
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border hover:border-muted-foreground"
          }
        `}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-muted-foreground border-2 border-background"
        />

        <div className="flex flex-col items-center justify-center p-4 space-y-2">
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
            <Package className="w-6 h-6" />
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {data.label || "Nested Node"}
            </p>
            <div className="flex items-center justify-center gap-1">
              <p className="text-xs text-muted-foreground">Click to expand</p>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-muted-foreground border-2 border-background"
        />

        {/* Visual indicator for nested functionality */}
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
        </div>
      </div>
    </TNode>
  );
}
