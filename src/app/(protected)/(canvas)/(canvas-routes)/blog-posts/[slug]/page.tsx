"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Button } from "@/app/_components/ui/button";
import { ArrowLeft, X, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  getBlogPostBySlug,
  addTagToBlogPost,
  removeTagFromBlogPost,
} from "@/server/actions/blog-posts";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { Input } from "@/app/_components/ui/input";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  tags: Array<{ id: string; tag: string }>;
  updatedAt: Date;
  title: string;
  author: {
    name: string;
    picture: string | null;
    profileLink: string | null;
    designation: string | null;
  };
}

interface BlogPostResponse {
  error?: string;
  post?: BlogPost;
}

interface TagItem {
  id?: string;
  tag: string;
  isSaved: boolean;
  isError?: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [tags, setTags] = useState<Record<string, TagItem>>({});

  // Keep track of tags that are being deleted
  const pendingDeletions = useRef<Set<string>>(new Set());
  // Keep track of tag mutations in progress
  const pendingTagMutations = useRef<Set<string>>(new Set());

  // Query for blog post data
  const { data, error, isLoading } = useQuery<BlogPostResponse>({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const response = await getBlogPostBySlug(slug);
      if (response.error) {
        throw new Error(response.error);
      }
      return response as BlogPostResponse;
    },
  });

  const post = data?.post;

  // Initialize tags when post data is loaded
  React.useEffect(() => {
    if (post?.tags) {
      setTags((prevTags) => {
        // Create new tags object from post.tags - excluding any pending deletions
        const newTags: Record<string, TagItem> = post.tags
          .filter((tag) => !pendingDeletions.current.has(tag.tag)) // Skip tags with pending deletions
          .reduce(
            (acc, tag) => ({
              ...acc,
              [tag.tag]: {
                id: tag.id,
                tag: tag.tag,
                isSaved: true,
              },
            }),
            {} as Record<string, TagItem>
          );

        // Preserve any tags that are currently in 'saving' state
        Object.entries(prevTags).forEach(([tagName, tagItem]) => {
          // Keep tags that are being added but haven't saved yet
          if (
            !tagItem.isSaved &&
            !tagItem.isError &&
            !pendingDeletions.current.has(tagName)
          ) {
            newTags[tagName] = tagItem;
          }
        });

        return newTags;
      });
    }
  }, [post?.tags]);

  const addTagMutation = useMutation({
    mutationFn: async ({
      postId,
      tagName,
    }: {
      postId: string;
      tagName: string;
    }) => {
      pendingTagMutations.current.add(tagName);
      try {
        const result = await addTagToBlogPost(postId, tagName);
        if (result.error) {
          throw new Error(result.error);
        }
        return { success: true, tagId: result.tagId, tagName };
      } finally {
        pendingTagMutations.current.delete(tagName);
      }
    },
    onSuccess: (result) => {
      const { tagId, tagName } = result;
      setTags((prev) => ({
        ...prev,
        [tagName]: {
          ...prev[tagName],
          id: tagId,
          isSaved: true,
          isError: false,
        },
      }));

      // Update the cache
      queryClient.setQueryData(
        ["blogPost", slug],
        (oldData: BlogPostResponse | undefined) => {
          if (!oldData?.post) return oldData;
          return {
            ...oldData,
            post: {
              ...oldData.post,
              tags: [
                ...oldData.post.tags.filter((t) => t.tag !== tagName),
                { id: tagId, tag: tagName },
              ],
            },
          };
        }
      );
    },
    onError: (error, { tagName }) => {
      setTags((prev) => ({
        ...prev,
        [tagName]: {
          ...prev[tagName],
          isError: true,
        },
      }));
      toast.error(error instanceof Error ? error.message : "Failed to add tag");
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async ({
      postId,
      tagId,
      tagName,
    }: {
      postId: string;
      tagId: string;
      tagName: string;
    }) => {
      pendingTagMutations.current.add(tagName);
      try {
        const result = await removeTagFromBlogPost(postId, tagId);
        if (result.error) {
          throw new Error(result.error);
        }
        return { success: true, tagName };
      } finally {
        pendingTagMutations.current.delete(tagName);
      }
    },
    onSuccess: (result) => {
      const { tagName } = result;
      // Remove from pending deletions since it's now successfully deleted
      pendingDeletions.current.delete(tagName);

      // Fully remove the tag from state
      setTags((prev) => {
        const newTags = { ...prev };
        delete newTags[tagName];
        return newTags;
      });

      // Update cache
      queryClient.setQueryData(
        ["blogPost", slug],
        (oldData: BlogPostResponse | undefined) => {
          if (!oldData?.post) return oldData;
          return {
            ...oldData,
            post: {
              ...oldData.post,
              tags: oldData.post.tags.filter((t) => t.tag !== tagName),
            },
          };
        }
      );
    },
    onError: (error, { tagName }) => {
      // Remove from pending deletions since the operation failed
      pendingDeletions.current.delete(tagName);

      // Revert the tag's state
      if (post) {
        const matchingTag = post.tags.find((t) => t.tag === tagName);
        if (matchingTag) {
          setTags((prev) => ({
            ...prev,
            [tagName]: {
              id: matchingTag.id,
              tag: tagName,
              isSaved: true,
              isError: true,
            },
          }));
        }
      }

      toast.error(
        error instanceof Error ? error.message : "Failed to remove tag"
      );
    },
  });

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !post) return;

    const tagName = newTag.trim();

    // Check if tag already exists or is pending deletion
    if (tags[tagName] && !tags[tagName].isError) {
      toast.error("This tag already exists");
      return;
    }

    // Add to state immediately
    setTags((prev) => ({
      ...prev,
      [tagName]: {
        tag: tagName,
        isSaved: false,
        isError: false,
      },
    }));

    setNewTag(""); // Clear input
    setIsInputVisible(false); // Hide input field after adding tag
    addTagMutation.mutate({ postId: post.id, tagName });
  };

  const handleRemoveTag = (tagId: string, tagName: string) => {
    if (!post || !tagId) return;

    // Add to pending deletions set
    pendingDeletions.current.add(tagName);

    // Immediately remove from UI for a snappier experience
    setTags((prev) => {
      const newTags = { ...prev };
      delete newTags[tagName];
      return newTags;
    });

    removeTagMutation.mutate({ postId: post.id, tagId, tagName });
  };

  const hasUnsavedChanges = React.useMemo(() => {
    return (
      Object.values(tags).some((tag) => !tag.isSaved && !tag.isError) ||
      pendingTagMutations.current.size > 0
    );
  }, [tags, pendingTagMutations.current.size]);

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
                <time
                  dateTime={post.updatedAt.toISOString()}
                  className="flex items-center gap-2"
                >
                  {hasUnsavedChanges ? (
                    <div key="saving" className="flex items-center gap-2">
                      <span>Saving changes</span>
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  ) : (
                    <div key="updated" className="flex items-center gap-1">
                      Updated{" "}
                      <TimeAgo
                        date={post.updatedAt}
                        key={post.updatedAt.toString()}
                      />
                    </div>
                  )}
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

              {/* Redesigned tag section */}
              <div className="flex flex-wrap items-center gap-2">
                {Object.values(tags).map((tag) => (
                  <div
                    key={tag.tag}
                    className={`group flex items-center gap-1 bg-primary ${
                      tag.isError ? "bg-red-500/20" : "bg-opacity-20"
                    } px-3 py-1.5 rounded-md transition-all duration-200`}
                  >
                    <span className="text-sm text-primary-foreground">
                      {tag.tag}
                    </span>
                    {!tag.isSaved ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground/60" />
                    ) : (
                      <button
                        onClick={() => handleRemoveTag(tag.id || "", tag.tag)}
                        className="transition-opacity duration-200"
                      >
                        <X className="h-3.5 w-3.5 text-primary-foreground/40 hover:text-primary-foreground" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Add tag input */}
                <div className="relative">
                  {!isInputVisible ? (
                    <button
                      onClick={() => setIsInputVisible(true)}
                      className="flex items-center gap-1 bg-secondary bg-opacity-20 hover:bg-primary hover:bg-opacity-30 px-3 py-1.5 rounded-md text-sm text-primary-foreground transition-colors duration-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Tag
                    </button>
                  ) : (
                    <form onSubmit={handleAddTag} className="flex items-center">
                      <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag..."
                        className="h-8 min-w-[150px] text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                        autoFocus
                        onBlur={() => {
                          if (!newTag.trim()) {
                            setIsInputVisible(false);
                          }
                        }}
                      />
                    </form>
                  )}
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
