"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Button } from "@/app/_components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getBlogPostBySlug } from "@/server/actions/blog-posts";
import Image from "next/image";

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
        <article className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-medium">Article</span>
                <span>•</span>
                <time dateTime={post.createdAt.toISOString()}>
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>

              <h1 className="text-5xl font-semibold tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <Image
                    src={
                      post.author.picture ||
                      "https://avatars.githubusercontent.com/u/124599?v=4"
                    }
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  {post.author.profileLink ? (
                    <Link
                      href={post.author.profileLink}
                      className="font-medium hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {post.author.name}
                    </Link>
                  ) : (
                    <span className="font-medium">{post.author.name}</span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {post.author.designation || "Author"}
                  </span>
                </div>
              </div>
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
        </article>
      ) : null}
    </div>
  );
}
