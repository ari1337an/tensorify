"use client";

import { useState, useEffect, useCallback } from "react";
import { getProject, getTeam } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

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

type ProjectListResponse = {
  items: ProjectListItem[];
  meta: {
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
  };
};

type TeamListItem = {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

export const useProjectsLogic = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectListResponse | null>(null);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const currentOrg = useStore((state) => state.currentOrg);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchTeams = useCallback(async () => {
    if (!currentOrg?.id) return;

    try {
      const response = await getTeam({
        params: { orgId: currentOrg.id },
        query: { page: 1, limit: 100 }, // Get all teams
      });

      if (response.status === 200) {
        setTeams(response.body.items);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }, [currentOrg?.id]);

  const fetchProjects = useCallback(async () => {
    if (!currentOrg?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getProject({
        params: {
          orgId: currentOrg.id,
        },
        query: {
          page,
          limit,
        },
      });

      if (response.status === 200) {
        setProjects(response.body);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id, page, limit]);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchProjects();
    }
  }, [fetchProjects, currentOrg?.id]);

  useEffect(() => {
    if (currentOrg?.id) {
      fetchTeams();
    }
  }, [fetchTeams, currentOrg?.id]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    loading,
    projects,
    teams,
    refresh: fetchProjects,
    handlePageChange,
    handleLimitChange,
  };
};

export default useProjectsLogic;
