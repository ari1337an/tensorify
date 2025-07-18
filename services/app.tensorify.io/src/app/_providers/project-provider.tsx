"use client";

import * as React from "react";
import { getProject, getWorkflow } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

// Types based on API responses
type ProjectData = {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  teamName: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

type WorkflowData = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

// Transform data into the structure expected by ProjectsSection
type ProjectWithWorkflows = {
  id: string;
  name: string;
  workflows: string[];
};

interface ProjectContextType {
  projects: ProjectWithWorkflows[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refresh: () => void;
  addWorkflowOptimistically: (projectId: string, workflowName: string) => void;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(
  undefined
);

export function useProjects() {
  const context = React.useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}

interface ProjectProviderProps {
  children: React.ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = React.useState<ProjectWithWorkflows[]>([]);
  const [loading, setLoading] = React.useState(true); // Start with loading true
  const [error, setError] = React.useState<string | null>(null);

  const currentOrg = useStore((state) => state.currentOrg);
  const currentTeam = useStore((state) => state.currentTeam);

  const fetchData = React.useCallback(async () => {
    if (!currentOrg?.id || !currentTeam?.id) {
      setProjects([]);
      setLoading(false); // Stop loading when no org/team
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch both projects and workflows for the organization
      const [projectsResponse, workflowsResponse] = await Promise.all([
        getProject({
          params: { orgId: currentOrg.id },
          query: { limit: 100 }, // Get more items to avoid pagination issues
        }),
        getWorkflow({
          params: { orgId: currentOrg.id },
          query: { limit: 100 }, // Get more items to avoid pagination issues
        }),
      ]);

      if (projectsResponse.status === 200 && workflowsResponse.status === 200) {
        const projectItems: ProjectData[] = projectsResponse.body.items;
        const workflowItems: WorkflowData[] = workflowsResponse.body.items;

        // Filter projects by current team
        const teamProjects = projectItems.filter(
          (project) => project.teamId === currentTeam.id
        );

        // Filter workflows by current team and group by project
        const teamWorkflows = workflowItems.filter(
          (workflow) => workflow.teamId === currentTeam.id
        );

        // Group workflows by project
        const workflowsByProject = teamWorkflows.reduce(
          (acc, workflow) => {
            if (!acc[workflow.projectId]) {
              acc[workflow.projectId] = [];
            }
            // Check for duplicate workflow names in the same project
            if (!acc[workflow.projectId].includes(workflow.name)) {
              acc[workflow.projectId].push(workflow.name);
            }
            return acc;
          },
          {} as Record<string, string[]>
        );

        // Include all projects, even those without workflows
        const projectsWithWorkflows: ProjectWithWorkflows[] = teamProjects.map(
          (project) => ({
            id: project.id,
            name: project.name,
            workflows: workflowsByProject[project.id] || [],
          })
        );

        setProjects(projectsWithWorkflows);
      } else {
        // Handle different error statuses
        if (
          projectsResponse.status === 401 ||
          workflowsResponse.status === 401
        ) {
          setError("Authentication required");
        } else if (
          projectsResponse.status === 403 ||
          workflowsResponse.status === 403
        ) {
          setError("Access denied");
        } else if (
          projectsResponse.status === 404 ||
          workflowsResponse.status === 404
        ) {
          setError("Organization not found");
        } else {
          setError("Failed to fetch projects or workflows");
        }
      }
    } catch (err) {
      console.error("Error fetching projects and workflows:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, currentTeam?.id]);

  // Fetch data when organization or team changes
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optimistically add a workflow to local state
  const addWorkflowOptimistically = React.useCallback(
    (projectId: string, workflowName: string) => {
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId
            ? { ...project, workflows: [...project.workflows, workflowName] }
            : project
        )
      );
    },
    []
  );

  const value: ProjectContextType = {
    projects,
    loading,
    error,
    refetch: fetchData,
    refresh: () => {
      fetchData();
    },
    addWorkflowOptimistically,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
