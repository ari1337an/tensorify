"use client";

import { useState, useEffect, useCallback } from "react";
import { getWorkflow, getProject } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

type WorkflowListItem = {
  id: string;
  name: string;
  description: string | null;
  projectId: string;
  projectName: string;
  teamId: string;
  teamName: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

type WorkflowListResponse = {
  items: WorkflowListItem[];
  meta: {
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
  };
};

type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  teamName: string;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

export const useWorkflowsLogic = () => {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState<WorkflowListResponse | null>(null);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const currentOrg = useStore((state) => state.currentOrg);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchProjects = useCallback(async () => {
    if (!currentOrg?.id) return;

    try {
      const response = await getProject({
        params: { orgId: currentOrg.id },
        query: { page: 1, limit: 100 }, // Get all projects
      });

      if (response.status === 200) {
        setProjects(response.body.items);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [currentOrg?.id]);

  const fetchWorkflows = useCallback(async () => {
    if (!currentOrg?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getWorkflow({
        params: {
          orgId: currentOrg.id,
        },
        query: {
          page,
          limit,
        },
      });

      if (response.status === 200) {
        setWorkflows(response.body);
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, page, limit]);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchWorkflows();
    }
  }, [fetchWorkflows, currentOrg?.id]);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchProjects();
    }
  }, [fetchProjects, currentOrg?.id]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    loading,
    workflows,
    projects,
    refresh: fetchWorkflows,
    handlePageChange,
    handleLimitChange,
  };
};

export default useWorkflowsLogic;
