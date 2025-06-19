"use client";

import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { ProjectsDataTable } from "./data-table";
import { getProjectsTableColumns } from "./columns";
import { useProjectsLogic } from "./logic";
import { Loader2 } from "lucide-react";
import useStore from "@/app/_store/store";

export default function ProjectsView() {
  const { loading, projects } = useProjectsLogic();
  const currentOrg = useStore((state) => state.currentOrg);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProjectsDataTable columns={columns} data={projects} loading={loading} />
  );
}
