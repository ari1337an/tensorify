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
import { Checkbox } from "@/app/_components/ui/checkbox";
import { ScrollArea } from "@/app/_components/ui/scroll-area";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const timezones = [
  { value: "UTC", label: "UTC+0" },
  { value: "Etc/GMT-1", label: "UTC+1" },
  { value: "Etc/GMT-2", label: "UTC+2" },
  { value: "Etc/GMT-3", label: "UTC+3" },
  { value: "Etc/GMT-4", label: "UTC+4" },
  { value: "Etc/GMT-5", label: "UTC+5" },
  { value: "Etc/GMT-6", label: "UTC+6" },
  { value: "Etc/GMT-7", label: "UTC+7" },
  { value: "Etc/GMT-8", label: "UTC+8" },
  { value: "Etc/GMT-9", label: "UTC+9" },
  { value: "Etc/GMT-10", label: "UTC+10" },
  { value: "Etc/GMT-11", label: "UTC+11" },
  { value: "Etc/GMT-12", label: "UTC+12" },
  { value: "Etc/GMT+1", label: "UTC-1" },
  { value: "Etc/GMT+2", label: "UTC-2" },
  { value: "Etc/GMT+3", label: "UTC-3" },
  { value: "Etc/GMT+4", label: "UTC-4" },
  { value: "Etc/GMT+5", label: "UTC-5" },
  { value: "Etc/GMT+6", label: "UTC-6" },
  { value: "Etc/GMT+7", label: "UTC-7" },
  { value: "Etc/GMT+8", label: "UTC-8" },
  { value: "Etc/GMT+9", label: "UTC-9" },
  { value: "Etc/GMT+10", label: "UTC-10" },
  { value: "Etc/GMT+11", label: "UTC-11" },
  { value: "Etc/GMT+12", label: "UTC-12" },
];

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
              <div className="px-2 py-1.5 text-sm font-semibold">
                Filter Status
              </div>
              <ScrollArea className="h-[200px]">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={selectedValues?.has(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedValues.add(option);
                        } else {
                          selectedValues.delete(option);
                        }
                        const filterValues = Array.from(selectedValues);
                        column.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        );
                      }}
                      className="border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6] data-[state=checked]:text-white"
                    />
                    {option}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </>
          )}

          {isAuthorsColumn && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">
                Filter Authors
              </div>
              <ScrollArea className="h-[200px]">
                {authorOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={selectedValues?.has(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedValues.add(option);
                        } else {
                          selectedValues.delete(option);
                        }
                        const filterValues = Array.from(selectedValues);
                        column.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        );
                      }}
                      className="border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6] data-[state=checked]:text-white"
                    />
                    {option}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </>
          )}

          {isTagsColumn && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-sm font-semibold">
                Filter Tags
              </div>
              <ScrollArea className="h-[200px]">
                {tagOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    className="flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      checked={selectedValues?.has(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedValues.add(option);
                        } else {
                          selectedValues.delete(option);
                        }
                        const filterValues = Array.from(selectedValues);
                        column.setFilterValue(
                          filterValues.length ? filterValues : undefined
                        );
                      }}
                      className="border-muted-foreground/70 data-[state=checked]:bg-[#8B5CF6] data-[state=checked]:border-[#8B5CF6] data-[state=checked]:text-white"
                    />
                    {option}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
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
