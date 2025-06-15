"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { getPeopleTableColumns, PeopleListEntry } from "./columns";
import { Button } from "@/app/_components/ui/button";
import { Loader2, UserPlus, Check, ChevronsUpDown, X } from "lucide-react";
import { Separator } from "@/app/_components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/app/_components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Badge } from "@/app/_components/ui/badge";
import { cn } from "@/app/_lib/utils";
import { EditPersonDialog } from "./EditPersonDialog";
import { getRoles } from "@/app/api/v1/_client/client";
import { usePeopleLogic } from "./logic";
import { toast } from "sonner";

type Role = {
  id: string;
  name: string;
};

export default function PeopleView({
  organizationId,
}: {
  organizationId: string;
}) {
  const {
    teamMembers,
    loading,
    error,
    pagination,
    handleRoleChange,
    handleInvite,
    handlePageChange,
    handleLimitChange,
    refreshMembers,
  } = usePeopleLogic({ organizationId });

  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [canSendInvite, setCanSendInvite] = useState(false);
  const [inviteCheckMessage, setInviteCheckMessage] = useState<string | null>(
    null
  );

  // State for EditPersonDialog
  const [isEditPersonDialogOpen, setIsEditPersonDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<{
    id: string;
    type: "member" | "invitation";
  } | null>(null);

  const handleOpenEditPersonDialog = (
    personId: string,
    personType: "member" | "invitation"
  ) => {
    setEditingPerson({ id: personId, type: personType });
    setIsEditPersonDialogOpen(true);
  };

  const handleCloseEditPersonDialog = () => {
    setIsEditPersonDialogOpen(false);
    setEditingPerson(null);
  };

  useEffect(() => {
    async function loadRoles() {
      try {
        setRolesLoading(true);
        const response = await getRoles({
          query: {
            resourceType: "ORGANIZATION",
            resourcePath: organizationId,
          },
        });
        if (response.status === 200 && response.body) {
          setRoles(
            response.body.map((role) => ({
              id: role.id,
              name: role.name,
            }))
          );
        } else {
          toast.error("Failed to load roles", {
            description: "Could not fetch available roles for invitations.",
          });
        }
      } catch (err) {
        console.error("Failed to load roles:", err);
        toast.error("Failed to load roles", {
          description: "An error occurred while fetching roles.",
        });
      } finally {
        setRolesLoading(false);
      }
    }

    loadRoles();
  }, [organizationId]);

  useEffect(() => {
    if (!inviteEmail) {
      setCanSendInvite(false);
      setInviteCheckMessage(null);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setCanSendInvite(false);
      setInviteCheckMessage("Please enter a valid email address.");
      return;
    }

    setInviteCheckMessage("Checking eligibility...");

    const checkEmailEligibility = async () => {
      if (!organizationId) {
        setCanSendInvite(false);
        setInviteCheckMessage("Organization information is missing.");
        return;
      }
      // TODO: Implement canInviteUser API call
      // For now, just allow all valid emails
      setCanSendInvite(true);
      setInviteCheckMessage(null);
    };

    const handler = setTimeout(() => {
      checkEmailEligibility();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inviteEmail, organizationId]);

  const handleInviteSubmit = async () => {
    if (!inviteEmail || selectedRoles.length === 0 || !canSendInvite) {
      return;
    }

    try {
      setIsInviting(true);
      // TODO: Implement createInvitation API call
      toast.success("Invitation sent", {
        description: `Invitation has been sent to ${inviteEmail}`,
      });

      setInviteEmail("");
      setSelectedRoles([]);
      setIsInviteDialogOpen(false);
      refreshMembers(); // Refresh the members list
    } catch (err) {
      console.error("Failed to invite member:", err);
      toast.error("Failed to send invitation", {
        description: "An error occurred while sending the invitation.",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const toggleRole = (role: Role) => {
    setSelectedRoles((current) => {
      const exists = current.some((r) => r.id === role.id);
      if (exists) {
        return current.filter((r) => r.id !== role.id);
      }
      return [...current, role];
    });
  };

  const removeRole = (roleId: string) => {
    setSelectedRoles((current) => current.filter((r) => r.id !== roleId));
  };

  const resetDialog = () => {
    setInviteEmail("");
    setSelectedRoles([]);
    setInviteCheckMessage(null);
    setCanSendInvite(false);
  };

  if (loading && teamMembers.length === 0) {
    // Show loading only on initial load
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-red-500">{error}</p>
          <Button onClick={refreshMembers} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const inviteButton = (
    <Dialog
      open={isInviteDialogOpen}
      onOpenChange={(open) => {
        setIsInviteDialogOpen(open);
        if (!open) resetDialog();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation email to add a new team member to your
            organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            {inviteEmail && inviteCheckMessage ? (
              <p
                className={`text-xs ${canSendInvite ? "text-green-600" : "text-red-600"}`}
              >
                {inviteCheckMessage}
              </p>
            ) : (
              !inviteEmail && <p className="text-xs text-red-600">Required</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Roles</Label>
            <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
              {selectedRoles.map((role) => (
                <Badge key={role.id} variant="secondary" className="mr-1 mb-1">
                  {role.name}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") removeRole(role.id);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => removeRole(role.id)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
            </div>
            <Popover open={roleDropdownOpen} onOpenChange={setRoleDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={roleDropdownOpen}
                  className="w-full justify-between"
                  disabled={rolesLoading}
                >
                  {rolesLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Select roles..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search roles..." />
                  <CommandEmpty>No role found.</CommandEmpty>
                  {rolesLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Loading roles...
                    </div>
                  ) : (
                    <CommandGroup>
                      {roles.map((role) => (
                        <CommandItem
                          key={role.id}
                          value={role.name}
                          onSelect={() => {
                            toggleRole(role);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedRoles.some((r) => r.id === role.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {role.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            {selectedRoles.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selected roles will determine the user&apos;s permissions.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleInviteSubmit}
            disabled={
              !inviteEmail ||
              selectedRoles.length === 0 ||
              isInviting ||
              !canSendInvite ||
              rolesLoading
            }
            className="w-full"
          >
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Find the person data for the edit dialog
  const editingPersonData = editingPerson
    ? teamMembers.find((member) => member.id === editingPerson.id)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage organization members and invite new ones.
          {pagination.totalCount > 0 && (
            <span className="ml-2">
              Showing {teamMembers.length} of {pagination.totalCount} members
            </span>
          )}
        </p>
      </div>

      <Separator />

      <DataTable
        columns={getPeopleTableColumns(handleOpenEditPersonDialog)}
        data={teamMembers}
        inviteButton={inviteButton}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
      />

      {editingPerson && organizationId && (
        <EditPersonDialog
          isOpen={isEditPersonDialogOpen}
          onClose={handleCloseEditPersonDialog}
          personId={editingPerson.id}
          personType={editingPerson.type}
          organizationId={organizationId}
          personData={editingPersonData}
          onUpdate={refreshMembers}
        />
      )}
    </div>
  );
}
