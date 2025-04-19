"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox as CheckboxComponent } from "@/app/_components/ui/checkbox";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { Badge } from "@/app/_components/ui/badge";
import { create } from "zustand";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Button } from "@/app/_components/ui/button";
import { Filter } from "lucide-react";

// This type is used to define the shape of our data.
export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  authors: string[];
  status: string;
  date: string;
  tags: string[];
};

interface TimezoneStore {
  timezone: string;
  setTimezone: (timezone: string) => void;
}

export const useTimezoneStore = create<TimezoneStore>((set) => ({
  timezone: "UTC",
  setTimezone: (timezone) => set({ timezone }),
}));

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

// Helper component for truncated tags with tooltip
const TruncatedTags = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) {
    return <span className="text-muted-foreground text-sm">No tags</span>;
  }

  // Sort tags by length (shortest first) to maximize visible tags
  const sortedTags = [...tags].sort((a, b) => a.length - b.length);

  // Show only one tag by default to prevent horizontal scrolling
  const maxVisibleTags = 1;
  const displayTags = sortedTags.slice(0, maxVisibleTags);
  const remainingCount = tags.length - displayTags.length;
  const hasMore = remainingCount > 0;

  return (
    <div className="flex items-center gap-1 overflow-hidden">
      {displayTags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="shrink-0 text-xs">
          {tag}
        </Badge>
      ))}
      {hasMore && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help shrink-0 text-xs">
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-wrap gap-1 max-w-[200px]">
                {sortedTags.slice(maxVisibleTags).map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// Helper component for truncated authors with tooltip
const TruncatedAuthors = ({ authors }: { authors: string[] }) => {
  if (!authors || authors.length === 0) {
    return <span className="text-muted-foreground text-sm">No authors</span>;
  }

  // Sort authors by length (shortest first) to maximize visible authors
  const sortedAuthors = [...authors].sort((a, b) => a.length - b.length);

  // Start with the shortest authors and add more until we hit a reasonable width
  const maxVisibleAuthors = 1; // Show only one author by default
  const displayAuthors = sortedAuthors.slice(0, maxVisibleAuthors);
  const remainingCount = authors.length - displayAuthors.length;
  const hasMore = remainingCount > 0;

  return (
    <div className="flex items-center gap-1 overflow-hidden">
      {displayAuthors.map((author, index) => (
        <span key={index} className="truncate text-xs">
          {author}
        </span>
      ))}
      {hasMore && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help shrink-0 text-xs">
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-col gap-1 max-w-[200px]">
                {sortedAuthors.slice(maxVisibleAuthors).map((author, index) => (
                  <span key={index}>{author}</span>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// Helper component for column filters
export const ColumnFilter = ({
  column,
  title,
  options,
}: {
  column: any;
  title: string;
  options: string[];
}) => {
  const facetedFilter = column.getFacetedUniqueValues();
  const selectedValues = new Set(column.getFilterValue() as string[]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-start"
          title={`Filter by ${title}`}
        >
          <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
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
          >
            {option}
            <span className="ml-auto flex h-4 w-4 items-center justify-center text-xs">
              {facetedFilter.get(option)}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<BlogPost>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <CheckboxComponent
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] ml-4"
      />
    ),
    cell: ({ row }) => (
      <CheckboxComponent
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] ml-4"
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
      return (
        <div className="flex space-x-2">
          <TruncatedText
            text={row.getValue("title")}
            maxWidth="max-w-[200px] md:max-w-[300px] lg:max-w-[400px]"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Slug" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <TruncatedText
            text={row.getValue("slug")}
            maxWidth="max-w-[150px] md:max-w-[200px] lg:max-w-[250px]"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "authors",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Authors" />
    ),
    cell: ({ row }) => {
      const authors = row.getValue("authors") as string[] | undefined;
      return (
        <div className="w-full max-w-[150px] md:max-w-[200px] lg:max-w-[250px]">
          <TruncatedAuthors authors={authors || []} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const authors = row.getValue(id) as string[];
      if (!authors || !value || value.length === 0) return true;
      return authors.some((author) => value.includes(author));
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className="flex w-[100px] items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              status === "Published"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      const timezone = useTimezoneStore.getState().timezone;
      const formattedDate = date.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      });

      return (
        <div className="flex space-x-2">
          <TruncatedText
            text={formattedDate}
            maxWidth="max-w-[150px] md:max-w-[200px]"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[] | undefined;
      return (
        <div className="w-full max-w-[100px] md:max-w-[120px] lg:max-w-[150px]">
          <TruncatedTags tags={tags || []} />
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const tags = row.getValue(id) as string[];
      if (!tags || !value || value.length === 0) return true;
      return tags.some((tag) => value.includes(tag));
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
