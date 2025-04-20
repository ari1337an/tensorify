"use client";

import React, { useCallback } from "react";
import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { getBlogPosts } from "../../../../../server/actions/blog-posts";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { toast } from "sonner";

export default function BlogPostsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = await getBlogPosts();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.posts;
    },
  });

  const handleCreateNewPost = useCallback(() => {
    // Implement new post creation logic
    toast.info("Create new post functionality to be implemented");
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Blog Posts</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : "Failed to load blog posts"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={handleCreateNewPost}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
