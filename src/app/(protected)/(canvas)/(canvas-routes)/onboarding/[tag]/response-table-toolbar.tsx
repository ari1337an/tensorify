"use client";

import { Table } from "@tanstack/react-table";
import { X, Filter } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { DataTableViewOptions } from "../data-table-view-options";
import { Badge } from "@/app/_components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Calendar } from "@/app/_components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/app/_lib/utils";
import React from "react";

// Define ApiOnboardingQuestion interface directly
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

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  questions: ApiOnboardingQuestion[];
  onQuestionFilterChange: (questionId: string, optionIds: string[]) => void;
  questionFilters: Record<string, string[]>;
}

export function ResponseTableToolbar<TData>({
  table,
  questions,
  onQuestionFilterChange,
  questionFilters,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Object.keys(questionFilters).some((key) => questionFilters[key].length > 0);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // Intent options
  const intentOptions = useMemo(
    () => [
      { value: "WILL_PAY_TEAM", label: "Will Pay (Team)" },
      { value: "WILL_PAY_HOBBY", label: "Will Pay (Hobby)" },
      { value: "WILL_NOT_PAY", label: "Will Not Pay" },
      { value: "ENTERPRISE_POTENTIAL", label: "Enterprise Potential" },
      { value: "CURIOUS", label: "Curious" },
    ],
    []
  );

  // Organization size options
  const orgSizeOptions = useMemo(
    () => [
      { value: "LT_20", label: "<20" },
      { value: "FROM_20_TO_99", label: "20-99" },
      { value: "FROM_100_TO_499", label: "100-499" },
      { value: "FROM_500_TO_999", label: "500-999" },
      { value: "GTE_1000", label: "1000+" },
      { value: "<20", label: "<20" },
      { value: "20-99", label: "20-99" },
      { value: "100-499", label: "100-499" },
      { value: "500-999", label: "500-999" },
      { value: "1000+", label: "1000+" },
    ],
    []
  );

  // Update date filter when date range changes
  useEffect(() => {
    if (fromDate && toDate) {
      table.getColumn("createdAt")?.setFilterValue([fromDate, toDate]);
    } else if (table.getColumn("createdAt")?.getFilterValue()) {
      table.getColumn("createdAt")?.setFilterValue(undefined);
    }
  }, [fromDate, toDate, table]);

  // Memoize the resetFilters function to prevent unnecessary re-renders
  const resetFilters = React.useCallback(() => {
    table.resetColumnFilters();
    setFromDate(undefined);
    setToDate(undefined);

    // Reset question filters
    Object.keys(questionFilters).forEach((questionId) => {
      onQuestionFilterChange(questionId, []);
    });
  }, [table, questionFilters, onQuestionFilterChange]);

  // Memoized filter component to prevent unnecessary re-renders
  const renderFilterDropdowns = React.useMemo(() => {
    return (
      <div className="flex flex-wrap gap-2">
        {/* Intent filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Filter className="mr-2 h-4 w-4" />
              Intent
              {Array.isArray(table.getColumn("intentTag")?.getFilterValue()) &&
                (table.getColumn("intentTag")?.getFilterValue() as string[])
                  .length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-sm px-1 font-normal"
                  >
                    {
                      (
                        table
                          .getColumn("intentTag")
                          ?.getFilterValue() as string[]
                      ).length
                    }
                  </Badge>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {intentOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={(
                  (table
                    .getColumn("intentTag")
                    ?.getFilterValue() as string[]) || []
                ).includes(option.value)}
                onCheckedChange={(checked) => {
                  const filterValues =
                    (table
                      .getColumn("intentTag")
                      ?.getFilterValue() as string[]) || [];
                  const newFilterValues = checked
                    ? [...filterValues, option.value]
                    : filterValues.filter((value) => value !== option.value);

                  table
                    .getColumn("intentTag")
                    ?.setFilterValue(
                      newFilterValues.length ? newFilterValues : undefined
                    );
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Organization size filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Filter className="mr-2 h-4 w-4" />
              Org Size
              {Array.isArray(
                table.getColumn("orgSizeBracket")?.getFilterValue()
              ) &&
                (
                  table
                    .getColumn("orgSizeBracket")
                    ?.getFilterValue() as string[]
                ).length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-sm px-1 font-normal"
                  >
                    {
                      (
                        table
                          .getColumn("orgSizeBracket")
                          ?.getFilterValue() as string[]
                      ).length
                    }
                  </Badge>
                )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {/* Remove duplicate labels by filtering */}
            {orgSizeOptions
              .reduce((unique, option) => {
                // Only add if this label doesn't exist yet
                const existingIndex = unique.findIndex(
                  (item) => item.label === option.label
                );
                if (existingIndex === -1) {
                  unique.push(option);
                } else {
                  // If we have both an enum and string format, combine them
                  const existingItem = unique[existingIndex];
                  // Create array of values if not already
                  if (!Array.isArray(existingItem.value)) {
                    existingItem.value = [existingItem.value];
                  }
                  // Add this value if it's not already included
                  if (!existingItem.value.includes(option.value)) {
                    existingItem.value.push(option.value);
                  }
                }
                return unique;
              }, [] as { label: string; value: string | string[] }[])
              .map((option) => (
                <DropdownMenuCheckboxItem
                  key={
                    typeof option.value === "string"
                      ? option.value
                      : option.label
                  }
                  checked={
                    Array.isArray(option.value)
                      ? option.value.some((val) =>
                          (
                            (table
                              .getColumn("orgSizeBracket")
                              ?.getFilterValue() as string[]) || []
                          ).includes(val)
                        )
                      : (
                          (table
                            .getColumn("orgSizeBracket")
                            ?.getFilterValue() as string[]) || []
                        ).includes(option.value)
                  }
                  onCheckedChange={(checked) => {
                    const filterValues =
                      (table
                        .getColumn("orgSizeBracket")
                        ?.getFilterValue() as string[]) || [];

                    // Handle multiple values (enum + string format)
                    const valuesToProcess = Array.isArray(option.value)
                      ? option.value
                      : [option.value];

                    if (checked) {
                      // Add all values for this option
                      const newFilterValues = [...filterValues];
                      valuesToProcess.forEach((val) => {
                        if (!newFilterValues.includes(val)) {
                          newFilterValues.push(val);
                        }
                      });

                      table
                        .getColumn("orgSizeBracket")
                        ?.setFilterValue(newFilterValues);
                    } else {
                      // Remove all values for this option
                      const newFilterValues = filterValues.filter(
                        (val) => !valuesToProcess.includes(val)
                      );

                      table
                        .getColumn("orgSizeBracket")
                        ?.setFilterValue(
                          newFilterValues.length ? newFilterValues : undefined
                        );
                    }
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Filter className="mr-2 h-4 w-4" />
              Date Range
              {(fromDate || toDate) && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {fromDate && toDate ? "Range" : fromDate ? "From" : "To"}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="grid gap-2 p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">From Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">To Date</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        {toDate ? format(toDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFromDate(undefined);
                    setToDate(undefined);
                  }}
                  className="h-8"
                >
                  Clear
                </Button>
                <Button size="sm" onClick={() => {}} className="h-8">
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Questions filters */}
        {questions.map((question) => (
          <DropdownMenu key={question.id}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-dashed">
                <Filter className="mr-2 h-4 w-4" />
                {question.title.length > 20
                  ? `${question.title.slice(0, 20)}...`
                  : question.title}
                {questionFilters[question.id]?.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 rounded-sm px-1 font-normal"
                  >
                    {questionFilters[question.id].length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[250px]">
              {question.options.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  checked={questionFilters[question.id]?.includes(option.id)}
                  onCheckedChange={(checked) => {
                    const currentFilters = questionFilters[question.id] || [];
                    const newFilters = checked
                      ? [...currentFilters, option.id]
                      : currentFilters.filter((id) => id !== option.id);

                    onQuestionFilterChange(question.id, newFilters);
                  }}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}

              {/* Add "Other" option filter if this question allows custom values */}
              {question.allowOtherOption && (
                <DropdownMenuCheckboxItem
                  key="other"
                  checked={questionFilters[question.id]?.includes("other")}
                  onCheckedChange={(checked) => {
                    const currentFilters = questionFilters[question.id] || [];
                    const newFilters = checked
                      ? [...currentFilters, "other"]
                      : currentFilters.filter((id) => id !== "other");

                    onQuestionFilterChange(question.id, newFilters);
                  }}
                  className="border-t mt-1 pt-1 text-primary font-medium"
                >
                  Other (Custom Values)
                </DropdownMenuCheckboxItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    );
  }, [
    table,
    intentOptions,
    orgSizeOptions,
    fromDate,
    toDate,
    questions,
    questionFilters,
    onQuestionFilterChange,
    setFromDate,
    setToDate,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search users, emails..."
            value={(table.getState().globalFilter as string) ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[200px] lg:w-[300px]"
          />
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {renderFilterDropdowns}
    </div>
  );
}
