"use client";

import { Row } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Pen, Eye, Trash } from "lucide-react";
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
import { BlogPost } from "./columns";
import { deleteBlogPost } from "@/server/actions/blog-posts";
import { useQueryClient } from "@tanstack/react-query";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const post = row.original as BlogPost;
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteBlogPost(post.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Blog post deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      }
    } catch (error) {
      toast.error("Failed to delete blog post");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
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
          <Link href={`/blog-posts/${post.slug}`} passHref>
            <DropdownMenuItem asChild>
              <span>
                <Eye className="mr-2 h-3.5 w-3.5" />
                View
                <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
              </span>
            </DropdownMenuItem>
          </Link>
          <Link href={`/blog-posts/${post.slug}/edit`} passHref>
            <DropdownMenuItem asChild>
              <span>
                <Pen className="mr-2 h-3.5 w-3.5" />
                Edit
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Make a copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setDeleteAlertOpen(true)}
          >
            <Trash className="mr-2 h-3.5 w-3.5" />
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post titled &quot;{post.title}&quot;.
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
    </>
  );
}
