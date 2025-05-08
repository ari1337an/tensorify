"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/app/_components/ui/badge";
import { Checkbox } from "@/app/_components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { format } from "date-fns";
import Link from "next/link";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";

// This type is used to define the shape of our data.
export type OnboardingTagVersion = {
  id: string;
  tag: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  questionCount: number;
  responseCount: number;
};

// Helper component for truncated text with tooltip
const TruncatedText = ({
  text,
  maxWidth = "max-w-[200px]",
}: {
  text: string;
  maxWidth?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`truncate block ${maxWidth}`}>{text}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
        >
          Draft
        </Badge>
      );
    case "PUBLISHED":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          Published
        </Badge>
      );
    case "ARCHIVED":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800"
        >
          Archived
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const columns: ColumnDef<OnboardingTagVersion>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] ml-4 border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] ml-4 border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const tag = row.getValue("tag") as string;
      return (
        <div className="flex space-x-2">
          <Link href={`/onboarding/${tag}`} className="hover:underline">
            <TruncatedText
              text={row.getValue("title")}
              maxWidth="max-w-[200px] md:max-w-[300px] lg:max-w-[400px]"
            />
          </Link>
        </div>
      );
    },
    size: 300,
  },
  {
    accessorKey: "tag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tag" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-mono text-xs">
          <TruncatedText text={row.getValue("tag")} maxWidth="max-w-[150px]" />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 150,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return <StatusBadge status={row.getValue("status")} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 120,
  },
  {
    accessorKey: "questionCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Questions" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("questionCount")}</div>;
    },
    size: 100,
  },
  {
    accessorKey: "responseCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Responses" />
    ),
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("responseCount")}</div>;
    },
    size: 100,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy h:mm a")}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Published At" />
    ),
    cell: ({ row }) => {
      const publishedAt = row.getValue("publishedAt");
      return (
        <div className="text-xs">
          {publishedAt
            ? format(new Date(publishedAt as string), "MMM d, yyyy h:mm a")
            : "-"}
        </div>
      );
    },
    size: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    size: 40,
  },
];
