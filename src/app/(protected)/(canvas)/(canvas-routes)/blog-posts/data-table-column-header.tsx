"use client";

import { Column } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  Clock,
  Filter as FilterIcon,
} from "lucide-react";

import { cn } from "@/app/_lib/utils";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/app/_components/ui/dropdown-menu";
import { useTimezoneStore } from "./columns";
import { ColumnFilter } from "./columns";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const timezones = Array.from({ length: 53 }, (_, i) => {
  const offset = (i - 24) / 2; // Creates offsets from -12 to +14 in 0.5 increments
  const hours = Math.floor(Math.abs(offset));
  const minutes = Math.abs(offset % 1) * 60;
  const sign = offset < 0 ? "-" : "+";

  const label = `UTC${sign}${hours}${minutes ? `:${minutes}` : ""}`;
  // For the value, we'll use minutes since that's what JS Date uses
  const totalMinutes = (Math.abs(offset) * 60).toString();
  const value = `${offset >= 0 ? "+" : "-"}${totalMinutes}`;

  return { value, label };
});

// Sample data for filters - in a real app, this would come from your data source
const statusOptions = ["Published", "Draft"];
const authorOptions = [
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Sarah Williams",
  "David Brown",
  "Emily Davis",
  "Robert Wilson",
  "Lisa Anderson",
  "James Taylor",
  "Patricia Martinez",
];
const tagOptions = [
  "Next.js",
  "React",
  "JavaScript",
  "Web Development",
  "TypeScript",
  "Programming",
  "Frontend",
  "Best Practices",
  "Architecture",
  "Scalability",
  "CSS",
  "Layout",
  "Web Design",
  "State Management",
  "Redux",
  "Context API",
  "API",
  "Backend",
  "REST",
  "Testing",
  "Jest",
  "Performance",
  "Optimization",
  "Deployment",
  "DevOps",
  "CI/CD",
  "Production",
];

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { timezone, setTimezone } = useTimezoneStore();

  if (!column.getCanSort()) {
    return <div className={cn("font-bold", className)}>{title}</div>;
  }

  const isDateColumn = title === "Date";
  const isStatusColumn = title === "Status";
  const isAuthorsColumn = title === "Authors";
  const isTagsColumn = title === "Tags";

  // Get filter count for the column
  const selectedValues = new Set(column.getFilterValue() as string[]);
  const filterCount = selectedValues?.size || 0;

  // Determine if this column has filters
  const hasFilters = isStatusColumn || isAuthorsColumn || isTagsColumn;

  return (
    <div className={cn("flex items-center", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent font-bold"
          >
            <span className="flex items-center">
              {title}
              {hasFilters && filterCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground w-5 h-5 text-xs">
                  {filterCount}
                </span>
              )}
            </span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>

          {/* Column Filters as simple menu items */}
          {isStatusColumn && (
            <>
              <DropdownMenuSeparator />
              <ColumnFilter
                column={column}
                title="Filter Status"
                options={statusOptions}
              />
            </>
          )}

          {isAuthorsColumn && (
            <>
              <DropdownMenuSeparator />
              <ColumnFilter
                column={column}
                title="Filter Authors"
                options={authorOptions}
              />
            </>
          )}

          {isTagsColumn && (
            <>
              <DropdownMenuSeparator />
              <ColumnFilter
                column={column}
                title="Filter Tags"
                options={tagOptions}
              />
            </>
          )}

          {isDateColumn && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Clock className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                  {timezones.find((tz) => tz.value === timezone)?.label ||
                    "UTC+0"}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="h-[200px] overflow-y-auto">
                    {timezones.map((tz) => (
                      <DropdownMenuItem
                        key={tz.value}
                        onClick={() => setTimezone(tz.value)}
                      >
                        {tz.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
