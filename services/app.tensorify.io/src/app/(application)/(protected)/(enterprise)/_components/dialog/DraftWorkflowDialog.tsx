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
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

interface Project {
  id: string;
  name: string;
}

interface DraftWorkflowDialogProps {
  projects?: Project[];
  onWorkflowCreated?: () => void;
}

export function DraftWorkflowDialog({
  projects = [],
  onWorkflowCreated,
}: DraftWorkflowDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [workflowName, setWorkflowName] = React.useState("");
  const [workflowDescription, setWorkflowDescription] = React.useState("");
  const [selectedProjectId, setSelectedProjectId] = React.useState("");

  const handleCreateWorkflow = async () => {
    if (
      !workflowName.trim() ||
      !workflowDescription.trim() ||
      !selectedProjectId
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workflowName.trim(),
          description: workflowDescription.trim(),
          projectId: selectedProjectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create workflow");
      }

      // Reset form and close dialog
      setWorkflowName("");
      setWorkflowDescription("");
      setSelectedProjectId("");
      setIsOpen(false);

      // Notify parent component
      onWorkflowCreated?.();
    } catch (error) {
      console.error("Failed to create workflow:", error);
      // TODO: Add proper error handling/toast notification
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    workflowName.trim().length >= 2 &&
    workflowDescription.trim() &&
    selectedProjectId &&
    workflowName.length <= 100 &&
    workflowDescription.length <= 500;

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
            <Label htmlFor="workflow-name">
              Workflow name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name (2-100 characters)"
              maxLength={100}
              disabled={isLoading}
            />
            {workflowName && workflowName.length < 2 && (
              <p className="text-sm text-red-500">
                Workflow name must be at least 2 characters.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflow-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="workflow-description"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Enter workflow description (max 500 characters)"
              maxLength={500}
              rows={3}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              {workflowDescription.length}/500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-select">
              Project <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projects.length === 0 && (
              <p className="text-sm text-yellow-600">
                No projects available. Create a project first.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            variant="default"
            onClick={handleCreateWorkflow}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating..." : "Create Workflow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
