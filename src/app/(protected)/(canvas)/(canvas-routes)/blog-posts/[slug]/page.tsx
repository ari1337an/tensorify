"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Button } from "@/app/_components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getBlogPostBySlug } from "@/server/actions/blog-posts";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;

  const {
    data: post,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const response = await getBlogPostBySlug(slug);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.post;
    },
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" asChild className="mr-4">
            <Link href="/blog-posts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog Posts
            </Link>
          </Button>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : "Failed to load blog post"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/blog-posts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog Posts
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : post ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span>By {post.author.name}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span className="capitalize">
                {post.type.toLowerCase().replace(/_/g, " ")}
              </span>
              <span className="mx-2">•</span>
              <span className="capitalize">{post.status.toLowerCase()}</span>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {/* This is a placeholder for the blog post content editor */}
            <p>Blog post content editor will be implemented here.</p>
            <p>
              This page will allow editing the blog post content, tags, and
              other metadata.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
