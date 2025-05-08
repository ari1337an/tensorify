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
import { FileText } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { DataTableColumnHeader } from "../data-table-column-header";
import { DataTableRowActions } from "./response-table-row-actions";

// Use the response type from the page component
export interface OnboardingResponse {
  id: string;
  userId: string;
  userName: string;
  email: string;
  clientFingerprint?: string;
  intentTag?: string;
  orgSizeBracket?: string;
  tagVersionId?: string;
  createdAt: string;
  isDummy?: boolean;
  answers: Array<{
    questionId: string;
    questionTitle: string;
    selectedOptions: Array<{
      optionId: string;
      optionLabel: string;
    }>;
  }>;
}

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

// Intent tag badge component
const IntentTagBadge = ({ tag }: { tag?: string }) => {
  if (!tag) return <span className="text-muted-foreground">—</span>;

  switch (tag) {
    case "WILL_PAY_TEAM":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          Will Pay (Team)
        </Badge>
      );
    case "WILL_PAY_INDIVIDUAL":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          Will Pay (Individual)
        </Badge>
      );
    case "CURIOUS":
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800"
        >
          Curious
        </Badge>
      );
    default:
      return <Badge variant="outline">{tag}</Badge>;
  }
};

// Org size badge component
const OrgSizeBadge = ({ size }: { size?: string }) => {
  if (!size) return <span className="text-muted-foreground">—</span>;

  const sizeLabels: Record<string, string> = {
    ONE_TO_FIVE: "1-5",
    SIX_TO_TWENTY_FIVE: "6-25",
    TWENTY_SIX_TO_FIFTY: "26-50",
    FIFTY_ONE_TO_ONE_HUNDRED: "51-100",
    ONE_HUNDRED_ONE_TO_ONE_THOUSAND: "101-1,000",
    OVER_ONE_THOUSAND: "1,000+",
  };

  return (
    <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800/20">
      {sizeLabels[size] || size}
    </Badge>
  );
};

export const columns: ColumnDef<OnboardingResponse>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const checked = table.getIsAllPageRowsSelected();
      const indeterminate = table.getIsSomePageRowsSelected();

      return (
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => {
            if (typeof value === "boolean") {
              table.toggleAllPageRowsSelected(value);
            }
          }}
          aria-label="Select all"
          className="translate-y-[2px] ml-4 border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
        />
      );
    },
    cell: ({ row }) => {
      const checked = row.getIsSelected();

      return (
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => {
            if (typeof value === "boolean") {
              row.toggleSelected(value);
            }
          }}
          aria-label="Select row"
          className="translate-y-[2px] ml-4 border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6]"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "clientFingerprint",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fingerprint" />
    ),
    cell: ({ row }) => {
      // Extra error handling and logging for debugging
      try {
        // Access methods in order of preference
        const fingerprint =
          row.getValue("clientFingerprint") ||
          (row.original && row.original.clientFingerprint) ||
          "—";

        return (
          <div className="flex space-x-2">
            <TruncatedText
              text={typeof fingerprint === "string" ? fingerprint : "—"}
              maxWidth="max-w-[180px]"
            />
            {row.original.isDummy && (
              <Badge variant="outline" className="ml-2 text-xs">
                Test
              </Badge>
            )}
          </div>
        );
      } catch (error) {
        console.error("Error rendering fingerprint cell:", error, row.original);
        return <span className="text-muted-foreground">Error</span>;
      }
    },
    size: 180,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      return (
        <TruncatedText
          text={row.getValue("email") || "—"}
          maxWidth="max-w-[200px]"
        />
      );
    },
    size: 220,
  },
  {
    accessorKey: "intentTag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intent" />
    ),
    cell: ({ row }) => {
      return <IntentTagBadge tag={row.getValue("intentTag")} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 150,
  },
  {
    accessorKey: "orgSizeBracket",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Org Size" />
    ),
    cell: ({ row }) => {
      return <OrgSizeBadge size={row.getValue("orgSizeBracket")} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 120,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-xs">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy h:mm a")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      // Custom filter for date range
      if (!value || value.length !== 2) return true;
      const date = new Date(row.getValue(id));
      const [startDate, endDate] = value;
      return date >= startDate && date <= endDate;
    },
    size: 150,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <FileText className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
      );
    },
    size: 50,
  },
];
