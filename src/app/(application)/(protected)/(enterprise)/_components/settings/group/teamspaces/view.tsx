"use client";

import * as React from "react";
import { Separator } from "@/app/_components/ui/separator";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  UserPlus,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import { Button } from "@/app/_components/ui/button";
import { TeamspacesDataTable } from "./data-table";
import { getTeamspacesTableColumns, TeamspaceEntry } from "./columns";
import { useTeamspacesLogic } from "./logic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { DataTable as PeopleDataTable } from "../people/data-table";
import { getPeopleTableColumns, PeopleListEntry } from "../people/columns";
// import {
//   getTeamMembers,
//   inviteToTeam,
//   canInviteUserToTeam,
// } from "@/server/actions/team-actions";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import { Badge } from "@/app/_components/ui/badge";
import { cn } from "@/app/_lib/utils";
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
import { CreateTeamForm } from "./create-team-form";

type Role = {
  id: string;
  name: string;
};

export function TeamspacesView() {
  const { teams, loading, error, isEmpty, refresh } = useTeamspacesLogic();

  // Dialog state
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<TeamspaceEntry | null>(
    null
  );
  const [members, setMembers] = React.useState<PeopleListEntry[]>([]);
  const [membersLoading, setMembersLoading] = React.useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);
  const [isCreateTeamFormOpen, setIsCreateTeamFormOpen] = React.useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteCheckMessage, setInviteCheckMessage] = React.useState<
    string | null
  >(null);
  const [canSendInvite, setCanSendInvite] = React.useState(false);
  const [isInviting, setIsInviting] = React.useState(false);

  // Role selection state
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = React.useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  // Load available roles when component mounts
  React.useEffect(() => {
    async function loadRoles() {
      try {
        setRolesLoading(true);
        const response = {
          success: true,
          data: [{ id: "1", name: "Admin" }],
          error: null,
        };
        if (response.success && response.data) {
          setRoles(
            response.data.map((role) => ({
              id: role.id,
              name: role.name,
            }))
          );
        } else {
          console.error("Failed to load roles.");
        }
      } catch (err) {
        console.error("Failed to load roles:", err);
      } finally {
        setRolesLoading(false);
      }
    }

    loadRoles();
  }, []);

  // Role selection handlers
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

  // Handler for view button
  const handleOpenDialog = async (team: TeamspaceEntry) => {
    setSelectedTeam(team);
    setOpenDialog(true);
    setMembersLoading(true);
    try {
      // const data = await getTeamMembers(team.id);
      // setMembers(data);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTeam(null);
    setMembers([]);
  };

  // Reset the invitation dialog
  const resetInviteDialog = () => {
    setInviteEmail("");
    setInviteCheckMessage(null);
    setCanSendInvite(false);
    setIsInviting(false);
    setSelectedRoles([]);
  };

  // Handle invitation submission
  const handleInvite = async () => {
    if (!inviteEmail || !canSendInvite || !selectedTeam) {
      return;
    }

    try {
      setIsInviting(true);
      // const result = await inviteToTeam(
      //   inviteEmail,
      //   selectedTeam.id,
      //   selectedRoles.map((role) => role.id)
      // );

      // if (result.success) {
      //   setInviteEmail("");
      //   setSelectedRoles([]);
      //   setInviteDialogOpen(false);

      //   // Refresh the team members list
      //   setMembersLoading(true);
      //   try {
      //     const data = await getTeamMembers(selectedTeam.id);
      //     setMembers(data);
      //   } catch {
      //     // Handle error silently
      //   } finally {
      //     setMembersLoading(false);
      //   }

      //   setInviteCheckMessage("User added to team successfully!");
      //   setTimeout(() => setInviteCheckMessage(null), 3000);
      // } else {
      //   setInviteCheckMessage(result.error || "Failed to add user to team.");
      // }
    } catch (err) {
      console.error("Failed to invite member to team:", err);
      setInviteCheckMessage("An unexpected error occurred.");
    } finally {
      setIsInviting(false);
    }
  };

  // Check if the email can be invited
  React.useEffect(() => {
    if (!inviteEmail || !selectedTeam) {
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
      if (!selectedTeam) {
        setCanSendInvite(false);
        setInviteCheckMessage("Team information is missing.");
        return;
      }

      // const result = await canInviteUserToTeam(inviteEmail, selectedTeam.id);
      // if (result.canInvite) {
      //   setCanSendInvite(true);
      //   setInviteCheckMessage(null);
      // } else {
      //   setCanSendInvite(false);
      //   setInviteCheckMessage(
      //     result.reason || "This email cannot be invited to this team."
      //   );
      // }
    };

    const handler = setTimeout(() => {
      checkEmailEligibility();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [inviteEmail, selectedTeam]);

  // Prepare data for the table
  const tableData: TeamspaceEntry[] = teams?.teams || [];
  const columns = React.useMemo(
    () => getTeamspacesTableColumns(handleOpenDialog),
    []
  );

  // Full-page loading spinner (like @people)
  if (loading && (!teams || teams.teams.length === 0)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading teamspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Teamspaces</h2>
          <p className="text-sm text-muted-foreground">
            Manage your organization&apos;s teamspaces and their members.
          </p>
        </div>
        <Button onClick={() => setIsCreateTeamFormOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create New Team
        </Button>
      </div>

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-auto"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground">No teamspaces available</p>
          <p className="text-sm text-muted-foreground">
            Create a teamspace to get started
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="mt-4"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      ) : (
        <TeamspacesDataTable columns={columns} data={tableData} />
      )}

      <CreateTeamForm
        isOpen={isCreateTeamFormOpen}
        onClose={() => setIsCreateTeamFormOpen(false)}
        onTeamCreated={refresh}
      />

      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Admin: {selectedTeam?.admin.firstName}{" "}
              {selectedTeam?.admin.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              className="h-8"
              onClick={() => setInviteDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
          <Dialog
            open={inviteDialogOpen}
            onOpenChange={(open) => {
              setInviteDialogOpen(open);
              if (!open) resetInviteDialog();
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Add an existing organization member to this team.
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
                    !inviteEmail && (
                      <p className="text-xs text-red-600">Required</p>
                    )
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Users must already be members of your organization to
                    be added to this team.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Roles</Label>
                  <div className="flex flex-wrap gap-1 mb-2 min-h-[24px]">
                    {selectedRoles.map((role) => (
                      <Badge
                        key={role.id}
                        variant="secondary"
                        className="mr-1 mb-1"
                      >
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
                  <Popover
                    open={roleDropdownOpen}
                    onOpenChange={setRoleDropdownOpen}
                  >
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
                      Selected roles will determine the user&apos;s permissions
                      within the team.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail || isInviting || !canSendInvite}
                  className="w-full"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Team...
                    </>
                  ) : (
                    "Add to Team"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="py-4">
            {membersLoading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="text-sm">Loading members...</p>
              </div>
            ) : (
              <PeopleDataTable
                columns={getPeopleTableColumns(() => {}, null)}
                data={members}
              />
            )}
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamspacesView;
