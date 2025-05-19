"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/_components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ArrowUpDown,
  Edit,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserX2,
} from "lucide-react";
import { Badge } from "@/app/_components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";

// New type definition for items in the table
export type RoleDisplayInfo = {
  id: string;
  name: string;
};

// Represents either an active organization member or an invited user
export type PeopleListEntry = {
  id: string; // User ID for members, Invitation ID for invitations
  type: "member" | "invitation";
  name?: string | null; // Full name
  firstName?: string | null; // For fallback avatar
  lastName?: string | null; // For fallback avatar
  email: string;
  imageUrl?: string | null;
  roles: RoleDisplayInfo[];
  status: "Active" | "Pending" | "Accepted" | "Declined" | "Expired"; // Combines member status and invitation status
  invitationDetails?: {
    invitedAt: string; // ISO date string
    expiresAt: string; // ISO date string
    invitedBy?: { name?: string | null; email?: string | null };
  };
  // For the detailed edit view - to be defined more fully later
  userId?: string; // Actual user ID in the system if available
  organizationId: string;
};

// Modify columns to be a function that accepts onEditPerson
export const getPeopleTableColumns = (
  onEditPerson: (personId: string, personType: "member" | "invitation") => void
): ColumnDef<PeopleListEntry>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const entry = row.original;
      const displayName = entry.name || entry.email;
      const fallbackName = entry.name
        ? entry.name.slice(0, 2).toUpperCase()
        : entry.email.slice(0, 2).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={entry.imageUrl ?? undefined} alt={displayName} />
            <AvatarFallback>{fallbackName}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{displayName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground">{row.getValue("email")}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      let badgeVariant: "default" | "secondary" | "destructive" | "outline" =
        "secondary";
      let icon = <AlertTriangle className="mr-1 h-3 w-3" />;

      switch (status) {
        case "Active":
          badgeVariant = "default";
          icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
          break;
        case "Pending":
          badgeVariant = "outline";
          icon = <Clock className="mr-1 h-3 w-3" />;
          break;
        case "Accepted": // Could mean accepted invitation but not yet fully a member depending on flow
          badgeVariant = "default";
          icon = <CheckCircle2 className="mr-1 h-3 w-3" />;
          break;
        case "Declined":
          badgeVariant = "destructive";
          icon = <UserX2 className="mr-1 h-3 w-3" />;
          break;
        case "Expired":
          badgeVariant = "destructive";
          icon = <Clock className="mr-1 h-3 w-3" />;
          break;
      }
      return (
        <Badge variant={badgeVariant} className="flex items-center w-fit">
          {icon}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Roles",
    cell: ({ row }) => {
      const roles = row.original.roles;
      if (!roles || roles.length === 0) {
        return <span className="text-muted-foreground">No roles</span>;
      }

      const MAX_VISIBLE_ROLES = 2;
      const visibleRoles = roles.slice(0, MAX_VISIBLE_ROLES);
      const hiddenRolesCount = roles.length - visibleRoles.length;

      return (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="flex flex-wrap items-center gap-1">
                {visibleRoles.map((role) => (
                  <Badge
                    key={role.id}
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    {role.name}
                  </Badge>
                ))}
                {hiddenRolesCount > 0 && (
                  <Badge variant="outline" className="whitespace-nowrap">
                    +{hiddenRolesCount} more
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            {roles.length > MAX_VISIBLE_ROLES && (
              <TooltipContent className="p-2">
                <div className="flex flex-col gap-1">
                  {roles.map((role) => (
                    <Badge
                      key={role.id}
                      variant="secondary"
                      className="whitespace-nowrap"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const entry = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEditPerson(entry.id, entry.type)}
              className="flex items-center"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
            {entry.type === "member" && (
              <DropdownMenuItem
                onClick={() => console.log("Remove member:", entry.id)}
                className="flex items-center text-red-600 hover:!text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Member
              </DropdownMenuItem>
            )}
            {entry.type === "invitation" &&
              (entry.status === "Pending" || entry.status === "Expired") && (
                <DropdownMenuItem
                  onClick={() => console.log("Resend invitation:", entry.id)}
                  className="flex items-center"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Resend Invitation
                </DropdownMenuItem>
              )}
            {entry.type === "invitation" && entry.status === "Pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => console.log("Revoke invitation:", entry.id)}
                  className="flex items-center text-red-600 hover:!text-red-600"
                >
                  <UserX2 className="mr-2 h-4 w-4" />
                  Revoke Invitation
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
