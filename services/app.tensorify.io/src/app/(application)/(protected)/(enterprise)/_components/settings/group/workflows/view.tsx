"use client";

import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { WorkflowsDataTable } from "./data-table";
import { getWorkflowsTableColumns } from "./columns";
import { useWorkflowsLogic } from "./logic";
import { Loader2 } from "lucide-react";
import useStore from "@/app/_store/store";
import { Button } from "@/app/_components/ui/button";
import { useState } from "react";
import { CreateWorkflowForm } from "./create-workflow-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Separator } from "@/app/_components/ui/separator";

export default function WorkflowsView() {
  const {
    loading,
    workflows,
    projects,
    refresh,
    handlePageChange,
    handleLimitChange,
  } = useWorkflowsLogic();
  const currentOrg = useStore((state) => state.currentOrg);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const columns = getWorkflowsTableColumns((workflow) => {
    // Handle workflow selection - can be implemented later
    console.log("Selected workflow:", workflow);
  });

  if (!currentOrg?.id) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Organization ID is required. Please select an organization.
        </AlertDescription>
      </Alert>
    );
  }

  // Full-page loading spinner
  if (loading && (!workflows || workflows.items.length === 0)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading workflows...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Workflows</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization&apos;s workflows and their processes.
        </p>
      </div>

      <Separator />

      {workflows?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No workflows available</p>
          <p className="text-sm text-muted-foreground">
            Create a workflow to get started
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4"
          >
            Create New Workflow
          </Button>
        </div>
      ) : (
        <WorkflowsDataTable
          columns={columns}
          data={workflows?.items || []}
          onCreateWorkflow={() => setIsCreateDialogOpen(true)}
          loading={loading}
          pagination={workflows?.meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
          </DialogHeader>
          <CreateWorkflowForm
            onClose={() => setIsCreateDialogOpen(false)}
            onWorkflowCreated={refresh}
            projects={projects}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
