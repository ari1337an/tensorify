"use client";

import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getRoles,
  postRoles,
  patchRole,
  getPermissions,
} from "@/app/api/v1/_client/client";
import {
  CreateRoleRequest,
  Permission,
  PermissionAssignment,
  Role,
} from "@/app/api/v1/_contracts/schema";
import useStore from "@/app/_store/store";

// --- Zod Schemas ---
// Allow optional description, but if user types only whitespace, treat as undefined
const roleFormSchema = CreateRoleRequest.omit({
  resourceId: true,
  resourceType: true,
}).extend({
  description: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val.trim() === ""
          ? undefined
          : val.trim()
        : val,
    z
      .string()
      .min(1, "Description is required")
      .max(100, "Description must be less than 100 characters")
      .optional()
  ),
});
export type RoleFormValues = z.infer<typeof roleFormSchema>;
export type RoleType = z.infer<typeof Role>;
export type PermissionType = z.infer<typeof Permission>;
export type PermissionAssignmentType = z.infer<typeof PermissionAssignment>;

// --- Custom Hook for RBAC Logic ---
export default function useRBACLogic() {
  const { currentOrg } = useStore();
  const [roles, setRoles] = React.useState<RoleType[]>([]);
  const [permissions, setPermissions] = React.useState<PermissionType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  const fetchInitialData = React.useCallback(async () => {
    if (!currentOrg?.id) return;

    try {
      setIsLoading(true);
      const [rolesRes, permissionsRes] = await Promise.all([
        getRoles({
          query: {
            resourceType: "ORGANIZATION",
            resourcePath: `org:${currentOrg.id}`,
          },
        }),
        getPermissions({}),
      ]);

      if (rolesRes.status === 200) {
        setRoles(rolesRes.body);
      } else {
        toast.error("Failed to fetch roles.");
        console.error(rolesRes.body);
      }

      if (permissionsRes.status === 200) {
        setPermissions(permissionsRes.body);
      } else {
        toast.error("Failed to fetch permissions.");
        console.error(permissionsRes.body);
      }
    } catch (error) {
      toast.error("An error occurred while fetching data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const createRole = async (values: RoleFormValues) => {
    if (!currentOrg?.id) {
      toast.error("No organization selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await postRoles({
        body: {
          ...values,
          resourceId: currentOrg.id,
          resourceType: "ORGANIZATION",
        },
      });

      if (response.status === 201) {
        toast.success("Role created successfully!");
        setRoles((prev) => [...prev, response.body]);
        form.reset();
      } else {
        toast.error(response.body.message || "Failed to create role.");
        console.error(response.body);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRole = async (
    roleId: string,
    payload: {
      name?: string;
      description?: string | null;
      addPermissions?: PermissionAssignmentType[];
      removePermissions?: PermissionAssignmentType[];
    }
  ) => {
    setIsSubmitting(true);
    try {
      const result = await patchRole({
        params: { roleId },
        body: {
          name: payload.name,
          description: payload.description ?? undefined,
          addPermissions: payload.addPermissions,
          removePermissions: payload.removePermissions,
        },
      });

      if (result.status === 200) {
        toast.success("Role updated successfully!");
        fetchInitialData(); // Refresh data
      } else {
        const errorBody = result.body as { message: string };
        toast.error(`Failed to update role: ${errorBody.message}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating the role.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    roles,
    permissions,
    isLoading,
    isSubmitting,
    createRole,
    updateRole,
  };
}
