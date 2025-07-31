"use client";

import React, { useState, useEffect } from "react";
import { type NodeProps } from "@xyflow/react";
import { Merge } from "lucide-react";
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

export default function MultiplexerNode(props: NodeProps<WorkflowNode>) {
  const { selected, id, data } = props;
  const [showDialog, setShowDialog] = useState(false);
  const [inputCount, setInputCount] = useState(2);

  // Check if this is a newly created node
  useEffect(() => {
    if (!data.inputCount) {
      setShowDialog(true);
    }
  }, [data.inputCount]);

  // Get the actual input count from node data
  const actualInputCount = (data.inputCount as number) || 2;

  // Generate input handles based on input count
  const inputHandles: InputHandle[] = Array.from(
    { length: actualInputCount },
    (_, index) => ({
      id: `mux-input-${index + 1}`,
      label: `Input ${index + 1}`,
      position: HandlePosition.LEFT,
      viewType: HandleViewType.CIRCLE_LG,
      edgeType: EdgeType.DEFAULT,
      dataType: "any",
      required: false,
    })
  );

  // Define the output handle
  const outputHandle: OutputHandle = {
    id: "mux-output",
    label: "Multiplexed Output",
    position: HandlePosition.RIGHT,
    viewType: HandleViewType.CIRCLE_LG,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
  };

  const handleConfirmInputs = () => {
    const count = Math.max(2, Math.min(20, inputCount));
    // Update node data with input count
    const updateNodeData = useWorkflowStore.getState().updateNodeData;
    updateNodeData(id, { inputCount: count });
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
              <Merge className="w-6 h-6" />
            </div>

            <div className="text-center w-full">
              <p className="text-sm font-medium text-foreground">Multiplexer</p>
              <p className="text-xs text-muted-foreground">
                {actualInputCount} → 1
              </p>
            </div>
          </div>

          {/* Input Handles */}
          {inputHandles.map((handle, index) => (
            <CustomHandle
              key={handle.id}
              handle={handle}
              type="target"
              nodeId={id}
              index={index}
              totalHandles={inputHandles.length}
            />
          ))}

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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Multiplexer Node</DialogTitle>
            <DialogDescription>
              Specify the number of inputs to multiplex into a single output.
              You can have between 2 and 5 inputs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="input-count" className="text-right">
                Number of inputs
              </Label>
              <Input
                id="input-count"
                type="number"
                min="2"
                max="5"
                value={inputCount}
                onChange={(e) => setInputCount(parseInt(e.target.value) || 2)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmInputs}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
