"use client";

import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { ProjectsDataTable } from "./data-table";
import { getProjectsTableColumns } from "./columns";
import { useProjectsLogic } from "./logic";
import { Loader2 } from "lucide-react";
import useStore from "@/app/_store/store";
import { Button } from "@/app/_components/ui/button";
import { useState } from "react";
import { CreateProjectForm } from "./create-project-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Separator } from "@/app/_components/ui/separator";

export default function ProjectsView() {
  const {
    loading,
    projects,
    teams,
    refresh,
    handlePageChange,
    handleLimitChange,
  } = useProjectsLogic();
  const currentOrg = useStore((state) => state.currentOrg);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const columns = getProjectsTableColumns((project) => {
    // Handle project selection - can be implemented later
    console.log("Selected project:", project);
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

  // Full-page loading spinner (like teamspaces)
  if (loading && (!projects || projects.items.length === 0)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Projects</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization&apos;s projects and their members.
        </p>
      </div>

      <Separator />

      {projects?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No projects available</p>
          <p className="text-sm text-muted-foreground">
            Create a project to get started
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4"
          >
            Create New Project
          </Button>
        </div>
      ) : (
        <ProjectsDataTable
          columns={columns}
          data={projects?.items || []}
          onCreateProject={() => setIsCreateDialogOpen(true)}
          loading={loading}
          pagination={projects?.meta}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <CreateProjectForm
            onClose={() => setIsCreateDialogOpen(false)}
            onProjectCreated={refresh}
            teams={teams}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
