"use client";

import * as React from "react";
import { Separator } from "@/app/_components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/app/_components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/_components/ui/pagination";
import { useTeamspacesLogic } from "./logic";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/app/_components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";

export function TeamspacesView() {
  const {
    teams,
    loading,
    error,
    page,
    limit,
    handlePageChange,
    handleLimitChange,
    refresh,
  } = useTeamspacesLogic();

  // Generate pagination links
  const renderPagination = () => {
    if (!teams) return null;

    const { totalPages, currentPage } = teams;

    // Calculate page numbers to show (always show first, last, and a few around current)
    let pages: (number | null)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first page
      pages.push(1);

      // If current page is near the beginning
      if (currentPage <= 3) {
        pages.push(2, 3, 4, 5, null, totalPages);
      }
      // If current page is near the end
      else if (currentPage >= totalPages - 2) {
        pages.push(
          null,
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      }
      // If current page is in the middle
      else {
        pages.push(
          null,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          null,
          totalPages
        );
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pages.map((pageNum, index) =>
            pageNum === null ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <span className="flex h-9 w-9 items-center justify-center">
                  ...
                </span>
              </PaginationItem>
            ) : (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Organization Members</h2>
        <p className="text-sm text-muted-foreground">
          Manage organization members and their roles in the organization.
        </p>
      </div>

      <Separator />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-4">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-auto"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-8 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading teams...</p>
          </div>
        ) : teams && teams.teams.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-4 py-2">
              <div>
                <span className="text-sm text-muted-foreground">
                  Showing {teams.teams.length} of {teams.totalCount} teams
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(value) => handleLimitChange(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={limit} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead className="text-right">Members</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell>{`${team.admin.firstName} ${team.admin.lastName}`}</TableCell>
                    <TableCell className="text-right">
                      {team.memberCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {renderPagination()}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No teams found</p>
            <p className="text-sm text-muted-foreground">
              Create a team to get started
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="mt-4"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamspacesView;
