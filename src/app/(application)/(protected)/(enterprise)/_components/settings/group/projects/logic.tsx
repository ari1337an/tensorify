"use client";

import { useState, useEffect, useCallback } from "react";
import { getProject, postProject } from "@/app/api/v1/_client/client";
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

export const useProjectsLogic = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const currentOrg = useStore((state) => state.currentOrg);

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
      });

      if (response.status === 200) {
        setProjects(response.body.items);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [currentOrg?.id]);

  const createProject = useCallback(
    async (data: { name: string; description: string; teamId: string }) => {
      if (!currentOrg?.id) return;

      try {
        const response = await postProject({
          body: {
            name: data.name,
            description: data.description,
            teamId: data.teamId,
          },
        });

        if (response.status === 201) {
          await fetchProjects();
        }
      } catch (error) {
        console.error("Error creating project:", error);
        throw error;
      }
    },
    [currentOrg?.id, fetchProjects]
  );

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    loading,
    projects,
    createProject,
  };
};

export default useProjectsLogic;
