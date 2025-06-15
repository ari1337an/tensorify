"use client";

import * as React from "react";
import { PeopleListEntry } from "./columns";
import { getOrganizationUsers } from "@/app/api/v1/_client/client";
import { toast } from "sonner";

interface UsePeopleLogicProps {
  organizationId: string;
}

export function usePeopleLogic({ organizationId }: UsePeopleLogicProps) {
  const [teamMembers, setTeamMembers] = React.useState<PeopleListEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchMembers = React.useCallback(
    async (page: number = 1, limit: number = 20) => {
      if (!organizationId) {
        setError("Organization ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getOrganizationUsers({
          params: { orgId: organizationId },
          query: { page, limit },
        });

        if (response.status === 200) {
          const { items, meta } = response.body;

          // Transform API response to match PeopleListEntry format
          const transformedMembers: PeopleListEntry[] = items.map((user) => ({
            id: user.userId,
            type: "member" as const,
            name: `${user.firstName} ${user.lastName}`.trim() || null,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            imageUrl: user.imageUrl,
            roles: user.roles.map((role) => ({
              id: role.id,
              name: role.name,
            })),
            status: user.status === "active" ? "Active" : "Pending",
            organizationId,
            userId: user.userId,
          }));

          setTeamMembers(transformedMembers);
          setPagination({
            page: meta.page,
            limit: meta.size,
            totalCount: meta.totalCount,
            totalPages: meta.totalPages,
          });
        } else {
          const errorMessage =
            response.body?.message || "Failed to fetch organization members";
          setError(errorMessage);
          toast.error("Failed to load members", {
            description: errorMessage,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        toast.error("Error loading members", {
          description: errorMessage,
        });
        console.error("Error fetching organization members:", err);
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  // Initial fetch
  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handlePageChange = (newPage: number) => {
    fetchMembers(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit: number) => {
    fetchMembers(1, newLimit); // Reset to page 1 when changing limit
  };

  const refreshMembers = () => {
    fetchMembers(pagination.page, pagination.limit);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    // TODO: Implement API call to update user role
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === userId
          ? { ...member, roles: [{ id: newRole, name: newRole }] }
          : member
      )
    );
    console.log(`Changed role for user ${userId} to ${newRole}`);
    toast.success("Role updated", {
      description: `User role has been updated to ${newRole}`,
    });
  };

  const handleInvite = () => {
    // TODO: Implement invite functionality
    console.log("Opening invite dialog");
  };

  return {
    teamMembers,
    loading,
    error,
    pagination,
    handleRoleChange,
    handleInvite,
    handlePageChange,
    handleLimitChange,
    refreshMembers,
    fetchMembers,
  };
}

export default usePeopleLogic;
