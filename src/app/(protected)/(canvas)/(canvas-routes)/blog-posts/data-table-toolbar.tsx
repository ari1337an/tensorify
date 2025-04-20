"use client";

import { Table } from "@tanstack/react-table";
import { X, RefreshCcw } from "lucide-react";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { DataTableViewOptions } from "./data-table-view-options";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast.success("Data refreshed");
    } catch {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter posts..."
          value={table.getState().globalFilter || ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span className="sr-only">Refresh</span>
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
