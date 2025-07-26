"use client";

import { useState } from "react";
import { ChevronDown, Plus, GitBranch } from "lucide-react";
import { format } from "timeago.js";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
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
    // use a time ago format
    return format(dateString);
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
            <GitBranch className="h-3 w-3 text-primary-readable" />v
            {currentVersion.version}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Workflow Version History
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
            <Tooltip key={version.id}>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  onClick={() => handleVersionSelect(version)}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:cursor-pointer",
                    currentVersion.id === version.id && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1">
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
                    <span>{formatDate(version.updatedAt)}</span>
                  </div>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  {version.summary || "No summary available"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleCreateNewVersion}
          className="flex items-center gap-2 p-3 cursor-pointer text-foreground hover:text-foreground hover:font-bold hover:cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Create New Version</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
