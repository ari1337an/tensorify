import React, { useCallback } from "react";
import { TooltipProvider, TooltipTrigger } from "@/app/_components/ui/tooltip";
import useRBACLogic, {
  RoleFormValues,
  RoleType,
  PermissionType,
} from "./logic";
import { PermissionAssignment } from "@/app/api/v1/_contracts/schema";
import { toast } from "sonner";

export default function RBACView() {
  const { createRole, updateRole } = useRBACLogic();

  const watchedPermissions = form.watch("permissions");

  const [resourcePermissions, setResourcePermissions] =
    React.useState<ResourcePermissions>({});
  const [editingRole, setEditingRole] = React.useState<RoleType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingPermissions, setEditingPermissions] = React.useState<
    PermissionType[]
  >([]);

  const groupPermissionsByResource = useCallback(
    (permissionsList: PermissionType[]): ResourcePermissions => {
      return permissionsList.reduce((acc, p) => {
        const resource = p.action.split(":")[0] || "General";
        acc[resource].push(p);
        return acc;
      }, {} as ResourcePermissions);
    },
    []
  );

  const groupRolePermissionsByResource = (
    rolePermissions: PermissionAssignment[]
  ) => {
    return rolePermissions.reduce(
      (acc, p) => {
        const permDetail = permissions.find((pd) => pd.id === p.permissionId);
        if (permDetail) {
          const resource = permDetail.action.split(":")[0] || "General";
          if (!acc[resource]) {
            acc[resource] = [];
          }
          acc[resource].push(permDetail);
        }
        return acc;
      },
      {} as { [key: string]: PermissionType[] }
    );
  };

  const setupRoleEdit = (role: RoleType) => {
    if (role.name.toLowerCase() === "super admin") {
      toast.error("Super Admin role cannot be edited.");
      return;
    }

    setEditingRole(role);
    setEditDialogOpen(true);
    setEditingPermissions(role.permissions || []);
  };

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {role.permissions && role.permissions.length > 0 ? (
        Object.entries(groupRolePermissionsByResource(role.permissions)).map(
          ([resource, perms]) => (
            <div key={resource}>
              <h4 className="font-semibold text-sm mb-2 capitalize">
                {resource}
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {perms.map((perm) => (
                  <span key={perm.id} className="text-xs text-muted-foreground">
                    {perm.name}
                  </span>
                ))}
              </div>
            </div>
          )
        )
      ) : (
        <p className="text-sm text-muted-foreground">No permissions assigned</p>
      )}
    </div>
  );
}
