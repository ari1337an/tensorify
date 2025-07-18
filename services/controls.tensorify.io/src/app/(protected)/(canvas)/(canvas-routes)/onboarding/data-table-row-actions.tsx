"use client";

import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pen, Eye, Trash, Archive, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { toast } from "sonner";
import { OnboardingTagVersion } from "./columns";
import { useQueryClient } from "@tanstack/react-query";
import {
  deleteOnboardingTagVersion,
  publishOnboardingTagVersion,
  archiveOnboardingTagVersion,
} from "@/server/actions/onboarding";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const version = row.original as OnboardingTagVersion;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [publishAlertOpen, setPublishAlertOpen] = useState(false);
  const [archiveAlertOpen, setArchiveAlertOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteOnboardingTagVersion(version.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Onboarding version deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["onboardingTagVersions"] });
      }
    } catch (error) {
      toast.error("Failed to delete onboarding version");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const result = await publishOnboardingTagVersion(version.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Onboarding version published successfully");
        queryClient.invalidateQueries({ queryKey: ["onboardingTagVersions"] });
      }
    } catch (error) {
      toast.error("Failed to publish onboarding version");
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
      setPublishAlertOpen(false);
    }
  };

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      const result = await archiveOnboardingTagVersion(version.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Onboarding version archived successfully");
        queryClient.invalidateQueries({ queryKey: ["onboardingTagVersions"] });
      }
    } catch (error) {
      toast.error("Failed to archive onboarding version");
      console.error("Archive error:", error);
    } finally {
      setIsArchiving(false);
      setArchiveAlertOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <Link href={`/onboarding/${version.tag}`} passHref>
            <DropdownMenuItem asChild>
              <span>
                {version.status === "PUBLISHED" ? (
                  <Eye className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Pen className="mr-2 h-3.5 w-3.5" />
                )}
                {version.status === "PUBLISHED" ? "View" : "Edit"}
                <DropdownMenuShortcut>
                  {version.status === "PUBLISHED" ? "⌘V" : "⌘E"}
                </DropdownMenuShortcut>
              </span>
            </DropdownMenuItem>
          </Link>

          {version.status === "DRAFT" && (
            <DropdownMenuItem onClick={() => setPublishAlertOpen(true)}>
              <Check className="mr-2 h-3.5 w-3.5" />
              Publish
              <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          {version.status === "PUBLISHED" && (
            <DropdownMenuItem onClick={() => setArchiveAlertOpen(true)}>
              <Archive className="mr-2 h-3.5 w-3.5" />
              Archive
              <DropdownMenuShortcut>⌘A</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {version.status === "DRAFT" && version.responseCount === 0 && (
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => setDeleteAlertOpen(true)}
            >
              <Trash className="mr-2 h-3.5 w-3.5" />
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              onboarding version with tag &quot;{version.tag}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 focus:ring-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Alert Dialog */}
      <AlertDialog open={publishAlertOpen} onOpenChange={setPublishAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish this version?</AlertDialogTitle>
            <AlertDialogDescription>
              Publishing this version will lock all questions for editing. Only
              metadata can be changed after publishing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handlePublish();
              }}
              disabled={isPublishing}
              className="bg-green-600 focus:ring-green-600"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Alert Dialog */}
      <AlertDialog open={archiveAlertOpen} onOpenChange={setArchiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this version?</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving this version will remove it from active use. All
              existing data will be preserved, but new responses won&apos;t be
              collected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleArchive();
              }}
              disabled={isArchiving}
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
