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
import { DataTableColumnHeader } from "../data-table-column-header";

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
    customValue?: string;
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
    case "WILL_NOT_PAY":
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-800"
        >
          Will Not Pay
        </Badge>
      );
    case "WILL_PAY_HOBBY":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
        >
          Will Pay (Hobby)
        </Badge>
      );
    case "WILL_PAY_TEAM":
      return (
        <Badge
          variant="outline"
          className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
        >
          Will Pay (Team)
        </Badge>
      );
    case "ENTERPRISE_POTENTIAL":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        >
          Enterprise Potential
        </Badge>
      );
    default:
      return <Badge variant="outline">{tag}</Badge>;
  }
};

// Org size badge component
const OrgSizeBadge = ({ size }: { size?: string }) => {
  if (!size) return <span className="text-muted-foreground">—</span>;

  // Map internal enum values to new display labels
  const sizeLabels: Record<string, { label: string; color: string }> = {
    // Enum format values
    LT_20: {
      label: "<20",
      color: "bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-400",
    },
    FROM_20_TO_99: {
      label: "20-99",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
    },
    FROM_100_TO_499: {
      label: "100-499",
      color:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
    },
    FROM_500_TO_999: {
      label: "500-999",
      color:
        "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
    },
    GTE_1000: {
      label: "1000+",
      color:
        "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400",
    },
    // String format values
    "<20": {
      label: "<20",
      color: "bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-400",
    },
    "20-99": {
      label: "20-99",
      color: "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400",
    },
    "100-499": {
      label: "100-499",
      color:
        "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400",
    },
    "500-999": {
      label: "500-999",
      color:
        "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400",
    },
    "1000+": {
      label: "1000+",
      color:
        "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400",
    },
  };

  const display = sizeLabels[size] || {
    label: size,
    color: "bg-gray-100 dark:bg-gray-800/20 text-gray-800 dark:text-gray-400",
  };

  return (
    <Badge variant="outline" className={display.color}>
      {display.label}
    </Badge>
  );
};

export const columns: ColumnDef<OnboardingResponse>[] = [
  {
    id: "select",
    header: ({ table }) => {
      const checked = table.getIsAllPageRowsSelected();

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
      const rowValue = row.getValue(id) as string | undefined;
      if (!rowValue) return false;
      return (value as string[]).includes(rowValue);
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
      const rowValue = row.getValue(id) as string | undefined;
      if (!rowValue) return false;

      // Map of equivalent values
      const equivalentValues: Record<string, string[]> = {
        LT_20: ["<20"],
        FROM_20_TO_99: ["20-99"],
        FROM_100_TO_499: ["100-499"],
        FROM_500_TO_999: ["500-999"],
        GTE_1000: ["1000+"],
        "<20": ["LT_20"],
        "20-99": ["FROM_20_TO_99"],
        "100-499": ["FROM_100_TO_499"],
        "500-999": ["FROM_500_TO_999"],
        "1000+": ["GTE_1000"],
      };

      // Direct match
      if ((value as string[]).includes(rowValue)) {
        return true;
      }

      // Check for equivalent matches
      return (value as string[]).some((val) => {
        // Check if this value has equivalent values and if rowValue is one of them
        if (equivalentValues[val] && equivalentValues[val].includes(rowValue)) {
          return true;
        }
        // Check if rowValue has equivalent values and if val is one of them
        if (
          equivalentValues[rowValue] &&
          equivalentValues[rowValue].includes(val)
        ) {
          return true;
        }
        return false;
      });
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
          <FileText
            className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            onClick={() => {
              // Dispatch a custom event to view response details
              const viewEvent = new CustomEvent("view-response-details", {
                detail: { response: row.original },
              });
              document.dispatchEvent(viewEvent);
            }}
          />
        </div>
      );
    },
    size: 50,
  },
];
