"use client";

import * as React from "react";
import { Controller } from "react-hook-form";
import { MinusCircle, CheckCircle2, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import useRBACLogic, {
  RoleFormValues,
  RoleType,
  PermissionType,
} from "./logic";
import { useCallback } from "react";
import { Label } from "@/app/_components/ui/label";

type ResourcePermissions = {
  [key: string]: PermissionType[];
};

type PermissionAssignmentType = {
  permissionId: string;
  type: "ALLOW" | "DENY";
};

export default function RBACView() {
  const {
    form,
    roles,
    permissions,
    isLoading,
    isSubmitting,
    createRole,
    updateRole,
  } = useRBACLogic();

  const watchedPermissions = form.watch("permissions");

  const [resourcePermissions, setResourcePermissions] =
    React.useState<ResourcePermissions>({});
  const [editingRole, setEditingRole] = React.useState<RoleType | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [editingDescription, setEditingDescription] = React.useState("");
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingPermissions, setEditingPermissions] = React.useState<
    PermissionAssignmentType[]
  >([]);

  const groupPermissionsByResource = useCallback(
    (permissionsList: PermissionType[]): ResourcePermissions => {
      return permissionsList.reduce((acc, p: PermissionType) => {
        const resource = p.action.split(":")[0] || "General";
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(p);
        return acc;
      }, {} as ResourcePermissions);
    },
    []
  );

  React.useEffect(() => {
    if (permissions.length > 0) {
      setResourcePermissions(groupPermissionsByResource(permissions));
        }
  }, [permissions, groupPermissionsByResource]);

  const handleSelectAllForResource = (
    resourceType: string,
    isSelected: boolean,
    isEditMode = false
  ) => {
    const permissionIdsForResource = (
      resourcePermissions[resourceType] || []
    ).map((p: PermissionType) => ({
      permissionId: p.id,
      type: "ALLOW" as const,
    }));

    if (isEditMode) {
      const currentPermissions = editingPermissions;
    if (isSelected) {
        const newPermissions = [
          ...currentPermissions,
          ...permissionIdsForResource,
        ].filter(
          (value, index, self) =>
            index ===
            self.findIndex((t) => t.permissionId === value.permissionId)
        );
        setEditingPermissions(newPermissions);
      } else {
        const newPermissions = currentPermissions.filter(
          (p: PermissionAssignmentType) =>
            !permissionIdsForResource.some(
              (resP) => resP.permissionId === p.permissionId
            )
        );
        setEditingPermissions(newPermissions);
      }
    } else {
      const currentPermissions = form.getValues("permissions") || [];
      if (isSelected) {
        const newPermissions = [
          ...currentPermissions,
          ...permissionIdsForResource,
        ].filter(
          (value, index, self) =>
            index ===
            self.findIndex((t) => t.permissionId === value.permissionId)
        );
        form.setValue("permissions", newPermissions, { shouldDirty: true });
      } else {
        const newPermissions = currentPermissions.filter(
          (p: PermissionAssignmentType) =>
            !permissionIdsForResource.some(
              (resP) => resP.permissionId === p.permissionId
            )
        );
        form.setValue("permissions", newPermissions, { shouldDirty: true });
      }
    }
  };

  const isResourceFullySelected = (
    resourceType: string,
    isEditMode = false
  ): boolean => {
    const permissionIds = (resourcePermissions[resourceType] || []).map(
      (p: PermissionType) => p.id
    );
    const selectedIds = (
      isEditMode ? editingPermissions : watchedPermissions || []
    ).map((p: PermissionAssignmentType) => p.permissionId);
    if (permissionIds.length === 0) return false;
    return permissionIds.every((id) => selectedIds.includes(id));
  };

  const isResourcePartiallySelected = (
    resourceType: string,
    isEditMode = false
  ): boolean => {
    const permissionIds = (resourcePermissions[resourceType] || []).map(
      (p: PermissionType) => p.id
    );
    const selectedIds = (
      isEditMode ? editingPermissions : watchedPermissions || []
    ).map((p: PermissionAssignmentType) => p.permissionId);
    if (permissionIds.length === 0) return false;
    const hasSelected = permissionIds.some((id) => selectedIds.includes(id));
    return hasSelected && !isResourceFullySelected(resourceType, isEditMode);
  };

  const onSubmit = async (values: RoleFormValues) => {
    await createRole(values);
  };

  const getPermissionLabel = (action: string) => {
    const actionName = action.split(":").pop() || action;
    return actionName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const groupRolePermissionsByResource = (
    rolePermissions: PermissionAssignmentType[]
  ) => {
    return rolePermissions.reduce(
      (acc, p: PermissionAssignmentType) => {
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
    setEditingName(role.name);
    setEditingDescription(role.description || "");
    setEditingPermissions(role.permissions || []);
    setEditDialogOpen(true);
  };

  const saveRolePermissions = async () => {
    if (!editingRole) return;

    const nameChanged = editingName !== editingRole.name;
    const descriptionChanged =
      editingDescription !== (editingRole.description || "");

    const originalPermissions = new Set(
      editingRole.permissions.map(
        (p: PermissionAssignmentType) => p.permissionId
      )
    );
    const newPermissions = new Set(
      editingPermissions.map((p: PermissionAssignmentType) => p.permissionId)
    );

    const addPermissions = editingPermissions.filter(
      (p: PermissionAssignmentType) => !originalPermissions.has(p.permissionId)
    );
    const removePermissions = editingRole.permissions.filter(
      (p: PermissionAssignmentType) => !newPermissions.has(p.permissionId)
    );
    const permissionsChanged =
      addPermissions.length > 0 || removePermissions.length > 0;

    if (!nameChanged && !descriptionChanged && !permissionsChanged) {
      toast.info("No changes to save.");
      setEditDialogOpen(false);
      return;
    }

    await updateRole(editingRole.id, {
      name: nameChanged ? editingName : undefined,
      description: descriptionChanged ? editingDescription : undefined,
      addPermissions: addPermissions.length > 0 ? addPermissions : undefined,
      removePermissions:
        removePermissions.length > 0 ? removePermissions : undefined,
    });

    setEditDialogOpen(false);
  };

  const toggleEditPermission = (permissionId: string) => {
    setEditingPermissions((prev) => {
      const exists = prev.some(
        (p: PermissionAssignmentType) => p.permissionId === permissionId
      );
      if (exists) {
        return prev.filter(
          (p: PermissionAssignmentType) => p.permissionId !== permissionId
        );
      } else {
        return [...prev, { permissionId, type: "ALLOW" }];
    }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Role Based Access Control</h3>
        <p className="text-sm text-muted-foreground">
          Manage roles and permissions for resources in your organization.
        </p>
        <Separator className="my-4" />
      </div>

        <Card>
          <CardHeader>
          <CardTitle>Create a New Role</CardTitle>
            <CardDescription>
            Define a new role and assign permissions to it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name</FormLabel>
                      <FormControl>
                      <Input placeholder="e.g., Content Editor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A brief description of the role's purpose."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <FormItem>
                <FormLabel>Permissions</FormLabel>
                <FormDescription>
                  Select the permissions to assign to this role.
                </FormDescription>
                  <Accordion type="multiple" className="w-full">
                  {Object.entries(resourcePermissions).map(
                    ([resource, perms]: [string, PermissionType[]]) => (
                      <AccordionItem key={resource} value={resource}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-5 w-5 items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectAllForResource(
                                  resource,
                                  !isResourceFullySelected(resource, false),
                                  false
                                );
                              }}
                            >
                              {isResourceFullySelected(resource, false) ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : isResourcePartiallySelected(
                                  resource,
                                  false
                                ) ? (
                                <MinusCircle className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <div className="h-4 w-4 rounded-sm border border-primary" />
                              )}
                            </div>
                            <span className="font-medium">
                              {resource.charAt(0).toUpperCase() +
                                resource.slice(1)}
                            </span>
                          </div>
                          </AccordionTrigger>
                          <AccordionContent>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                            <Controller
                              name="permissions"
                              control={form.control}
                              render={({ field }) => (
                                <>
                                  {perms.map((p: PermissionType) => (
                                    <FormItem
                                      key={p.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                      <FormControl>
                                        <Checkbox
                                          checked={(field.value || []).some(
                                            (val: PermissionAssignmentType) =>
                                              val.permissionId === p.id
                                      )}
                                          onCheckedChange={(checked) => {
                                            const currentValues =
                                              field.value || [];
                                            const newValues = checked
                                              ? [
                                                  ...currentValues,
                                                  {
                                                    permissionId: p.id,
                                                    type: "ALLOW" as const,
                                                  },
                                                ]
                                              : currentValues.filter(
                                                  (
                                                    val: PermissionAssignmentType
                                                  ) => val.permissionId !== p.id
                                                );
                                            field.onChange(newValues);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {getPermissionLabel(p.action)}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </>
                              )}
                            />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                    )
                    )}
                  </Accordion>
                <FormMessage />
              </FormItem>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                  Create Role
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

      <div>
        <h3 className="text-xl font-semibold">Manage Roles</h3>
        <Separator className="my-4" />
      </div>

        <Card>
          <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
            <CardDescription>
            View and manage existing roles and their permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
          <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {roles.map((role) => (
                        <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      <Tooltip>
                        <TooltipTrigger>
                          {role.description
                            ? role.description.length > 30
                              ? `${role.description.substring(0, 30)}...`
                              : role.description
                            : "No description"}
                        </TooltipTrigger>
                        {role.description && role.description.length > 30 && (
                          <TooltipContent>
                            <p>{role.description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                          </TableCell>
                          <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-accent"
                          >
                            {role.permissions?.length || 0} permissions
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="w-90 p-4">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <h3 className="font-bold leading-none text-lg">
                                {role.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                All permissions assigned to this role.
                              </p>
                                      </div>
                            <Separator />
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {role.permissions &&
                              role.permissions.length > 0 ? (
                                Object.entries(
                                  groupRolePermissionsByResource(
                                    role.permissions
                                  )
                                ).map(
                                  ([resource, perms]: [
                                    string,
                                    PermissionType[],
                                  ]) => (
                                    <div key={resource}>
                                      <h4 className="font-semibold text-sm mb-2 capitalize">
                                        {resource}
                                      </h4>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                        {perms.map((perm: PermissionType) => (
                                          <span
                                            key={perm.id}
                                            className="text-xs text-muted-foreground"
                                          >
                                            {getPermissionLabel(perm.action)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No permissions assigned.
                                </p>
                                )}
                              </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                          </TableCell>
                    <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setupRoleEdit(role)}
                        disabled={role.name.toLowerCase() === "super admin"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                ))}
                </TableBody>
              </Table>
          </TooltipProvider>
          </CardContent>
        </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
            <DialogDescription>
              Modify the name, description, and permissions for this role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          <div className="py-2 max-h-[45vh] overflow-y-auto">
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={Object.keys(resourcePermissions)}
            >
              {Object.entries(resourcePermissions).map(
                ([resource, perms]: [string, PermissionType[]]) => (
                  <AccordionItem key={`edit-${resource}`} value={resource}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-5 w-5 items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAllForResource(
                              resource,
                              !isResourceFullySelected(resource, true),
                              true
                            );
                          }}
                        >
                          {isResourceFullySelected(resource, true) ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : isResourcePartiallySelected(resource, true) ? (
                            <MinusCircle className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <div className="h-4 w-4 rounded-sm border border-primary" />
                          )}
                        </div>
                        <span className="font-medium">
                          {resource.charAt(0).toUpperCase() + resource.slice(1)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                        {perms.map((p: PermissionType) => (
                          <div
                            key={`edit-${p.id}`}
                            className="flex flex-row items-center space-x-3 space-y-0"
                          >
                            <Checkbox
                              checked={editingPermissions.some(
                                (val: PermissionAssignmentType) =>
                                  val.permissionId === p.id
                              )}
                              onCheckedChange={() => toggleEditPermission(p.id)}
                              id={`edit-checkbox-${p.id}`}
                            />
                            <label
                              htmlFor={`edit-checkbox-${p.id}`}
                              className="font-normal"
                            >
                              {getPermissionLabel(p.action)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRolePermissions} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
