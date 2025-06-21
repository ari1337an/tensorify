"use client";

import * as React from "react";
import { getWorkflow } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

// Types based on API responses
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

interface WorkflowContextType {
  workflows: WorkflowData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  selectWorkflow: (workflow: WorkflowData) => void;
  addWorkflowOptimistically: (
    workflow: Omit<WorkflowData, "id"> & { id?: string }
  ) => void;
}

const WorkflowContext = React.createContext<WorkflowContextType | undefined>(
  undefined
);

export function useWorkflows() {
  const context = React.useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error("useWorkflows must be used within a WorkflowProvider");
  }
  return context;
}

interface WorkflowProviderProps {
  children: React.ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const [workflows, setWorkflows] = React.useState<WorkflowData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const currentOrg = useStore((state) => state.currentOrg);
  const currentTeam = useStore((state) => state.currentTeam);
  const setCurrentWorkflow = useStore((state) => state.setCurrentWorkflow);

  const fetchWorkflows = React.useCallback(async () => {
    if (!currentOrg?.id || !currentTeam?.id) {
      setWorkflows([]);
      setCurrentWorkflow(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workflowsResponse = await getWorkflow({
        params: { orgId: currentOrg.id },
        query: { limit: 100 },
      });

      if (workflowsResponse.status === 200) {
        const workflowItems: WorkflowData[] = workflowsResponse.body.items;

        // Filter workflows by current team and sort by createdAt ascending (oldest first)
        const teamWorkflows = workflowItems
          .filter((workflow) => workflow.teamId === currentTeam.id)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        setWorkflows(teamWorkflows);

        // Set the first workflow (oldest) as the default current workflow
        if (teamWorkflows.length > 0) {
          setCurrentWorkflow(teamWorkflows[0]);
        } else {
          setCurrentWorkflow(null);
        }
      } else {
        // Handle different error statuses
        if (workflowsResponse.status === 401) {
          setError("Authentication required");
        } else if (workflowsResponse.status === 403) {
          setError("Access denied");
        } else if (workflowsResponse.status === 404) {
          setError("Organization not found");
        } else {
          setError("Failed to fetch workflows");
        }
        setCurrentWorkflow(null);
      }
    } catch (err) {
      console.error("Error fetching workflows:", err);
      setError("Failed to fetch workflows");
      setCurrentWorkflow(null);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, currentTeam?.id, setCurrentWorkflow]);

  // Fetch workflows when organization or team changes
  React.useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const selectWorkflow = React.useCallback(
    (workflow: WorkflowData) => {
      setCurrentWorkflow(workflow);
    },
    [setCurrentWorkflow]
  );

  // Optimistically add a workflow to local state
  const addWorkflowOptimistically = React.useCallback(
    (workflowData: Omit<WorkflowData, "id"> & { id?: string }) => {
      const optimisticWorkflow: WorkflowData = {
        id: workflowData.id || `temp-${Date.now()}`, // Use provided ID or generate temporary one
        name: workflowData.name,
        description: workflowData.description,
        projectId: workflowData.projectId,
        projectName: workflowData.projectName,
        teamId: workflowData.teamId,
        teamName: workflowData.teamName,
        organizationId: workflowData.organizationId,
        memberCount: workflowData.memberCount,
        createdAt: workflowData.createdAt || new Date().toISOString(),
      };

      setWorkflows((prevWorkflows) => [...prevWorkflows, optimisticWorkflow]);
    },
    []
  );

  const value: WorkflowContextType = {
    workflows,
    loading,
    error,
    refetch: fetchWorkflows,
    selectWorkflow,
    addWorkflowOptimistically,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}
