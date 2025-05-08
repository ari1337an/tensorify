"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";

import { DataTablePagination } from "../data-table-pagination";
import { ResponseTableToolbar } from "./response-table-toolbar";
import { OnboardingResponse } from "./response-columns";

// Define ApiOnboardingQuestion directly here since there's an import issue
interface ApiOnboardingQuestion {
  id: string;
  slug: string;
  title: string;
  type: string;
  iconSlug: string | null;
  sortOrder: number;
  allowOtherOption: boolean;
  options: Array<{
    id: string;
    value: string;
    label: string;
    iconSlug: string | null;
    sortOrder: number;
  }>;
}

interface ResponseDataTableProps {
  columns: ColumnDef<OnboardingResponse>[];
  data: OnboardingResponse[];
  questions: ApiOnboardingQuestion[];
  onFilteredDataChange?: (filteredData: OnboardingResponse[]) => void;
}

export function ResponseDataTable({
  columns,
  data,
  questions,
  onFilteredDataChange,
}: ResponseDataTableProps) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [questionFilters, setQuestionFilters] = React.useState<
    Record<string, string[]>
  >({});

  // Apply question-specific filtering to the data
  const filteredData = React.useMemo(() => {
    // Skip filtering if there are no question filters
    if (Object.keys(questionFilters).length === 0) {
      return data;
    }

    // Get only the question filters that actually have selected options
    const activeFilters = Object.entries(questionFilters).filter(
      (entry) => entry[1].length > 0
    );

    // If no active filters, return the original data
    if (activeFilters.length === 0) {
      return data;
    }

    // Apply question filters
    return data.filter((response) => {
      const answers = response.answers || [];
      if (answers.length === 0) return false;

      // Check each active question filter
      for (const [questionId, selectedOptionIds] of activeFilters) {
        // Find the answer for this question
        const answer = answers.find((a) => a.questionId === questionId);

        // No answer found, this response doesn't match
        if (!answer || !answer.selectedOptions) return false;

        // Get all option IDs for this answer
        const optionIds = answer.selectedOptions.map((opt) => opt.optionId);

        // Check if any of the selected options match this answer
        const hasMatch = selectedOptionIds.some((id) => optionIds.includes(id));

        // If no match found for this question, exclude the response
        if (!hasMatch) return false;
      }

      // If we got here, all question filters match
      return true;
    });
  }, [data, questionFilters]);

  // Create the table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Notify parent component of filtered data changes
  React.useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(
        table.getFilteredRowModel().rows.map((row) => row.original)
      );
    }
  }, [
    table,
    onFilteredDataChange,
    sorting,
    columnFilters,
    globalFilter,
    questionFilters,
  ]);

  // Handle question filter changes
  const handleQuestionFilterChange = React.useCallback(
    (questionId: string, optionIds: string[]) => {
      setQuestionFilters((prev) => ({
        ...prev,
        [questionId]: optionIds,
      }));
    },
    []
  );

  return (
    <div className="space-y-4">
      <ResponseTableToolbar
        table={table}
        questions={questions}
        onQuestionFilterChange={handleQuestionFilterChange}
        questionFilters={questionFilters}
      />
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.column.getSize() }}
                      className="whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
