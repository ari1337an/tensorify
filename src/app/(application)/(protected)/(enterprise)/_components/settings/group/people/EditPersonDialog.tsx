"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { PeopleListEntry } from "./columns";
import {
  Loader2,
  Check,
  ChevronsUpDown,
  CalendarIcon,
  MailIcon,
  UserIcon,
  UserRoundX,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  UserCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { fetchRoles as fetchAvailableRolesServer } from "@/app/(protected)/(enterprise)/_components/settings/group/rbac/server";
import {
  updateInvitationRoles,
  revokeInvitation as revokeInvitationAction,
} from "@/server/actions/invitation-actions";
import { toast } from "sonner";
import { cn } from "@/app/_lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/_components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Badge } from "@/app/_components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import { useAuth } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { Separator } from "@/app/_components/ui/separator";

interface EditPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personId: string | null;
  personType: "member" | "invitation" | null;
  organizationId: string | null;
  onUpdate?: () => void;
  personData?: PeopleListEntry | null;
}

type RoleType = {
  id: string;
  name: string;
  description?: string;
};

// Define our own InvitedByType with userId
type InvitedByType = {
  name?: string | null;
  email?: string | null;
  userId?: string | null;
};

// Define our own InvitationDetailsType with the correct InvitedByType
type InvitationDetailsType = {
  invitedAt: string;
  expiresAt: string;
  invitedBy?: InvitedByType;
  status?: string;
};

// The original invitedBy type from PeopleListEntry
type OriginalInvitedByType = {
  name?: string | null;
  email?: string | null;
  userId?: string | null; // This might be missing in the original type
};

// Extend PeopleListEntry to have our own invitationDetails type
type ExtendedPeopleListEntry = Omit<PeopleListEntry, "invitationDetails"> & {
  invitationDetails?: {
    invitedAt: string;
    expiresAt: string;
    invitedBy?: InvitedByType;
  };
};

// Updated PersonDetails type to include "Revoked" status
type PersonDetails = Omit<ExtendedPeopleListEntry, "status"> & {
  teams?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
  workflows?: { id: string; name: string }[];
  permissionsSummary?: string[];
  detailedRoles?: RoleType[];
  invitationDetails?: InvitationDetailsType;
  status:
    | "Pending"
    | "Active"
    | "Accepted"
    | "Declined"
    | "Expired"
    | "Revoked";
};

// Status mapping for consistency
const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
    description: "Invitation has been sent but not yet accepted",
  },
  Active: {
    label: "Active",
    variant: "default" as const,
    icon: CheckCircle,
    description: "Member is active in the organization",
  },
  Accepted: {
    label: "Accepted",
    variant: "default" as const,
    icon: CheckCircle,
    description: "Invitation has been accepted",
  },
  Declined: {
    label: "Declined",
    variant: "destructive" as const,
    icon: XCircle,
    description: "Invitation was declined by the recipient",
  },
  Expired: {
    label: "Expired",
    variant: "outline" as const,
    icon: Clock,
    description: "Invitation has expired",
  },
  Revoked: {
    label: "Revoked",
    variant: "destructive" as const,
    icon: UserRoundX,
    description: "Invitation was revoked by the sender",
  },
};

export function EditPersonDialog({
  isOpen,
  onClose,
  personId,
  personType,
  organizationId,
  onUpdate,
  personData,
}: EditPersonDialogProps) {
  // Add debug logging to capture all props
  React.useEffect(() => {
    if (isOpen) {
      console.log("EditPersonDialog opened with props:", {
        personId,
        personType,
        organizationId,
        hasPersonData: !!personData,
        personDataType: personData?.type,
        personDataId: personData?.id,
      });
    }
  }, [isOpen, personId, personType, organizationId, personData]);

  const { userId: currentUserId } = useAuth();
  const [details, setDetails] = React.useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = React.useState<RoleType[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = React.useState<Set<string>>(
    new Set()
  );
  const [isFetchingRoles, setIsFetchingRoles] = React.useState(false);
  const [isUpdatingRoles, setIsUpdatingRoles] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  const statusConfig = React.useMemo(() => {
    if (!details?.status) return STATUS_CONFIG.Pending;
    return (
      STATUS_CONFIG[details.status as keyof typeof STATUS_CONFIG] || {
        label: details.status,
        variant: "outline" as const,
        icon: HelpCircle,
        description: "Unknown status",
      }
    );
  }, [details?.status]);

  React.useEffect(() => {
    if (isOpen && personId && personType && organizationId) {
      const fetchDetailsAndRoles = async () => {
        setIsLoading(true);
        setIsFetchingRoles(true);
        setError(null);

        try {
          // Initialize with personData if available
          if (personData) {
            console.log("Initializing with personData:", personData);

            // Create an extended version with our custom types
            // This ensures invitationDetails.invitedBy.userId is properly typed
            const extendedPersonData: ExtendedPeopleListEntry = {
              ...personData,
              invitationDetails: personData.invitationDetails
                ? {
                    ...personData.invitationDetails,
                    invitedBy: personData.invitationDetails.invitedBy
                      ? {
                          ...personData.invitationDetails.invitedBy,
                          // Add userId if it exists in the original data
                          // Use proper type union to avoid any
                          userId:
                            (
                              personData.invitationDetails
                                .invitedBy as OriginalInvitedByType
                            )?.userId || null,
                        }
                      : undefined,
                  }
                : undefined,
            };

            // Use a typed conversion to ensure the status type includes "Revoked"
            const initialDetails: PersonDetails = {
              ...extendedPersonData,
              status: personData.status,
              detailedRoles: personData.roles,
            };

            setDetails(initialDetails);
          } else {
            console.warn(
              `No personData provided for ${personType} with ID ${personId}`,
              { personId, personType, organizationId }
            );
            setDetails(null);
          }

          // Fetch available roles
          try {
            console.log("Fetching available roles");
            const rolesResult = await fetchAvailableRolesServer();

            if (rolesResult.success && rolesResult.data) {
              console.log(`Loaded ${rolesResult.data.length} roles`);
              setAvailableRoles(rolesResult.data);
            } else {
              console.error("Failed to load roles:", rolesResult.error);
              setError(rolesResult.error || "Failed to load roles.");
            }
          } catch (err) {
            console.error("Error fetching roles:", err);
            setError("Failed to load roles. Please try again.");
          } finally {
            setIsFetchingRoles(false);
          }

          // Initialize selected roles from personData
          if (personData?.roles) {
            console.log(`Setting ${personData.roles.length} initial role(s)`);
            setSelectedRoleIds(new Set(personData.roles.map((r) => r.id)));
          }
        } catch (err) {
          console.error("Error initializing dialog data:", err);
          setError(
            "An error occurred while loading the data. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchDetailsAndRoles();
    } else {
      setDetails(null);
      setError(null);
      setIsLoading(false);
      setAvailableRoles([]);
      setSelectedRoleIds(new Set());
      setIsFetchingRoles(false);
      setIsRevoking(false);
    }
  }, [isOpen, personId, personType, organizationId, personData]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  const handleUpdateRoles = async () => {
    if (!personId || personType !== "invitation" || !organizationId || !details)
      return;

    console.log("Starting role update process", {
      personId,
      organizationId,
      selectedRoleIds: Array.from(selectedRoleIds),
      currentStatus: details.status,
    });

    const isInvitationPending = details.status === "Pending";
    const isExpired =
      details.invitationDetails?.expiresAt &&
      new Date(details.invitationDetails.expiresAt) < new Date();

    if (!isInvitationPending || isExpired) {
      console.warn("Cannot update roles - invitation not pending or expired", {
        status: details.status,
        isExpired,
        expiresAt: details.invitationDetails?.expiresAt,
      });
      toast.error("Cannot update roles", {
        description:
          "Roles can only be updated for pending invitations that haven't expired.",
      });
      return;
    }

    if (selectedRoleIds.size === 0) {
      console.warn("Cannot update roles - no roles selected");
      toast.error("No roles selected", {
        description: "Please select at least one role to continue.",
      });
      return;
    }

    setIsUpdatingRoles(true);
    try {
      console.log("Calling updateInvitationRoles with:", {
        invitationId: personId,
        organizationId,
        newRoleIds: Array.from(selectedRoleIds),
      });

      const result = await updateInvitationRoles({
        invitationId: personId,
        organizationId,
        newRoleIds: Array.from(selectedRoleIds),
      });

      console.log("Role update result:", result);

      if (result.success) {
        toast.success("Roles updated", {
          description: "The invitation roles have been updated successfully.",
        });

        if (onUpdate) onUpdate();

        // Update local state
        const updatedRoles = availableRoles.filter((role) =>
          selectedRoleIds.has(role.id)
        );
        console.log("Updating local state with new roles:", updatedRoles);

        setDetails((prev) =>
          prev
            ? {
                ...prev,
                roles: updatedRoles,
                detailedRoles: updatedRoles,
              }
            : null
        );
      } else {
        console.error("Failed to update roles:", result.error);
        toast.error("Update failed", {
          description: result.error || "Failed to update roles.",
        });
      }
    } catch (err) {
      console.error("Error updating roles:", err);
      toast.error("An error occurred", {
        description: "Failed to update roles. Please try again.",
      });
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  const handleRevokeInvitation = async () => {
    if (!personId || personType !== "invitation" || !organizationId || !details)
      return;

    console.log("Starting invitation revoke process", {
      personId,
      organizationId,
      invitationStatus: details.status,
    });

    const isInvitationPending = details.status === "Pending";
    const isExpired =
      details.invitationDetails?.expiresAt &&
      new Date(details.invitationDetails.expiresAt) < new Date();

    if (!isInvitationPending || isExpired) {
      console.warn("Cannot revoke - invitation not pending or expired", {
        status: details.status,
        isExpired,
        expiresAt: details.invitationDetails?.expiresAt,
      });
      toast.error("Cannot revoke invitation", {
        description: "Only pending, non-expired invitations can be revoked.",
      });
      return;
    }

    // Check if current user is the inviter
    const inviterId = details.invitationDetails?.invitedBy?.userId;
    console.log("Checking authorization for revoke", {
      inviterId,
      currentUserId,
      isAuthorized: inviterId === currentUserId,
    });

    if (inviterId && inviterId !== currentUserId) {
      console.warn("Not authorized to revoke invitation", {
        inviterId,
        currentUserId,
      });
      toast.error("Not authorized", {
        description: "Only the original inviter can revoke this invitation.",
      });
      return;
    }

    setIsRevoking(true);
    try {
      console.log("Calling revokeInvitationAction with:", {
        invitationId: personId,
        organizationId,
      });

      const result = await revokeInvitationAction({
        invitationId: personId,
        organizationId,
      });

      console.log("Revoke invitation result:", result);

      if (result.success) {
        toast.success("Invitation revoked", {
          description:
            result.message || "The invitation has been successfully revoked.",
        });

        if (onUpdate) onUpdate();

        // Update local state with the new status - now safely typed
        console.log("Updating local state with Revoked status");
        setDetails((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "Revoked",
          };
        });

        handleClose();
      } else {
        console.error("Failed to revoke invitation:", result.error);
        toast.error("Revoke failed", {
          description: result.error || "Failed to revoke invitation.",
        });
      }
    } catch (err) {
      console.error("Error revoking invitation:", err);
      toast.error("An error occurred", {
        description: "Failed to revoke invitation. Please try again.",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isPendingInvitation =
    personType === "invitation" &&
    details?.status === "Pending" &&
    !(
      details?.invitationDetails?.expiresAt &&
      new Date(details.invitationDetails.expiresAt) < new Date()
    );

  const canEditRoles = isPendingInvitation;
  const canRevoke =
    isPendingInvitation &&
    details?.invitationDetails?.invitedBy?.userId === currentUserId;

  const selectedRolesDisplay = React.useMemo(() => {
    return availableRoles
      .filter((role) => selectedRoleIds.has(role.id))
      .map((role) => role.name)
      .join(", ");
  }, [selectedRoleIds, availableRoles]);

  // Format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);

      // Check if the date is valid
      if (isNaN(date.getTime())) return "Invalid Date";

      // Format: "Jan 1, 2023, 12:00 PM"
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Check if an invitation is expired
  const isInvitationExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    try {
      return new Date(expiresAt) < new Date();
    } catch {
      return false;
    }
  };

  // Get time remaining until expiration
  const getTimeRemaining = (expiresAt?: string): string => {
    if (!expiresAt) return "Unknown";
    try {
      const expiryDate = new Date(expiresAt);
      const now = new Date();

      if (expiryDate <= now) return "Expired";

      const diffMs = expiryDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
      } else {
        const diffMinutes = Math.floor(
          (diffMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
      }
    } catch {
      return "Unknown";
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl">
            {details?.name || details?.email || "Loading..."}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge
              variant={statusConfig.variant}
              className="flex items-center gap-1"
            >
              <statusConfig.icon className="h-3.5 w-3.5" />
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {personType === "member" ? (
                <span className="flex items-center gap-1">
                  <UserCheckIcon className="h-3.5 w-3.5" />
                  Organization Member
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <UserPlusIcon className="h-3.5 w-3.5" />
                  Invitation
                </span>
              )}
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-destructive font-medium">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          ) : details ? (
            <div className="space-y-6 p-1">
              {/* Basic Information Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex gap-2 items-center">
                    <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium shrink-0">Email:</span>
                    <span className="truncate">{details.email}</span>
                  </div>

                  {details.name && (
                    <div className="flex gap-2 items-center">
                      <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium shrink-0">Name:</span>
                      <span className="truncate">{details.name}</span>
                    </div>
                  )}

                  {details.id && (
                    <div className="flex gap-2 items-center col-span-2">
                      <span className="font-medium shrink-0">ID:</span>
                      <code className="bg-muted px-1 py-0.5 rounded text-xs truncate flex-1 overflow-hidden">
                        {details.id}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Invitation Details Section */}
              {personType === "invitation" && details.invitationDetails && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Invitation Details
                    </CardTitle>
                    <CardDescription>
                      Information about this invitation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex gap-2 items-center">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium shrink-0">Invited:</span>
                        <span>
                          {formatDate(details.invitationDetails.invitedAt)}
                        </span>
                      </div>

                      <div className="flex gap-2 items-center">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium shrink-0">Expires:</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className={cn(
                                  isInvitationExpired(
                                    details.invitationDetails.expiresAt
                                  ) && "text-destructive"
                                )}
                              >
                                {formatDate(
                                  details.invitationDetails.expiresAt
                                )}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {isInvitationExpired(
                                details.invitationDetails.expiresAt
                              )
                                ? "This invitation has expired"
                                : `Expires in: ${getTimeRemaining(details.invitationDetails.expiresAt)}`}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {details.invitationDetails.invitedBy?.name && (
                        <div className="flex gap-2 items-center">
                          <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium shrink-0">
                            Invited By:
                          </span>
                          <span className="truncate">
                            {details.invitationDetails.invitedBy.name}
                            {details.invitationDetails.invitedBy.userId ===
                              currentUserId && " (You)"}
                          </span>
                        </div>
                      )}

                      {details.invitationDetails.invitedBy?.email && (
                        <div className="flex gap-2 items-center">
                          <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium shrink-0">
                            Inviter Email:
                          </span>
                          <span className="truncate">
                            {details.invitationDetails.invitedBy.email}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-sm">
                      <statusConfig.icon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {statusConfig.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Roles Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Roles</CardTitle>
                    {isFetchingRoles && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>
                    {canEditRoles
                      ? "You can modify the roles for this pending invitation"
                      : "Assigned roles for this user"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isFetchingRoles &&
                  canEditRoles &&
                  availableRoles.length > 0 ? (
                    <div className="space-y-4">
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className="w-full justify-between"
                            disabled={isUpdatingRoles || isRevoking}
                          >
                            <span className="truncate">
                              {selectedRoleIds.size > 0
                                ? selectedRolesDisplay
                                : "Select roles..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search roles..." />
                            <CommandList>
                              <CommandEmpty>No roles found.</CommandEmpty>
                              <CommandGroup>
                                {availableRoles.map((role) => (
                                  <CommandItem
                                    key={role.id}
                                    value={role.name}
                                    onSelect={() => handleRoleToggle(role.id)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedRoleIds.has(role.id)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <span>{role.name}</span>
                                    {role.description && (
                                      <span className="ml-2 text-xs text-muted-foreground truncate">
                                        {role.description}
                                      </span>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {selectedRoleIds.size > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from(selectedRoleIds).map((roleId) => {
                            const role = availableRoles.find(
                              (r) => r.id === roleId
                            );
                            return role ? (
                              <TooltipProvider key={roleId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="cursor-default"
                                    >
                                      {role.name}
                                    </Badge>
                                  </TooltipTrigger>
                                  {role.description && (
                                    <TooltipContent>
                                      <p>{role.description}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {(details.roles?.length ?? 0) > 0 ||
                      (details.detailedRoles?.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {(details.detailedRoles || details.roles || []).map(
                            (role) => (
                              <TooltipProvider key={role.id}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="outline"
                                      className="cursor-default"
                                    >
                                      {role.name}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {(role as RoleType).description ||
                                        "No description available"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {isFetchingRoles
                            ? "Loading roles..."
                            : personType === "member"
                              ? "No roles assigned to this member."
                              : "No roles assigned to this invitation."}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Member details sections - placeholders for future work */}
              {personType === "member" && (
                <>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Teams</CardTitle>
                      <CardDescription>
                        Teams the member belongs to
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Team details will be available in a future update.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Access & Permissions
                      </CardTitle>
                      <CardDescription>
                        Projects and workflows this member has access to
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Detailed permission information will be available in a
                        future update.
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            // Add fallback message for when details is null but loading is complete
            <div className="p-6 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="rounded-full bg-muted p-3">
                  <HelpCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No Data Available</h3>
                  <p className="text-muted-foreground">
                    {personType === "member"
                      ? "Could not load member details. The user data may be missing."
                      : "Could not load invitation details. The invitation data may be missing."}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check that you have selected a valid {personType} and
                    try again.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="mt-2"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        <Separator className="my-4" />

        <DialogFooter className="sm:justify-between">
          <div className="flex">
            {canRevoke && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isRevoking || isUpdatingRoles}
                    className="mr-2"
                  >
                    {isRevoking && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Revoke Invitation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke this invitation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently revoke the invitation sent to{" "}
                      <span className="font-medium">{details?.email}</span>.
                      They will no longer be able to accept it, and you&apos;ll
                      need to send a new invitation if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isRevoking}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRevokeInvitation}
                      disabled={isRevoking}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      {isRevoking && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Revoke
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUpdatingRoles || isRevoking}
            >
              Close
            </Button>

            {canEditRoles && (
              <Button
                onClick={handleUpdateRoles}
                disabled={
                  isUpdatingRoles ||
                  isRevoking ||
                  isFetchingRoles ||
                  selectedRoleIds.size === 0
                }
              >
                {isUpdatingRoles && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Roles
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// TODO:
// 1. Implement a real `getPersonDetails` server action in `organization-actions.ts` or similar.
//    - This action must fetch the inviterId for invitations for the revoke check.
//    - It must also fetch the accurate current status and expiresAt for invitations.
// 2. Pass the `PeopleListEntry` data (especially `invitationDetails.invitedBy.id` if available, or ensure `getPersonDetails` fetches it)
//    to this dialog via the `personData` prop from `PeopleView.tsx` to correctly initialize `details.invitationDetails.inviterId`.
// 3. Ensure `useAuth()` provides the correct `userId` for the current session.
// 4. Add `<Toaster />` to your main layout if not already present for toasts to appear.
// 5. The `Badge` variant for status might need adjustments based on available variants ('yellow', 'green').
