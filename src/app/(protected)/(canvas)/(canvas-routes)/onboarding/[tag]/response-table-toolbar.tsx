"use client";

import { Table } from "@tanstack/react-table";
import { X, Filter } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { DataTableViewOptions } from "../data-table-view-options";
import { OnboardingResponse } from "./response-columns";
import { Badge } from "@/app/_components/ui/badge";
import { useEffect, useState } from "react";
import { ApiOnboardingQuestion } from "./page";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Calendar } from "@/app/_components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/app/_lib/utils";
import React from "react";

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
  const intentOptions = [
    { value: "WILL_PAY_TEAM", label: "Will Pay (Team)" },
    { value: "WILL_PAY_INDIVIDUAL", label: "Will Pay (Individual)" },
    { value: "CURIOUS", label: "Curious" },
  ];

  // Organization size options
  const orgSizeOptions = [
    { value: "ONE_TO_FIVE", label: "1-5" },
    { value: "SIX_TO_TWENTY_FIVE", label: "6-25" },
    { value: "TWENTY_SIX_TO_FIFTY", label: "26-50" },
    { value: "FIFTY_ONE_TO_ONE_HUNDRED", label: "51-100" },
    { value: "ONE_HUNDRED_ONE_TO_ONE_THOUSAND", label: "101-1,000" },
    { value: "OVER_ONE_THOUSAND", label: "1,000+" },
  ];

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
              {table.getColumn("intentTag")?.getFilterValue()?.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {table.getColumn("intentTag")?.getFilterValue()?.length}
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
              {table.getColumn("orgSizeBracket")?.getFilterValue()?.length >
                0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 rounded-sm px-1 font-normal"
                >
                  {table.getColumn("orgSizeBracket")?.getFilterValue()?.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            {orgSizeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={(
                  (table
                    .getColumn("orgSizeBracket")
                    ?.getFilterValue() as string[]) || []
                ).includes(option.value)}
                onCheckedChange={(checked) => {
                  const filterValues =
                    (table
                      .getColumn("orgSizeBracket")
                      ?.getFilterValue() as string[]) || [];
                  const newFilterValues = checked
                    ? [...filterValues, option.value]
                    : filterValues.filter((value) => value !== option.value);

                  table
                    .getColumn("orgSizeBracket")
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
