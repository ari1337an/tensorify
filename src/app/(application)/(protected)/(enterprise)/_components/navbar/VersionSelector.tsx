"use client";

import { useState } from "react";
import { ChevronDown, Plus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { cn } from "@/app/_lib/utils";
import useStore, { type Workflow } from "@/app/_store/store";

type WorkflowVersionSummary = Workflow["allVersions"][0];

interface VersionSelectorProps {
  onCreateNewVersion?: () => void;
  className?: string;
}

export function VersionSelector({
  onCreateNewVersion,
  className,
}: VersionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentWorkflow, setCurrentWorkflow } = useStore();

  // Get current workflow data from store
  const currentVersion = currentWorkflow?.version;
  const allVersions = currentWorkflow?.allVersions || [];

  const handleVersionSelect = (selectedVersion: WorkflowVersionSummary) => {
    if (!currentWorkflow) return;

    // Update the current workflow with the selected version
    const updatedWorkflow = {
      ...currentWorkflow,
      version: {
        id: selectedVersion.id,
        summary: selectedVersion.summary,
        description: currentWorkflow.version?.description || null,
        version: selectedVersion.version,
        code: currentWorkflow.version?.code || {},
        isLatest: selectedVersion.isLatest,
        createdAt: selectedVersion.createdAt,
        updatedAt: selectedVersion.updatedAt,
      },
    };

    setCurrentWorkflow(updatedWorkflow);
    setIsOpen(false);
  };

  const handleCreateNewVersion = () => {
    onCreateNewVersion?.();
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Don't render if there's no current workflow or version
  if (!currentWorkflow || !currentVersion) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
            className
          )}
        >
          <span className="flex items-center gap-1">
            {currentVersion.isLatest && (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            )}
            v{currentVersion.version}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Version History
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {allVersions.length === 0 ? (
          <DropdownMenuItem
            disabled
            className="p-3 text-center text-muted-foreground"
          >
            No versions available
          </DropdownMenuItem>
        ) : (
          allVersions.map((version) => (
            <DropdownMenuItem
              key={version.id}
              onClick={() => handleVersionSelect(version)}
              className={cn(
                "flex items-start gap-3 p-3 cursor-pointer",
                currentVersion.id === version.id && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  {version.isLatest && (
                    <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm">
                    v{version.version}
                  </span>
                  {version.isLatest && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      Latest
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                <span>{formatDate(version.createdAt)}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleCreateNewVersion}
          className="flex items-center gap-2 p-3 cursor-pointer text-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create New Version</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
