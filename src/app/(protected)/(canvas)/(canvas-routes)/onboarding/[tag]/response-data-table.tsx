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
import { ApiOnboardingQuestion } from "./page";
import { OnboardingResponse } from "./response-columns";

interface ResponseDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  questions: ApiOnboardingQuestion[];
  onViewDetails: (response: OnboardingResponse) => void;
  onFilteredDataChange?: (filteredData: TData[]) => void;
}

export function ResponseDataTable<TData, TValue>({
  columns,
  data,
  questions,
  onViewDetails,
  onFilteredDataChange,
}: ResponseDataTableProps<TData, TValue>) {
  // Add a ref to safely access the table instance
  const tableRef = React.useRef<any>(null);

  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [questionFilters, setQuestionFilters] = React.useState<
    Record<string, string[]>
  >({});

  // Memoize state update handlers
  const handleRowSelectionChange = React.useCallback(
    (value: Record<string, boolean>) => {
      setRowSelection(value);
    },
    []
  );

  const handleColumnVisibilityChange = React.useCallback(
    (value: VisibilityState) => {
      setColumnVisibility(value);
    },
    []
  );

  const handleColumnFiltersChange = React.useCallback(
    (value: ColumnFiltersState) => {
      setColumnFilters(value);
    },
    []
  );

  const handleSortingChange = React.useCallback((value: SortingState) => {
    setSorting(value);
  }, []);

  const handleGlobalFilterChange = React.useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

  // Apply question-specific filtering to the data with improved memoization
  const filteredData = React.useMemo(() => {
    // Skip filtering if there are no question filters
    if (Object.keys(questionFilters).length === 0) {
      return data;
    }

    // Get only the question filters that actually have selected options
    const activeFilters = Object.entries(questionFilters).filter(
      ([_, selectedOptionIds]) => selectedOptionIds.length > 0
    );

    // If no active filters, return the original data
    if (activeFilters.length === 0) {
      return data;
    }

    // Apply question filters with optimization
    return data.filter((response) => {
      // Type assertion as we know the structure
      const typedResponse = response as unknown as OnboardingResponse;

      // For performance, extract answers once
      const answers = typedResponse.answers || [];
      if (answers.length === 0) return false;

      // Check each active question filter
      for (const [questionId, selectedOptionIds] of activeFilters) {
        // Find the answer for this question - using find is more performant than filter here
        const answer = answers.find((a) => a.questionId === questionId);

        // No answer found, this response doesn't match
        if (!answer || !answer.selectedOptions) return false;

        // Get all option IDs for this answer, only once
        const optionIds = answer.selectedOptions.map((opt) => opt.optionId);

        // Check if any of the selected options match this answer - use some for early return
        const hasMatch = selectedOptionIds.some((id) => optionIds.includes(id));

        // If no match found for this question, exclude the response
        if (!hasMatch) return false;
      }

      // If we got here, all question filters match
      return true;
    });
  }, [data, questionFilters]);

  // Create the table
  const table = useReactTable(
    React.useMemo(
      () => ({
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
        onRowSelectionChange: handleRowSelectionChange,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onColumnVisibilityChange: handleColumnVisibilityChange,
        onGlobalFilterChange: handleGlobalFilterChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
      }),
      [
        filteredData,
        columns,
        sorting,
        columnVisibility,
        rowSelection,
        columnFilters,
        globalFilter,
        handleRowSelectionChange,
        handleSortingChange,
        handleColumnFiltersChange,
        handleColumnVisibilityChange,
        handleGlobalFilterChange,
      ]
    )
  );

  // Store the table reference
  React.useEffect(() => {
    tableRef.current = table;
  }, [table]);

  // Use a ref to track the latest filter state to avoid stale closures
  const filterStateRef = React.useRef({
    sorting,
    columnFilters,
    globalFilter,
    questionFilters,
  });

  // Update the ref whenever filter states change
  React.useEffect(() => {
    filterStateRef.current = {
      sorting,
      columnFilters,
      globalFilter,
      questionFilters,
    };
  }, [sorting, columnFilters, globalFilter, questionFilters]);

  // Now define notifyFilteredDataChange AFTER table is created
  const notifyFilteredDataChange = React.useCallback(() => {
    if (!onFilteredDataChange || !tableRef.current) return;

    // Use the ref to access the current table instance
    const filteredRows = tableRef.current
      .getFilteredRowModel()
      .rows.map((row: any) => row.original);

    // Use a timeout to avoid React rendering issues
    const timerId = setTimeout(() => {
      onFilteredDataChange(filteredRows);
    }, 10);

    return () => clearTimeout(timerId);
  }, [onFilteredDataChange]);

  // Apply the notification effect with better dependency handling
  React.useEffect(() => {
    // Small delay to allow rendering to complete
    const timerId = setTimeout(() => {
      notifyFilteredDataChange();
    }, 50);

    return () => clearTimeout(timerId);
  }, [
    notifyFilteredDataChange,
    // Use stringified versions of complex objects to better detect changes
    JSON.stringify(sorting),
    JSON.stringify(columnFilters),
    globalFilter,
    JSON.stringify(questionFilters),
  ]);

  // Memoize the callback to prevent unnecessary re-renders
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
