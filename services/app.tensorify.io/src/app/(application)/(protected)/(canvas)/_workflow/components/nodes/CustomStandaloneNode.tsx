"use client";

import React, { useState, useRef, useEffect } from "react";
import { Handle, type NodeProps, Position } from "@xyflow/react";
import { CodeXml } from "lucide-react";
import TNode from "./TNode/TNode";
import { type WorkflowNode } from "../../store/workflowStore";
import useWorkflowStore from "../../store/workflowStore";

export default function CustomStandaloneNode(props: NodeProps<WorkflowNode>) {
  const { data, selected, id } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label || "Custom Node");
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingLabel(data.label || "Custom Node");
  };

  const handleLabelSave = () => {
    const newLabel = editingLabel.trim() || "Custom Node";
    updateNodeData(id, { label: newLabel });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLabelSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditingLabel(data.label || "Custom Node");
    }
  };

  return (
    <TNode {...props}>
      <div
        className={`
          relative group
          bg-card border-2 rounded-lg shadow-sm
          min-w-[120px] min-h-[80px]
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
            <CodeXml className="w-6 h-6" />
          </div>

          <div className="text-center w-full">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onBlur={handleLabelSave}
                onKeyDown={handleKeyDown}
                className="text-sm font-medium text-foreground bg-transparent border-none outline-none text-center w-full px-1 py-0.5 rounded border-b-2 border-primary focus:border-primary"
                maxLength={25}
              />
            ) : (
              <p
                className="text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors truncate max-w-[100px]"
                onDoubleClick={handleLabelDoubleClick}
                title={`${data.label || "Custom Node"} - Double-click to edit`}
              >
                {data.label || "Custom Node"}
              </p>
            )}
            <p className="text-xs text-muted-foreground">Standalone</p>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-muted-foreground border-2 border-background"
        />
      </div>
    </TNode>
  );
}
