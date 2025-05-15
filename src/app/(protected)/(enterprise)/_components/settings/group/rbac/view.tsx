"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, MinusCircle, CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Separator } from "@/app/_components/ui/separator";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";
import { Badge } from "@/app/_components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import useRBACLogic, { RoleFormValues } from "./logic";

interface Role {
  id: string;
  name: string;
  rolePermissions?: Array<{
    permission: {
      id: string;
      action: string;
      resourceType: string;
    };
  }>;
}

interface Permission {
  id: string;
  action: string;
  resourceType: string;
}

type ResourcePermissions = {
  [key: string]: Permission[];
};

export default function RBACView() {
  const { isLoading, roleSchema } = useRBACLogic();
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [resourcePermissions, setResourcePermissions] =
    React.useState<ResourcePermissions>({});
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >([]);
  const [isLoadingRoles, setIsLoadingRoles] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingPermissions, setEditingPermissions] = React.useState<string[]>(
    []
  );

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch all permissions
  React.useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("/api/permissions");
        const result = await response.json();

        if (result.success) {
          const permissionsData = result.data;
          setPermissions(permissionsData);

          // Group permissions by resource type using our new function
          setResourcePermissions(groupPermissionsByResource(permissionsData));
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
      }
    };

    fetchPermissions();
  }, []);

  // Fetch all roles
  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch("/api/roles");
        const result = await response.json();

        if (result.success) {
          setRoles(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSelectAllForResource = (
    resourceType: string,
    isSelected: boolean
  ) => {
    const permissionsForResource = resourcePermissions[resourceType] || [];
    const permissionIds = permissionsForResource.map((p) => p.id);

    if (isSelected) {
      // Add all permissions for this resource that aren't already selected
      setSelectedPermissions((prev) => [
        ...new Set([...prev, ...permissionIds]),
      ]);
    } else {
      // Remove all permissions for this resource
      setSelectedPermissions((prev) =>
        prev.filter((id) => !permissionIds.includes(id))
      );
    }
  };

  const isResourceFullySelected = (resourceType: string): boolean => {
    const permissionsForResource = resourcePermissions[resourceType] || [];
    if (permissionsForResource.length === 0) return false;

    return permissionsForResource.every((p) =>
      selectedPermissions.includes(p.id)
    );
  };

  const isResourcePartiallySelected = (resourceType: string): boolean => {
    const permissionsForResource = resourcePermissions[resourceType] || [];
    if (permissionsForResource.length === 0) return false;

    const hasSelected = permissionsForResource.some((p) =>
      selectedPermissions.includes(p.id)
    );

    return hasSelected && !isResourceFullySelected(resourceType);
  };

  const getResourceLabel = (action: string): string => {
    // Extract resource type from the prefixed format (e.g., "org:create" -> "Organization")
    const parts = action.split(":");

    if (parts.length === 2) {
      const resourcePrefix = parts[0].toLowerCase();

      switch (resourcePrefix) {
        case "org":
          return "Organization";
        case "team":
          return "Team";
        case "project":
          return "Project";
        case "workflow":
          return "Workflow";
        case "global":
          return "Global";
        default:
          return (
            resourcePrefix.charAt(0).toUpperCase() + resourcePrefix.slice(1)
          );
      }
    }

    // Fallback
    return "Unknown";
  };

  // Group permissions by resource based on the prefixed format
  const groupPermissionsByResource = (
    permissions: Permission[]
  ): ResourcePermissions => {
    const grouped: ResourcePermissions = {};

    permissions.forEach((permission) => {
      const resourceType =
        permission.resourceType || getResourceLabel(permission.action);

      if (!grouped[resourceType]) {
        grouped[resourceType] = [];
      }

      grouped[resourceType].push(permission);
    });

    return grouped;
  };

  const onSubmit = async (values: RoleFormValues) => {
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          permissions: selectedPermissions,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRoles((prev) => [...prev, result.data]);
        form.reset();
        setSelectedPermissions([]);
        toast.success("Role created successfully");
      } else {
        toast.error(result.error || "Failed to create role");
      }
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPermissionLabel = (action: string) => {
    // Handle the new prefixed format (e.g., "org:create" -> "Create")
    const parts = action.split(":");

    if (parts.length === 2) {
      // Just show the action part without the resource prefix
      const actionPart = parts[1];
      return actionPart
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    }

    // Fallback to the old format
    return action
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Group permissions by resource type for display
  const groupRolePermissionsByResource = (
    rolePermissions?: Array<{ permission: Permission }>
  ) => {
    if (!rolePermissions || rolePermissions.length === 0) return {};

    const grouped: Record<string, string[]> = {};

    rolePermissions.forEach((rp) => {
      const resourceType = rp.permission.resourceType || "Global";
      if (!grouped[resourceType]) {
        grouped[resourceType] = [];
      }
      grouped[resourceType].push(rp.permission.action);
    });

    return grouped;
  };

  // Custom Resource Header with Selection Status
  const ResourceHeader = ({ resourceType }: { resourceType: string }) => {
    const isFullySelected = isResourceFullySelected(resourceType);
    const isPartiallySelected = isResourcePartiallySelected(resourceType);

    return (
      <div className="flex items-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center">
          {isFullySelected ? (
            <CheckCircle2
              className="h-4 w-4 text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAllForResource(resourceType, false);
              }}
            />
          ) : isPartiallySelected ? (
            <MinusCircle
              className="h-4 w-4 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAllForResource(resourceType, true);
              }}
            />
          ) : (
            <div
              className="h-4 w-4 rounded-sm border border-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAllForResource(resourceType, true);
              }}
            />
          )}
        </div>
        <span>{getResourceTypeLabel(resourceType)}</span>
        <Badge variant="outline" className="ml-2">
          {resourcePermissions[resourceType].length}
        </Badge>
      </div>
    );
  };

  // Format resource type for display (e.g., "ResourceType" -> "Resource Type")
  const getResourceTypeLabel = (type: string): string => {
    return type === "Global"
      ? "Global Permissions"
      : type.replace(/([A-Z])/g, " $1").trim();
  };

  // Set up editing for a role
  const setupRoleEdit = (role: Role) => {
    // Prevent editing of super admin role
    if (role.name.toLowerCase() === "super admin") {
      toast.error("Super Admin role cannot be edited");
      return;
    }
    setEditingRole(role);
    setEditingPermissions(
      role.rolePermissions?.map((rp) => rp.permission.id) || []
    );
    setEditDialogOpen(true);
  };

  // Toggle permission in edit mode
  const toggleEditPermission = (permissionId: string) => {
    setEditingPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  // Select all permissions for a resource in edit mode
  const handleEditSelectAllForResource = (
    resourceType: string,
    isSelected: boolean
  ) => {
    const permissionsForResource = resourcePermissions[resourceType] || [];
    const permissionIds = permissionsForResource.map((p) => p.id);

    if (isSelected) {
      // Add all permissions for this resource that aren't already selected
      setEditingPermissions((prev) => [
        ...new Set([...prev, ...permissionIds]),
      ]);
    } else {
      // Remove all permissions for this resource
      setEditingPermissions((prev) =>
        prev.filter((id) => !permissionIds.includes(id))
      );
    }
  };

  // Check if resource is fully selected in edit mode
  const isResourceEditFullySelected = (resourceType: string): boolean => {
    const permissionsForResource = resourcePermissions[resourceType] || [];
    if (permissionsForResource.length === 0) return false;

    return permissionsForResource.every((p) =>
      editingPermissions.includes(p.id)
    );
  };

  // Check if resource is partially selected in edit mode
  const isResourceEditPartiallySelected = (resourceType: string): boolean => {
    const permissionsForResource = resourcePermissions[resourceType] || [];
    if (permissionsForResource.length === 0) return false;

    const hasSelected = permissionsForResource.some((p) =>
      editingPermissions.includes(p.id)
    );

    return hasSelected && !isResourceEditFullySelected(resourceType);
  };

  // Custom Resource Header for Edit Dialog
  const ResourceEditHeader = ({ resourceType }: { resourceType: string }) => {
    const isFullySelected = isResourceEditFullySelected(resourceType);
    const isPartiallySelected = isResourceEditPartiallySelected(resourceType);

    return (
      <div className="flex items-center gap-2">
        <div className="flex h-4 w-4 items-center justify-center">
          {isFullySelected ? (
            <CheckCircle2
              className="h-4 w-4 text-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditSelectAllForResource(resourceType, false);
              }}
            />
          ) : isPartiallySelected ? (
            <MinusCircle
              className="h-4 w-4 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                handleEditSelectAllForResource(resourceType, true);
              }}
            />
          ) : (
            <div
              className="h-4 w-4 rounded-sm border border-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleEditSelectAllForResource(resourceType, true);
              }}
            />
          )}
        </div>
        <span>{getResourceTypeLabel(resourceType)}</span>
        <Badge variant="outline" className="ml-2">
          {resourcePermissions[resourceType].length}
        </Badge>
      </div>
    );
  };

  // Save updated permissions
  const saveRolePermissions = async () => {
    if (!editingRole) return;

    try {
      setIsSubmitting(true);
      console.log(
        `Updating role: ${editingRole.id} with ${editingPermissions.length} permissions`
      );

      const response = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          permissions: editingPermissions,
        }),
        credentials: "include", // Include credentials for authentication
      });

      console.log(`Response status: ${response.status}`);
      const result = await response.json();
      console.log("Response data:", result);

      if (result.success) {
        // Update the role in the roles state
        setRoles((prev) =>
          prev.map((role) => (role.id === editingRole.id ? result.data : role))
        );
        setEditDialogOpen(false);
        setEditingRole(null);
        toast.success("Role permissions updated successfully");
      } else {
        toast.error(result.error || "Failed to update role permissions");
        console.error("API error details:", result.details);
      }
    } catch (error) {
      console.error("Failed to update role permissions:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Role Based Access Control
        </h2>
        <p className="text-muted-foreground">
          Manage roles and permissions for resources in your organization
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Role</CardTitle>
            <CardDescription>
              Add a new role with permissions for specific resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Admin, Editor, Viewer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <FormLabel>Resource Permissions</FormLabel>

                  {/* Display permissions grouped by resource */}
                  <Accordion type="multiple" className="w-full">
                    {Object.keys(resourcePermissions).length > 0 ? (
                      Object.keys(resourcePermissions).map((resourceType) => (
                        <AccordionItem key={resourceType} value={resourceType}>
                          <AccordionTrigger className="hover:no-underline">
                            <ResourceHeader resourceType={resourceType} />
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 pt-2">
                              {resourcePermissions[resourceType].map(
                                (permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={permission.id}
                                      checked={selectedPermissions.includes(
                                        permission.id
                                      )}
                                      onCheckedChange={() =>
                                        togglePermission(permission.id)
                                      }
                                    />
                                    <label
                                      htmlFor={permission.id}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {getPermissionLabel(permission.action)}
                                    </label>
                                  </div>
                                )
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm py-3 border rounded-md p-4">
                        No permissions available. Please check database setup.
                      </div>
                    )}
                  </Accordion>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading || isSubmitting || permissions.length === 0
                  }
                  className="w-full md:w-auto"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Role
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              Existing roles in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRoles ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading roles...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length > 0 ? (
                    roles.map((role) => {
                      const groupedPermissions = groupRolePermissionsByResource(
                        role.rolePermissions
                      );

                      return (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.name}
                          </TableCell>
                          <TableCell>
                            {Object.keys(groupedPermissions).length > 0 ? (
                              <div className="space-y-2">
                                {Object.entries(groupedPermissions).map(
                                  ([resourceType, actions]) => (
                                    <div
                                      key={resourceType}
                                      className="space-y-1"
                                    >
                                      <div className="text-xs font-medium text-muted-foreground">
                                        {getResourceTypeLabel(resourceType)}:
                                      </div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {actions.map((action) => (
                                          <span
                                            key={`${resourceType}-${action}`}
                                            className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-1 text-xs"
                                          >
                                            {getPermissionLabel(action)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No permissions assigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setupRoleEdit(role)}
                              disabled={
                                role.name.toLowerCase() === "super admin"
                              }
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        No roles found. Create your first role above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Role Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {editingRole?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto">
            <Accordion type="multiple" className="w-full">
              {Object.keys(resourcePermissions).length > 0 ? (
                Object.keys(resourcePermissions).map((resourceType) => (
                  <AccordionItem key={resourceType} value={resourceType}>
                    <AccordionTrigger className="hover:no-underline">
                      <ResourceEditHeader resourceType={resourceType} />
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6 pt-2">
                        {resourcePermissions[resourceType].map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`edit-${permission.id}`}
                              checked={editingPermissions.includes(
                                permission.id
                              )}
                              onCheckedChange={() =>
                                toggleEditPermission(permission.id)
                              }
                            />
                            <label
                              htmlFor={`edit-${permission.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {getPermissionLabel(permission.action)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="text-muted-foreground text-sm py-3 border rounded-md p-4">
                  No permissions available.
                </div>
              )}
            </Accordion>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRolePermissions} disabled={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
