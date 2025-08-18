"use client";
import {
  Download,
  History,
  Lock,
  MessageSquare,
  Package,
  Share,
  Unlock,
} from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { CollaboratorAvatars } from "@/app/(application)/(protected)/(enterprise)/_components/navbar/CollaboratorAvatars";
import { useState, useEffect } from "react";
import { cn } from "@/app/_lib/utils";
import { ExportDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog/ExportDialog";
import { ShareDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog/ShareDialog";
import { CreateVersionDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog/CreateVersionDialog";
import { PluginManagementDialog } from "@/app/(application)/(protected)/(enterprise)/_components/dialog/PluginManagementDialog";
import { ThemeToggle } from "@/app/_components/ui/theme-toggle";
import { VersionSelector } from "./VersionSelector";
import useStore from "@/app/_store/store";
import useWorkflowStore from "@/app/(application)/(protected)/(canvas)/_workflow/store/workflowStore";
import { postWorkflowVersion } from "@/app/api/v1/_client/client";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { format } from "timeago.js";

// Example collaborators data - in a real app, this would come from your collaboration system
const collaborators = [
  {
    id: "1",
    name: "User 1",
    avatarUrl: "https://github.com/shadcn.png",
    status: "editing" as const,
    colorIndex: 0,
  },
  {
    id: "2",
    name: "User 2",
    avatarUrl: "https://github.com/shadcn.png",
    status: "editing" as const,
    colorIndex: 1,
  },
  {
    id: "3",
    name: "User 3",
    avatarUrl: "https://github.com/shadcn.png",
    status: "idle" as const,
    colorIndex: 2,
  },
  {
    id: "4",
    name: "User 4",
    avatarUrl: "https://github.com/shadcn.png",
    status: "editing" as const,
    colorIndex: 3,
  },
];

export function NavbarRight() {
  const { currentWorkflow, fetchWorkflows } = useStore();
  const {
    nodes,
    edges,
    isSaving,
    lastSavedAt,
    isExportDialogOpen,
    openExportDialog,
    closeExportDialog,
  } = useWorkflowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      isSaving: state.isSaving,
      lastSavedAt: state.lastSavedAt,
      isExportDialogOpen: state.isExportDialogOpen,
      openExportDialog: state.openExportDialog,
      closeExportDialog: state.closeExportDialog,
    }))
  );
  const [isLocked, setIsLocked] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isCreateVersionModalOpen, setIsCreateVersionModalOpen] =
    useState(false);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [isPluginManagementModalOpen, setIsPluginManagementModalOpen] =
    useState(false);
  const [, forceUpdate] = useState({});

  // Update save status every minute to keep timeago fresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSavedAt) {
        forceUpdate({});
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const handleCreateNewVersion = () => {
    setIsCreateVersionModalOpen(true);
  };

  const handleVersionCreate = async (data: {
    version: string;
    summary: string;
    description?: string;
  }) => {
    if (!currentWorkflow?.id) {
      toast.error("No workflow selected. Please select a workflow first.");
      return;
    }

    setIsCreatingVersion(true);

    try {
      const response = await postWorkflowVersion({
        params: { workflowId: currentWorkflow.id },
        body: {
          version: data.version,
          summary: data.summary,
          description: data.description,
        },
      });

      if (response.status === 201) {
        toast.success("New version created successfully!");

        // Refresh the workflow data to get the updated versions
        await fetchWorkflows();

        setIsCreateVersionModalOpen(false);
      } else {
        toast.error(response.body.message || "Failed to create version");
      }
    } catch (error) {
      console.error("Error creating version:", error);
      toast.error("An unexpected error occurred while creating the version.");
    } finally {
      setIsCreatingVersion(false);
    }
  };

  // Format last saved time using timeago.js
  const getSaveStatus = () => {
    if (isSaving) {
      return "Saving...";
    }
    if (lastSavedAt) {
      return `Saved ${format(lastSavedAt)}`;
    }
    return null;
  };

  return (
    <div className="flex items-center gap-2 px-3 shrink-0">
      {/* Save Status Indicator */}
      {getSaveStatus() && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md mr-2">
          {isSaving && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
          )}
          <span>{getSaveStatus()}</span>
        </div>
      )}

      <VersionSelector onCreateNewVersion={handleCreateNewVersion} />

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-4"
        )}
        onClick={() => setIsPluginManagementModalOpen(true)}
        title="Install Plugin"
      >
        <Package className="h-3 w-3 text-primary-readable" />
        Plugin
      </Button>
      <div className="mr-2">
        <CollaboratorAvatars collaborators={collaborators} maxVisible={2} />
      </div>

      <ThemeToggle />

      <Button
        variant={isLocked ? "destructive" : "ghost"}
        size="icon"
        className={cn("h-8 w-8 transition-all duration-300")}
        title={isLocked ? "Workflow is locked" : "Unlock workflow"}
        onClick={toggleLock}
      >
        {isLocked ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8" title="History">
        <History className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" className="h-8 w-8" title="Comments">
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 px-3"
        onClick={() => setIsShareDialogOpen(true)}
      >
        <Share className="h-4 w-4 mr-1" />
        Share
      </Button>

      <Button
        variant="default"
        size="sm"
        className="h-8 px-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white inest-shadow-lg hover:inset-shadow-xl shadow-black/20 transition-all duration-200"
        onClick={() => {
          console.log("Current workflow:", currentWorkflow);
          console.log("Workflow version:", currentWorkflow?.version);
          console.log("Workflow code:", currentWorkflow?.version?.code);
          console.log("Nodes:", currentWorkflow?.version?.code?.nodes);
          console.log("Edges:", currentWorkflow?.version?.code?.edges);
          openExportDialog();
        }}
      >
        <Download className="h-4 w-4 mr-1" />
        Export
      </Button>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={closeExportDialog}
        nodes={nodes}
        edges={edges}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />

      <CreateVersionDialog
        isOpen={isCreateVersionModalOpen}
        onClose={() => setIsCreateVersionModalOpen(false)}
        onCreateVersion={handleVersionCreate}
        currentVersion={currentWorkflow?.version?.version || "1.0.0"}
        isLoading={isCreatingVersion}
      />

      <PluginManagementDialog
        isOpen={isPluginManagementModalOpen}
        onClose={() => setIsPluginManagementModalOpen(false)}
      />
    </div>
  );
}
