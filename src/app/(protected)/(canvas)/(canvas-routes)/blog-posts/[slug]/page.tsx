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
  updateBlogPostTitle,
  updateBlogPostSlug,
} from "@/server/actions/blog-posts";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/app/_lib/utils";

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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSlug, setEditedSlug] = useState("");
  const [isTitleTooLong, setIsTitleTooLong] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSlugValid, setIsSlugValid] = useState(true);
  const [isSlugSaving, setIsSlugSaving] = useState(false);
  const [slugStats, setSlugStats] = useState({ words: 0, chars: 0 });
  const [isSlugTooLong, setIsSlugTooLong] = useState(false);

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

  // Initialize title and slug when post data is loaded
  React.useEffect(() => {
    if (post) {
      setEditedTitle(post.title);
      setEditedSlug(slug);
      setIsTitleTooLong(post.title.length > 60);
    }
  }, [post, slug]);

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

  const updateTitleMutation = useMutation({
    mutationFn: async ({
      postId,
      title,
    }: {
      postId: string;
      title: string;
    }) => {
      const result = await updateBlogPostTitle(postId, title);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Update the cache with the new title
      queryClient.setQueryData(
        ["blogPost", slug],
        (oldData: BlogPostResponse | undefined) => {
          if (!oldData?.post) return oldData;
          return {
            ...oldData,
            post: {
              ...oldData.post,
              title: editedTitle,
              updatedAt: new Date(),
            },
          };
        }
      );
      setIsEditingTitle(false);
      setIsSaving(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update title"
      );
      setIsSaving(false);
    },
  });

  const updateSlugMutation = useMutation({
    mutationFn: async ({
      postId,
      slug: newSlug,
    }: {
      postId: string;
      slug: string;
    }) => {
      const result = await updateBlogPostSlug(postId, newSlug);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: (_, { slug: newSlug }) => {
      setIsEditingSlug(false);
      setIsSlugSaving(false);

      // Update the URL without adding to history
      window.history.replaceState({}, "", `/blog-posts/${newSlug}`);

      // Invalidate and refetch with new slug
      queryClient.invalidateQueries({ queryKey: ["blogPost", slug] });

      // Force a page reload to ensure everything is in sync
      window.location.reload();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update slug"
      );
      setIsSlugSaving(false);
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

  const hasUnsavedTags = React.useMemo(() => {
    return (
      Object.values(tags).some((tag) => !tag.isSaved && !tag.isError) ||
      pendingTagMutations.current.size > 0
    );
  }, [tags, pendingTagMutations.current.size]);

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || editedTitle === post.title) {
      setIsEditingTitle(false);
      return;
    }
    setIsSaving(true);
    updateTitleMutation.mutate({ postId: post.id, title: editedTitle });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase();
    setEditedSlug(newSlug);
    setIsSlugValid(validateSlug(newSlug));
    calculateSlugStats(newSlug);
  };

  const handleSlugSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || editedSlug === slug || !isSlugValid) {
      setIsEditingSlug(false);
      return;
    }
    setIsSlugSaving(true);
    updateSlugMutation.mutate({ postId: post.id, slug: editedSlug });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTitle = e.target.value;
    setEditedTitle(newTitle);

    if (newTitle.length > 60 && !isTitleTooLong) {
      setIsTitleTooLong(true);
      toast.warning("Title is longer than recommended 60 characters", {
        description: "Consider making it shorter for better readability",
        duration: 4000,
      });
    } else if (newTitle.length <= 60 && isTitleTooLong) {
      setIsTitleTooLong(false);
    }
  };

  const validateSlug = (value: string) => {
    // Primary validation: only lowercase letters, numbers, and hyphens between words
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  };

  const calculateSlugStats = (value: string) => {
    const words = value.split("-").filter(Boolean).length;
    const chars = value.length;
    const isTooLong = words > 6 || chars > 60;

    setSlugStats({ words, chars });
    setIsSlugTooLong(isTooLong);

    if (isTooLong) {
      toast.warning("Slug exceeds recommended length", {
        description:
          "Ideal slug length is 3-6 words or under 60 characters for better SEO",
        duration: 4000,
      });
    }
  };

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
                  {isSaving || hasUnsavedTags ? (
                    <div className="flex items-center gap-2">
                      <span>Saving changes</span>
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      Updated{" "}
                      <TimeAgo
                        date={post.updatedAt}
                        key={post.updatedAt.toString()}
                        formatter={(value, unit) => {
                          if (unit === "second") return "just now";
                          const plural = value !== 1 ? "s" : "";
                          return `${value} ${unit}${plural} ago`;
                        }}
                      />
                    </div>
                  )}
                </time>
              </div>

              <div
                onClick={() => setIsEditingTitle(true)}
                className="cursor-pointer inline-block w-full"
              >
                {isEditingTitle ? (
                  <form onSubmit={handleTitleSubmit} className="m-0">
                    <Textarea
                      value={editedTitle}
                      onChange={handleTitleChange}
                      className={cn(
                        "!text-5xl !font-semibold !tracking-tight !min-h-[1.2em] !py-0 !px-2 !-mx-2 !border-0 !outline-none !ring-0 !ring-offset-0 !shadow-none !focus:border-0 !focus:outline-none !focus:ring-0 !focus:ring-offset-0 !focus-visible:border-0 !focus-visible:outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0 !bg-muted/50 !rounded !w-full !resize-none !overflow-hidden",
                        isTitleTooLong && "!text-yellow-500"
                      )}
                      style={{ lineHeight: "1.2 !important" }}
                      autoFocus
                      onBlur={handleTitleSubmit}
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleTitleSubmit(e);
                        }
                      }}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {editedTitle.length}/60 characters
                    </div>
                  </form>
                ) : (
                  <h1
                    className={cn(
                      "text-5xl font-semibold tracking-tight hover:bg-muted/50 px-2 py-1 -mx-2 rounded whitespace-pre-wrap",
                      isTitleTooLong && "text-yellow-500"
                    )}
                  >
                    {post.title}
                  </h1>
                )}
              </div>

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center font-mono">
                    <span className="text-muted-foreground/80">
                      {process.env.NEXT_PUBLIC_PRODUCT_BLOG_URL}/
                    </span>
                    <div className="flex-1">
                      {isEditingSlug ? (
                        <form onSubmit={handleSlugSubmit} className="w-full">
                          <div className="flex items-center w-full">
                            <Input
                              type="text"
                              value={editedSlug}
                              onChange={handleSlugChange}
                              className={cn(
                                "py-0 px-0 border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-mono w-full outline-none !shadow-none",
                                !isSlugValid && "text-red-500",
                                isSlugTooLong && "text-yellow-500"
                              )}
                              style={{ boxShadow: "none" }}
                              autoFocus
                              onBlur={handleSlugSubmit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSlugSubmit(e);
                                }
                              }}
                            />
                            {isSlugSaving && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin ml-2" />
                            )}
                          </div>
                        </form>
                      ) : (
                        <div
                          onClick={() => setIsEditingSlug(true)}
                          className="cursor-pointer text-foreground hover:bg-muted/50 px-2 py-1 -mx-2 rounded whitespace-pre-wrap"
                        >
                          {slug}
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditingSlug && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {slugStats.words}{" "}
                      {slugStats.words === 1 ? "word" : "words"} /{" "}
                      {slugStats.chars}{" "}
                      {slugStats.chars === 1 ? "char" : "chars"}
                      <span className="text-muted-foreground/60 ml-1">
                        (Ideal: 3-6 words, under 60 chars)
                      </span>
                    </div>
                  )}
                </div>
              </div>

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
                      className="flex items-center gap-1 bg-secondary bg-opacity-20 hover:bg-primary hover:bg-opacity-30 px-3 py-1.5 rounded-md text-sm text-secondary-foreground hover:text-primary-foreground transition-colors duration-200"
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
