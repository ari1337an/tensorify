"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrganization } from "@clerk/nextjs";
import { getTeams, type PaginatedTeams } from "@/server/actions/team-actions";

const LOADING_TIMEOUT = 10000; // 10 seconds

export function useTeamspacesLogic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<PaginatedTeams | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { organization } = useOrganization();
  const organizationId = organization?.id;

  // Fetch teams with pagination
  const fetchTeams = useCallback(async () => {
    console.log("Fetching teams with:", { organizationId, page, limit });

    if (!organizationId) {
      console.log("No organization ID, skipping fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Set up loading timeout
      const timeoutId = setTimeout(() => {
        console.log("Loading timeout reached");
        setLoading(false);
        setError("Request timed out. Please try again.");
      }, LOADING_TIMEOUT);

      console.log("Making API call to getTeams");
      const result = await getTeams({
        page,
        limit,
        organizationId,
      });

      // Clear timeout since we got a response
      clearTimeout(timeoutId);

      console.log("Got teams result:", result);
      setTeams(result);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err instanceof Error ? err.message : "Failed to load teams");
      setLoading(false);
    }
  }, [page, limit, organizationId]);

  // Load teams on mount and when pagination changes
  useEffect(() => {
    console.log("useEffect triggered with:", { organizationId, page, limit });
    fetchTeams();
  }, [fetchTeams]);

  // Handler for changing page
  const handlePageChange = (newPage: number) => {
    console.log("Changing page to:", newPage);
    setPage(newPage);
  };

  // Handler for changing items per page
  const handleLimitChange = (newLimit: number) => {
    console.log("Changing limit to:", newLimit);
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  return {
    teams,
    loading,
    error,
    page,
    limit,
    handlePageChange,
    handleLimitChange,
    refresh: fetchTeams,
  };
}

export default useTeamspacesLogic;
