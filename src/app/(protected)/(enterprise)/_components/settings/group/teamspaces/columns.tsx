"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/app/_components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";

export type TeamspaceEntry = {
  id: string;
  name: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
  memberCount: number;
};

export const getTeamspacesTableColumns = (
  onOpenDialog: (team: TeamspaceEntry) => void
): ColumnDef<TeamspaceEntry>[] => [
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
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "admin",
    header: "Admin",
    cell: ({ row }) => {
      const admin = row.original.admin;
      return (
        <span>
          {admin.firstName} {admin.lastName}
        </span>
      );
    },
  },
  {
    accessorKey: "memberCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-end text-right"
      >
        Members
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-right w-full block">
        {row.original.memberCount}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenDialog(row.original)}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" /> View
      </Button>
    ),
  },
];
