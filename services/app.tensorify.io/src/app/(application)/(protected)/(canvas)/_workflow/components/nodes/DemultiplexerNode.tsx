"use client";

import React, { useState, useEffect } from "react";
import { type NodeProps } from "@xyflow/react";
import { Split } from "lucide-react";
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

export default function DemultiplexerNode(props: NodeProps<WorkflowNode>) {
  const { selected, id, data } = props;
  const [showDialog, setShowDialog] = useState(false);
  const [outputCount, setOutputCount] = useState(2);

  // Check if this is a newly created node
  useEffect(() => {
    if (!data.outputCount) {
      setShowDialog(true);
    }
  }, [data.outputCount]);

  // Get the actual output count from node data
  const actualOutputCount = (data.outputCount as number) || 2;

  // Define the input handle
  const inputHandle: InputHandle = {
    id: "demux-input",
    label: "Input Signal",
    position: HandlePosition.LEFT,
    viewType: HandleViewType.CIRCLE_LG,
    edgeType: EdgeType.DEFAULT,
    dataType: "any",
    required: true,
  };

  // Generate output handles based on output count
  const outputHandles: OutputHandle[] = Array.from(
    { length: actualOutputCount },
    (_, index) => ({
      id: `demux-output-${index + 1}`,
      label: `Output ${index + 1}`,
      position: HandlePosition.RIGHT,
      viewType: HandleViewType.CIRCLE_LG,
      edgeType: EdgeType.DEFAULT,
      dataType: "any",
    })
  );

  const handleConfirmOutputs = () => {
    const count = Math.max(2, Math.min(20, outputCount));
    // Update node data with output count
    const updateNodeData = useWorkflowStore.getState().updateNodeData;
    updateNodeData(id, { outputCount: count });
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
              <Split className="w-6 h-6" />
            </div>

            <div className="text-center w-full">
              <p className="text-sm font-medium text-foreground">
                Demultiplexer
              </p>
              <p className="text-xs text-muted-foreground">
                1 → {actualOutputCount}
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
            <DialogTitle>Configure Demultiplexer Node</DialogTitle>
            <DialogDescription>
              Specify the number of outputs to split the input signal into. You
              can have between 2 and 5 outputs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="output-count" className="text-right">
                Number of outputs
              </Label>
              <Input
                id="output-count"
                type="number"
                min="2"
                max="5"
                value={outputCount}
                onChange={(e) => setOutputCount(parseInt(e.target.value) || 2)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmOutputs}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
