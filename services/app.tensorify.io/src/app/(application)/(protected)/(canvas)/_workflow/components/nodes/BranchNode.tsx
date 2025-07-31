"use client";

import React, { useState, useEffect } from "react";
import { type NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import TNode from "./TNode/TNode";
import CustomHandle from "./handles/CustomHandle";
import useWorkflowStore, { type WorkflowNode } from "../../store/workflowStore";
import {
  HandleViewType,
  HandlePosition,
  EdgeType,
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";

export default function BranchNode(props: NodeProps<WorkflowNode>) {
  const { selected, id, data } = props;
  const [showDialog, setShowDialog] = useState(false);
  const [branchCount, setBranchCount] = useState(2);

  // Check if this is a newly created node
  useEffect(() => {
    if (!data.branchCount) {
      setShowDialog(true);
    }
  }, [data.branchCount]);

  // Get the actual branch count from node data
  const actualBranchCount: number =
    typeof data.branchCount === "number" ? data.branchCount : 2;

  // Define the input handle
  const inputHandle: InputHandle = {
    id: "branch-input",
    label: "Input",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.CIRCLE_LG,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    required: true,
  };

  // Generate output handles based on branch count
  const outputHandles: OutputHandle[] = Array.from(
    { length: actualBranchCount },
    (_, index) => ({
      id: `branch-output-${index + 1}`,
      label: `Branch ${index + 1}`,
      position: HandlePosition.RIGHT,
      viewType: HandleViewType.CIRCLE_LG,
      edgeType: EdgeType.DEFAULT,
      dataType: "any",
    })
  );

  const handleConfirmBranches = () => {
    const count = Math.max(2, Math.min(20, branchCount));
    // Update node data with branch count
    const updateNodeData = useWorkflowStore.getState().updateNodeData;
    updateNodeData(id, { branchCount: count });
    setShowDialog(false);
  };

  return (
    <>
      <TNode {...props}>
        <div
          className={`
            relative group
            bg-card border-2 rounded-lg shadow-sm
            min-w-[200px] min-h-[120px]
            transition-all duration-200
            ${
              selected
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-muted-foreground"
            }
          `}
        >
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
              <GitBranch className="w-6 h-6" />
            </div>

            <div className="text-center w-full">
              <p className="text-sm font-medium text-foreground">Branch</p>
              <p className="text-xs text-muted-foreground">
                {actualBranchCount} outputs
              </p>
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

          {/* Output Handles */}
          {outputHandles.map((handle, index) => (
            <CustomHandle
              key={handle.id}
              handle={handle}
              type="source"
              nodeId={id}
              index={index}
              totalHandles={outputHandles.length}
            />
          ))}
        </div>
      </TNode>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Branch Node</DialogTitle>
            <DialogDescription>
              Specify the number of output branches for this node. You can have
              between 2 and 20 branches.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branch-count" className="text-right">
                Number of branches
              </Label>
              <Input
                id="branch-count"
                type="number"
                min="2"
                max="20"
                value={branchCount}
                onChange={(e) => setBranchCount(parseInt(e.target.value) || 2)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmBranches}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
