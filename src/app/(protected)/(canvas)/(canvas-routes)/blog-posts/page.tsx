"use client";

import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { CreateBlogPostDialog } from "./create-blog-post-dialog";
import { getBlogPosts } from "@/server/actions/blog-posts";
import { BlogPost } from "./columns";

// Define the API response type
interface ApiBlogPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
  author: {
    name: string;
  };
  tags: Array<{
    tag: string;
  }>;
}

interface ApiResponse {
  posts?: ApiBlogPost[];
  error?: string;
}

export default function BlogPostsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["blogPosts"],
    queryFn: async () => {
      const response = (await getBlogPosts()) as ApiResponse;
      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.posts) {
        return [];
      }

      // Transform the data to match the BlogPost type
      const transformedPosts: BlogPost[] = response.posts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        authors: [post.author.name],
        status: post.status,
        date: post.createdAt,
        tags: post.tags.map((tag) => tag.tag),
      }));

      return transformedPosts;
    },
  });

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
        <CreateBlogPostDialog />
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
