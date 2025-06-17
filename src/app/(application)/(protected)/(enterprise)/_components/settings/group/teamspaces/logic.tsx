"use client";

import { useState, useEffect, useCallback } from "react";
import { getTeam } from "@/app/api/v1/_client/client";
import useStore from "@/app/_store/store";

type TeamListItem = {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  memberCount: number;
  createdAt: string;
};

type TeamListResponse = {
  items: TeamListItem[];
  meta: {
    totalCount: number;
    page: number;
    size: number;
    totalPages: number;
  };
};

export function useTeamspacesLogic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<TeamListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isEmpty, setIsEmpty] = useState(false);

  // Get organization ID from the global store instead of Clerk
  const { currentOrg } = useStore();
  const organizationId = currentOrg?.id;

  // Fetch teams with pagination
  const fetchTeams = useCallback(async () => {
    if (!organizationId) {
      console.log("No organization ID from store, skipping fetch");
      setLoading(false);
      setIsEmpty(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsEmpty(false);

      const result = await getTeam({
        params: { orgId: organizationId },
        query: { page, limit },
      });

      if (result.status === 200) {
        // Only set isEmpty if there are no teams at all in the database
        setIsEmpty(result.body.meta.totalCount === 0);
        setTeams(result.body);
      } else {
        // Handle error response
        setError(result.body.message || "Failed to load teams");
        setIsEmpty(true);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err instanceof Error ? err.message : "Failed to load teams");
      setLoading(false);
    }
  }, [page, limit, organizationId]);

  // Load teams when currentOrg, page or limit changes
  useEffect(() => {
    // Only fetch if we have an organization ID
    if (organizationId) {
      fetchTeams();
    }
  }, [fetchTeams, organizationId]);

  // Handler for changing page
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handler for changing items per page
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    teams,
    loading,
    error,
    isEmpty,
    page,
    limit,
    handlePageChange,
    handleLimitChange,
    refresh: fetchTeams,
    organizationId, // Expose organizationId for debugging
  };
}

export default useTeamspacesLogic;
