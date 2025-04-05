"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";

export function DraftWorkflowDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [workflowName, setWorkflowName] = React.useState("");
  const [workflowDescription, setWorkflowDescription] = React.useState("");

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) return;

    // Here you would handle workflow creation
    console.log("Creating workflow:", {
      name: workflowName,
      description: workflowDescription,
    });

    // Reset and close dialog
    setWorkflowName("");
    setWorkflowDescription("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a draft workflow</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="workflow-name">Workflow name</Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleCreateWorkflow}
            disabled={!workflowName.trim()}
          >
            Create Workflow
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
