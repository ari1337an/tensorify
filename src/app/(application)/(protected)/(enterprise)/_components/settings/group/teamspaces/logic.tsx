"use client";

import { useState, useEffect, useCallback } from "react";
// import { getTeams, type PaginatedTeams } from "@/server/actions/team-actions";
import useStore from "@/app/_store/store";

export function useTeamspacesLogic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const [teams, setTeams] = useState<any>(null);
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

      // const result = await getTeams({
      //   page,
      //   limit,
      //   organizationId,
      // });

      // // Check if the result has a totalCount property and set accordingly
      // if (result && typeof result.totalCount === "number") {
      //   // Only set isEmpty if there are no teams at all in the database
      //   setIsEmpty(result.totalCount === 0);
      //   setTeams(result);
      // } else {
      //   // Handle malformed response
      //   setError("Received invalid data format from server");
      //   setIsEmpty(true);
      // }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err instanceof Error ? err.message : "Failed to load teams");
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
