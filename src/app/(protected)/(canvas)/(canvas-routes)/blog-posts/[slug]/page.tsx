"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Button } from "@/app/_components/ui/button";
import {
  ArrowLeft,
  X,
  Plus,
  Loader2,
  Settings,
  Upload,
  File,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import {
  getBlogPostBySlug,
  addTagToBlogPost,
  removeTagFromBlogPost,
  updateBlogPostTitle,
  updateBlogPostSlug,
  searchTags,
  updateBlogPostSeo,
  updateBlogPostPublishStatus,
} from "@/server/actions/blog-posts";
import Image from "next/image";
import TimeAgo from "react-timeago";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/app/_lib/utils";
import { Editor } from "./dynamic-editor";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";
import uploadFile from "./upload-file";

interface SeoData {
  // Basic Metadata
  metaTitle: string;
  metaDescription: string;
  metaRobots: string;
  keywords: string;
  canonicalUrl: string;
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  // Twitter Card
  twitterCardType: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite: string;
  // Structured Data
  blogpostingHeadline: string;
  blogpostingDescription: string;
  blogpostingAuthorName: string;
  blogpostingAuthorUrl: string;
  blogpostingPublisherName: string;
  blogpostingPublisherLogo: string;
  blogpostingDatePublished: string;
  blogpostingDateModified: string;
  blogpostingKeywords: string;
  blogpostingFeaturedImage: string;
  mainEntityOfPage: string;
  // Additional
  favicon: string;
  language: string;
}

interface BlogPost {
  id: string;
  tags: Array<{ id: string; tag: string }>;
  updatedAt: Date;
  createdAt: Date;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  author: {
    name: string;
    picture: string | null;
    profileLink: string | null;
    designation: string | null;
  };
  seo?: Partial<SeoData>;
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
  const [isTagInputOpen, setIsTagInputOpen] = useState(false);
  const [tagSearchResults, setTagSearchResults] = useState<
    Array<{ id: string; tag: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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

      // Initialize SEO data if available
      if (post.seo) {
        setSeoData({
          // Basic Metadata
          metaTitle: post.seo.metaTitle || post.title || "",
          metaDescription: post.seo.metaDescription || "",
          metaRobots: post.seo.metaRobots || "index, follow",
          keywords: post.seo.keywords || "",
          canonicalUrl: post.seo.canonicalUrl || "",
          // Open Graph
          ogTitle: post.seo.ogTitle || post.title || "",
          ogDescription: post.seo.ogDescription || "",
          ogImage: post.seo.ogImage || "",
          ogUrl: post.seo.ogUrl || "",
          ogType: post.seo.ogType || "article",
          ogSiteName: post.seo.ogSiteName || "Tensorify",
          // Twitter Card
          twitterCardType: post.seo.twitterCardType || "summary_large_image",
          twitterTitle: post.seo.twitterTitle || post.title || "",
          twitterDescription: post.seo.twitterDescription || "",
          twitterImage: post.seo.twitterImage || "",
          twitterSite: post.seo.twitterSite || "@tensorify",
          // Structured Data
          blogpostingHeadline: post.seo.blogpostingHeadline || post.title || "",
          blogpostingDescription: post.seo.blogpostingDescription || "",
          blogpostingAuthorName:
            post.seo.blogpostingAuthorName || post.author?.name || "",
          blogpostingAuthorUrl:
            post.seo.blogpostingAuthorUrl || post.author?.profileLink || "",
          blogpostingPublisherName:
            post.seo.blogpostingPublisherName || "Tensorify",
          blogpostingPublisherLogo: post.seo.blogpostingPublisherLogo || "",
          blogpostingDatePublished:
            post.seo.blogpostingDatePublished ||
            post.createdAt?.toISOString() ||
            new Date().toISOString(),
          blogpostingDateModified:
            post.seo.blogpostingDateModified ||
            post.updatedAt?.toISOString() ||
            new Date().toISOString(),
          blogpostingKeywords: post.seo.blogpostingKeywords || "",
          blogpostingFeaturedImage: post.seo.blogpostingFeaturedImage || "",
          mainEntityOfPage: post.seo.mainEntityOfPage || "",
          // Additional
          favicon: post.seo.favicon || "",
          language: post.seo.language || "en",
        });
      } else {
        // Initialize with default values when no SEO data exists
        setSeoData({
          // Basic Metadata
          metaTitle: post.title || "",
          metaDescription: "",
          metaRobots: "index, follow",
          keywords: "",
          canonicalUrl: "",
          // Open Graph
          ogTitle: post.title || "",
          ogDescription: "",
          ogImage: "",
          ogUrl: "",
          ogType: "article",
          ogSiteName: "Tensorify",
          // Twitter Card
          twitterCardType: "summary_large_image",
          twitterTitle: post.title || "",
          twitterDescription: "",
          twitterImage: "",
          twitterSite: "@tensorify",
          // Structured Data
          blogpostingHeadline: post.title || "",
          blogpostingDescription: "",
          blogpostingAuthorName: post.author?.name || "",
          blogpostingAuthorUrl: post.author?.profileLink || "",
          blogpostingPublisherName: "Tensorify",
          blogpostingPublisherLogo: "",
          blogpostingDatePublished:
            post.createdAt?.toISOString() || new Date().toISOString(),
          blogpostingDateModified:
            post.updatedAt?.toISOString() || new Date().toISOString(),
          blogpostingKeywords: "",
          blogpostingFeaturedImage: "",
          mainEntityOfPage: "",
          // Additional
          favicon: "",
          language: "en",
        });
      }
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

  const handleTagSearch = async (value: string) => {
    setNewTag(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set a new timeout to search after user stops typing
    searchTimeout.current = setTimeout(async () => {
      if (value.trim()) {
        setIsSearching(true);
        try {
          console.log("Searching for tags:", value.trim());
          const result = await searchTags(value.trim());
          console.log("Search result:", result);

          if (result.error) {
            console.error("Search error:", result.error);
          } else if (result.tags) {
            // Filter out tags that are already added
            const filteredTags = result.tags.filter(
              (tag) => !Object.keys(tags).includes(tag.tag)
            );
            console.log("Filtered tags:", filteredTags);
            setTagSearchResults(filteredTags);
          }
        } catch (error) {
          console.error("Error searching tags:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setTagSearchResults([]);
      }
    }, 300);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleTagSelect = (tag: string) => {
    handleAddTag(tag);
    setIsTagInputOpen(false);
    setNewTag("");
    setTagSearchResults([]);
    setIsInputVisible(false);
  };

  const handleAddTag = (tagName: string) => {
    if (!tagName.trim() || !post) return;

    const normalizedTag = tagName.trim().toLowerCase();

    // Check if tag already exists
    if (tags[normalizedTag]) {
      return;
    }

    // Add to state immediately
    setTags((prev) => ({
      ...prev,
      [normalizedTag]: {
        tag: normalizedTag,
        isSaved: false,
        isError: false,
      },
    }));

    // Clear input and close dropdown
    setNewTag("");
    setIsTagInputOpen(false);
    // Hide the input and show the "Add Tag" button again
    setIsInputVisible(false);

    // Start the mutation
    addTagMutation.mutate({ postId: post.id, tagName: normalizedTag });
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
  }, [tags]);

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

  // Add an effect to check whether editor content is being saved
  React.useEffect(() => {
    const checkEditorSavingState = () => {
      const editorSaving = window.editorContentSavingState?.isSaving || false;
      if (editorSaving && !isSaving) {
        setIsSaving(true);
      } else if (!editorSaving && isSaving && !updateTitleMutation.isPending) {
        // Only turn off saving if title mutation is not in progress
        setIsSaving(false);
      }
    };

    // Check initially
    checkEditorSavingState();

    // Set up an interval to check regularly
    const interval = setInterval(checkEditorSavingState, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isSaving, updateTitleMutation.isPending]);

  const [isSeoDialogOpen, setIsSeoDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "basic-metadata",
  ]);
  const [seoData, setSeoData] = useState<SeoData>({
    metaTitle: "",
    metaDescription: "",
    metaRobots: "index, follow",
    keywords: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    ogUrl: "",
    ogType: "article",
    ogSiteName: "Tensorify",
    twitterCardType: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    twitterSite: "@tensorify",
    blogpostingHeadline: "",
    blogpostingDescription: "",
    blogpostingAuthorName: "",
    blogpostingAuthorUrl: "",
    blogpostingPublisherName: "Tensorify",
    blogpostingPublisherLogo: "",
    blogpostingDatePublished: "",
    blogpostingDateModified: "",
    blogpostingKeywords: "",
    blogpostingFeaturedImage: "",
    mainEntityOfPage: "",
    favicon: "",
    language: "en",
  });

  // Handle accordion state changes
  const handleAccordionChange = (value: string[]) => {
    setExpandedSections(value);
  };

  // Update SEO fields and prevent date fields from being edited
  const handleSeoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Skip updates to date fields as they should be controlled by the post metadata
    if (
      name === "blogpostingDatePublished" ||
      name === "blogpostingDateModified"
    ) {
      return;
    }

    setSeoData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SEO Update Mutation
  const updateSeoMutation = useMutation({
    mutationFn: async ({
      postId,
      seoData,
    }: {
      postId: string;
      seoData: SeoData;
    }) => {
      // Update to use the server action
      const result = await updateBlogPostSeo(postId, seoData);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Update the cache with the new SEO data
      queryClient.setQueryData(
        ["blogPost", slug],
        (oldData: BlogPostResponse | undefined) => {
          if (!oldData?.post) return oldData;
          return {
            ...oldData,
            post: {
              ...oldData.post,
              seo: { ...seoData },
              updatedAt: new Date(),
            },
          };
        }
      );
      // Close the dialog
      setIsSeoDialogOpen(false);
      toast.success("SEO settings saved successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update SEO settings"
      );
    },
  });

  const handleSeoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    updateSeoMutation.mutate({ postId: post.id, seoData });
  };

  // Initialize SEO data when dialog opens
  React.useEffect(() => {
    if (isSeoDialogOpen && post) {
      // Reset expanded sections when dialog opens
      setExpandedSections(["basic-metadata"]);

      // Prefill with existing SEO data or defaults
      setSeoData((prev) => ({
        ...prev,
        metaTitle: post.seo?.metaTitle || post.title || "",
        metaDescription: post.seo?.metaDescription || "",
        metaRobots: post.seo?.metaRobots || "index, follow",
        keywords: post.seo?.keywords || "",
        canonicalUrl: post.seo?.canonicalUrl || "",
        ogTitle: post.seo?.ogTitle || post.title || "",
        ogDescription: post.seo?.ogDescription || "",
        ogImage: post.seo?.ogImage || "",
        ogUrl: post.seo?.ogUrl || "",
        ogType: post.seo?.ogType || "article",
        ogSiteName: post.seo?.ogSiteName || "Tensorify",
        twitterCardType: post.seo?.twitterCardType || "summary_large_image",
        twitterTitle: post.seo?.twitterTitle || post.title || "",
        twitterDescription: post.seo?.twitterDescription || "",
        twitterImage: post.seo?.twitterImage || "",
        twitterSite: post.seo?.twitterSite || "@tensorify",
        blogpostingHeadline: post.seo?.blogpostingHeadline || post.title || "",
        blogpostingDescription: post.seo?.blogpostingDescription || "",
        blogpostingAuthorName:
          post.seo?.blogpostingAuthorName || post.author?.name || "",
        blogpostingAuthorUrl:
          post.seo?.blogpostingAuthorUrl || post.author?.profileLink || "",
        blogpostingPublisherName:
          post.seo?.blogpostingPublisherName || "Tensorify",
        blogpostingPublisherLogo: post.seo?.blogpostingPublisherLogo || "",
        blogpostingDatePublished:
          post.seo?.blogpostingDatePublished ||
          post.createdAt?.toISOString() ||
          new Date().toISOString(),
        blogpostingDateModified:
          post.seo?.blogpostingDateModified ||
          post.updatedAt?.toISOString() ||
          new Date().toISOString(),
        blogpostingKeywords: post.seo?.blogpostingKeywords || "",
        blogpostingFeaturedImage: post.seo?.blogpostingFeaturedImage || "",
        mainEntityOfPage: post.seo?.mainEntityOfPage || "",
        favicon: post.seo?.favicon || "",
        language: post.seo?.language || "en",
      }));
    }
  }, [isSeoDialogOpen, post]);

  // File upload handling
  const handleFileUpload = async (field: keyof SeoData, file: File) => {
    try {
      toast.loading(`Uploading ${file.name}...`);
      const url = await uploadFile(file);

      setSeoData((prev) => ({
        ...prev,
        [field]: url,
      }));

      toast.success(`Uploaded successfully`);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  // Component for image upload fields
  const ImageUploadField = ({
    id,
    name,
    value,
    label,
    placeholder,
    onChange,
  }: {
    id: string;
    name: keyof SeoData;
    value: string;
    label: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadMode, setUploadMode] = useState<"url" | "file">("url");

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(name, file);
      }
    };

    return (
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            size="sm"
            variant={uploadMode === "url" ? "default" : "outline"}
            onClick={() => setUploadMode("url")}
            className="h-8"
          >
            <LinkIcon className="h-3.5 w-3.5 mr-1" />
            URL
          </Button>
          <Button
            type="button"
            size="sm"
            variant={uploadMode === "file" ? "default" : "outline"}
            onClick={() => setUploadMode("file")}
            className="h-8"
          >
            <File className="h-3.5 w-3.5 mr-1" />
            File
          </Button>
        </div>

        {uploadMode === "url" ? (
          <Input
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start h-10 px-3 text-muted-foreground font-normal"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {value ? "Change image file..." : "Choose image file..."}
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSeoData((prev) => ({
                    ...prev,
                    [name]: "",
                  }));
                }}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {value && (
          <div className="mt-2 rounded-md border border-border p-2 bg-muted/30">
            <div className="text-xs break-all">{value}</div>
            {(value.endsWith(".jpg") ||
              value.endsWith(".jpeg") ||
              value.endsWith(".png") ||
              value.endsWith(".gif") ||
              value.endsWith(".webp")) && (
              <div className="mt-2 relative h-32 w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={value}
                  alt={label}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    // Handle broken image
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Component for keyword fields with bubble UI
  const KeywordInput = ({
    id,
    name,
    value,
    onChange,
    placeholder,
  }: {
    id: string;
    name: keyof SeoData;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  }) => {
    const [localKeywords, setLocalKeywords] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize local keywords array from comma-separated string
    useEffect(() => {
      if (value) {
        setLocalKeywords(
          value
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        );
      } else {
        setLocalKeywords([]);
      }
    }, [value]);

    const updateSeoData = (keywords: string[]) => {
      // Create a synthetic event to pass to the onChange handler
      const syntheticEvent = {
        target: {
          name,
          value: keywords.join(", "),
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Check if the input ends with a comma
      if (newValue.endsWith(",")) {
        const keyword = newValue.slice(0, -1).trim();
        if (keyword) {
          const newKeywords = [...localKeywords, keyword];
          setLocalKeywords(newKeywords);
          updateSeoData(newKeywords);
          setInputValue("");
        }
      }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Process Enter key as a comma
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        const newKeywords = [...localKeywords, inputValue.trim()];
        setLocalKeywords(newKeywords);
        updateSeoData(newKeywords);
        setInputValue("");
      }

      // Delete the last keyword on backspace when input is empty
      if (e.key === "Backspace" && !inputValue && localKeywords.length > 0) {
        const newKeywords = localKeywords.slice(0, -1);
        setLocalKeywords(newKeywords);
        updateSeoData(newKeywords);
      }
    };

    const removeKeyword = (index: number) => {
      const newKeywords = localKeywords.filter((_, i) => i !== index);
      setLocalKeywords(newKeywords);
      updateSeoData(newKeywords);
    };

    const focusInput = () => {
      inputRef.current?.focus();
    };

    return (
      <div
        className="flex flex-wrap gap-2 p-2 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring"
        onClick={focusInput}
      >
        {localKeywords.map((keyword, index) => (
          <div
            key={`${keyword}-${index}`}
            className="flex items-center gap-1 bg-primary/20 text-primary-foreground px-2 py-1 rounded-md text-xs"
          >
            <span>{keyword}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeKeyword(index);
              }}
              className="hover:text-destructive focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          id={id}
          name={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={localKeywords.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] outline-none border-none bg-transparent focus:outline-none focus:ring-0 text-sm"
        />
      </div>
    );
  };

  // Add after other mutations
  const updatePublishStatusMutation = useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const result = await updateBlogPostPublishStatus(postId, "PUBLISHED");
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Update the cache with the new status
      queryClient.setQueryData(
        ["blogPost", slug],
        (oldData: BlogPostResponse | undefined) => {
          if (!oldData?.post) return oldData;
          return {
            ...oldData,
            post: {
              ...oldData.post,
              status: "PUBLISHED",
              updatedAt: new Date(),
            },
          };
        }
      );
      toast.success("Post published successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to publish post"
      );
    },
  });

  const handlePublishPost = () => {
    if (!post) return;
    updatePublishStatusMutation.mutate({ postId: post.id });
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
    <div className="p-6 h-screen flex flex-col">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link href="/blog-posts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog Posts
          </Link>
        </Button>

        {post && (
          <>
            <div className="ml-auto flex items-center gap-2">
              {post.status === "DRAFT" && (
                <Button
                  variant="default"
                  onClick={handlePublishPost}
                  disabled={updatePublishStatusMutation.isPending}
                >
                  {updatePublishStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>Publish</>
                  )}
                </Button>
              )}

              <Dialog open={isSeoDialogOpen} onOpenChange={setIsSeoDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    SEO Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle>SEO Settings</DialogTitle>
                    <DialogDescription>
                      Configure search engine optimization settings for this
                      blog post.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[calc(85vh-180px)] pr-4 -mr-4">
                    <form onSubmit={handleSeoSubmit} className="space-y-6 py-4">
                      <Accordion
                        type="multiple"
                        value={expandedSections}
                        onValueChange={handleAccordionChange}
                        className="space-y-4"
                      >
                        {/* Basic Metadata Section */}
                        <AccordionItem
                          value="basic-metadata"
                          className="border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="py-3">
                            <span className="text-sm font-medium">
                              Basic Metadata (SEO 101)
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pb-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="metaTitle"
                                className="text-sm font-medium"
                              >
                                Meta Title
                              </label>
                              <Input
                                id="metaTitle"
                                name="metaTitle"
                                value={seoData.metaTitle}
                                onChange={handleSeoChange}
                                placeholder="Enter meta title (50-60 characters)"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                {seoData.metaTitle.length}/60 characters
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="metaDescription"
                                className="text-sm font-medium"
                              >
                                Meta Description
                              </label>
                              <Textarea
                                id="metaDescription"
                                name="metaDescription"
                                value={seoData.metaDescription}
                                onChange={handleSeoChange}
                                placeholder="Enter meta description (150-160 characters)"
                                className="w-full"
                                rows={3}
                              />
                              <p className="text-xs text-muted-foreground">
                                {seoData.metaDescription.length}/160 characters
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="metaRobots"
                                className="text-sm font-medium"
                              >
                                Meta Robots
                              </label>
                              <Input
                                id="metaRobots"
                                name="metaRobots"
                                value={seoData.metaRobots}
                                onChange={handleSeoChange}
                                placeholder="e.g., index, follow"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Recommended: &ldquo;index, follow&rdquo; (use
                                &ldquo;noindex&rdquo; for private pages)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="keywords"
                                className="text-sm font-medium"
                              >
                                Keywords
                              </label>
                              <KeywordInput
                                id="keywords"
                                name="keywords"
                                value={seoData.keywords}
                                onChange={handleSeoChange}
                                placeholder="Type keywords and press comma or Enter"
                              />
                              <p className="text-xs text-muted-foreground">
                                Keywords for SEO meta tag
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="canonicalUrl"
                                className="text-sm font-medium"
                              >
                                Canonical URL
                              </label>
                              <Input
                                id="canonicalUrl"
                                name="canonicalUrl"
                                value={seoData.canonicalUrl}
                                onChange={handleSeoChange}
                                placeholder="Enter canonical URL (if different from current URL)"
                                className="w-full"
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Open Graph Section */}
                        <AccordionItem
                          value="open-graph"
                          className="border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="py-3">
                            <span className="text-sm font-medium">
                              Open Graph (Facebook/LinkedIn)
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pb-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="ogTitle"
                                className="text-sm font-medium"
                              >
                                OG Title
                              </label>
                              <Input
                                id="ogTitle"
                                name="ogTitle"
                                value={seoData.ogTitle}
                                onChange={handleSeoChange}
                                placeholder="Enter OG title"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="ogDescription"
                                className="text-sm font-medium"
                              >
                                OG Description
                              </label>
                              <Textarea
                                id="ogDescription"
                                name="ogDescription"
                                value={seoData.ogDescription}
                                onChange={handleSeoChange}
                                placeholder="Enter OG description"
                                className="w-full"
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="ogImage"
                                className="text-sm font-medium"
                              >
                                OG Image URL
                              </label>
                              <ImageUploadField
                                id="ogImage"
                                name="ogImage"
                                value={seoData.ogImage}
                                onChange={handleSeoChange}
                                label="OG Image"
                                placeholder="Enter OG image URL or upload (1200x630px ideal)"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="ogUrl"
                                className="text-sm font-medium"
                              >
                                OG URL
                              </label>
                              <Input
                                id="ogUrl"
                                name="ogUrl"
                                value={seoData.ogUrl}
                                onChange={handleSeoChange}
                                placeholder="Enter exact page URL"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="ogType"
                                className="text-sm font-medium"
                              >
                                OG Type
                              </label>
                              <Input
                                id="ogType"
                                name="ogType"
                                value={seoData.ogType}
                                onChange={handleSeoChange}
                                placeholder="e.g., article, website"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Use &ldquo;article&rdquo; for blog posts,
                                &ldquo;website&rdquo; for homepages
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="ogSiteName"
                                className="text-sm font-medium"
                              >
                                OG Site Name
                              </label>
                              <Input
                                id="ogSiteName"
                                name="ogSiteName"
                                value={seoData.ogSiteName}
                                onChange={handleSeoChange}
                                placeholder="Your site's brand name"
                                className="w-full"
                              />
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Twitter Card Section */}
                        <AccordionItem
                          value="twitter-card"
                          className="border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="py-3">
                            <span className="text-sm font-medium">
                              Twitter Card
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pb-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="twitterCardType"
                                className="text-sm font-medium"
                              >
                                Twitter Card Type
                              </label>
                              <Input
                                id="twitterCardType"
                                name="twitterCardType"
                                value={seoData.twitterCardType}
                                onChange={handleSeoChange}
                                placeholder="e.g., summary_large_image, summary"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                summary_large_image is recommended for better
                                engagement
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="twitterTitle"
                                className="text-sm font-medium"
                              >
                                Twitter Title
                              </label>
                              <Input
                                id="twitterTitle"
                                name="twitterTitle"
                                value={seoData.twitterTitle}
                                onChange={handleSeoChange}
                                placeholder="Enter Twitter title"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="twitterDescription"
                                className="text-sm font-medium"
                              >
                                Twitter Description
                              </label>
                              <Textarea
                                id="twitterDescription"
                                name="twitterDescription"
                                value={seoData.twitterDescription}
                                onChange={handleSeoChange}
                                placeholder="Enter Twitter description"
                                className="w-full"
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="twitterImage"
                                className="text-sm font-medium"
                              >
                                Twitter Image URL
                              </label>
                              <ImageUploadField
                                id="twitterImage"
                                name="twitterImage"
                                value={seoData.twitterImage}
                                onChange={handleSeoChange}
                                label="Twitter Image"
                                placeholder="Enter Twitter image URL or upload"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="twitterSite"
                                className="text-sm font-medium"
                              >
                                Twitter Site
                              </label>
                              <Input
                                id="twitterSite"
                                name="twitterSite"
                                value={seoData.twitterSite}
                                onChange={handleSeoChange}
                                placeholder="e.g., @tensorify"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Twitter handle with @ symbol
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Structured Data Section */}
                        <AccordionItem
                          value="structured-data"
                          className="border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="py-3">
                            <span className="text-sm font-medium">
                              Structured Data (Schema Markup)
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pb-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingHeadline"
                                className="text-sm font-medium"
                              >
                                BlogPosting Headline
                              </label>
                              <Input
                                id="blogpostingHeadline"
                                name="blogpostingHeadline"
                                value={seoData.blogpostingHeadline}
                                onChange={handleSeoChange}
                                placeholder="Main headline for schema markup"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingDescription"
                                className="text-sm font-medium"
                              >
                                BlogPosting Description
                              </label>
                              <Textarea
                                id="blogpostingDescription"
                                name="blogpostingDescription"
                                value={seoData.blogpostingDescription}
                                onChange={handleSeoChange}
                                placeholder="Description for schema markup"
                                className="w-full"
                                rows={2}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingAuthorName"
                                className="text-sm font-medium"
                              >
                                Author Name
                              </label>
                              <Input
                                id="blogpostingAuthorName"
                                name="blogpostingAuthorName"
                                value={seoData.blogpostingAuthorName}
                                onChange={handleSeoChange}
                                placeholder="Full author name"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingAuthorUrl"
                                className="text-sm font-medium"
                              >
                                Author URL
                              </label>
                              <Input
                                id="blogpostingAuthorUrl"
                                name="blogpostingAuthorUrl"
                                value={seoData.blogpostingAuthorUrl}
                                onChange={handleSeoChange}
                                placeholder="Link to author profile"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingPublisherName"
                                className="text-sm font-medium"
                              >
                                Publisher Name
                              </label>
                              <Input
                                id="blogpostingPublisherName"
                                name="blogpostingPublisherName"
                                value={seoData.blogpostingPublisherName}
                                onChange={handleSeoChange}
                                placeholder="Organization name"
                                className="w-full"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingPublisherLogo"
                                className="text-sm font-medium"
                              >
                                Publisher Logo URL
                              </label>
                              <ImageUploadField
                                id="blogpostingPublisherLogo"
                                name="blogpostingPublisherLogo"
                                value={seoData.blogpostingPublisherLogo}
                                onChange={handleSeoChange}
                                label="Publisher Logo"
                                placeholder="URL to organization logo or upload"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingDatePublished"
                                className="text-sm font-medium"
                              >
                                Date Published
                              </label>
                              <Input
                                id="blogpostingDatePublished"
                                name="blogpostingDatePublished"
                                value={seoData.blogpostingDatePublished}
                                className="w-full bg-muted/50 cursor-not-allowed"
                                disabled
                              />
                              <p className="text-xs text-muted-foreground">
                                Automatically set from post creation date
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingDateModified"
                                className="text-sm font-medium"
                              >
                                Date Modified
                              </label>
                              <Input
                                id="blogpostingDateModified"
                                name="blogpostingDateModified"
                                value={seoData.blogpostingDateModified}
                                className="w-full bg-muted/50 cursor-not-allowed"
                                disabled
                              />
                              <p className="text-xs text-muted-foreground">
                                Automatically updated when the post changes
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingKeywords"
                                className="text-sm font-medium"
                              >
                                BlogPosting Keywords
                              </label>
                              <KeywordInput
                                id="blogpostingKeywords"
                                name="blogpostingKeywords"
                                value={seoData.blogpostingKeywords}
                                onChange={handleSeoChange}
                                placeholder="Type keywords and press comma or Enter"
                              />
                              <p className="text-xs text-muted-foreground">
                                Keywords for Schema.org BlogPosting markup
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="blogpostingFeaturedImage"
                                className="text-sm font-medium"
                              >
                                Featured Image URL
                              </label>
                              <ImageUploadField
                                id="blogpostingFeaturedImage"
                                name="blogpostingFeaturedImage"
                                value={seoData.blogpostingFeaturedImage}
                                onChange={handleSeoChange}
                                label="Featured Image"
                                placeholder="URL to featured image or upload"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="mainEntityOfPage"
                                className="text-sm font-medium"
                              >
                                Main Entity of Page
                              </label>
                              <Input
                                id="mainEntityOfPage"
                                name="mainEntityOfPage"
                                value={seoData.mainEntityOfPage}
                                onChange={handleSeoChange}
                                placeholder="URL of the page"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Tells search engines what the page is about
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {/* Additional Settings Section */}
                        <AccordionItem
                          value="additional-settings"
                          className="border border-border rounded-lg px-4"
                        >
                          <AccordionTrigger className="py-3">
                            <span className="text-sm font-medium">
                              Additional Settings
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-4 pb-2">
                            <div className="space-y-2">
                              <label
                                htmlFor="favicon"
                                className="text-sm font-medium"
                              >
                                Favicon URL
                              </label>
                              <ImageUploadField
                                id="favicon"
                                name="favicon"
                                value={seoData.favicon}
                                onChange={handleSeoChange}
                                label="Favicon"
                                placeholder="URL to favicon image or upload"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="language"
                                className="text-sm font-medium"
                              >
                                Language
                              </label>
                              <Input
                                id="language"
                                name="language"
                                value={seoData.language}
                                onChange={handleSeoChange}
                                placeholder="e.g., en, es, fr"
                                className="w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                ISO language code (e.g., &lsquo;en&rsquo; for
                                English)
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </form>
                  </ScrollArea>
                  <DialogFooter className="mt-6 px-6 py-4 border-t">
                    <Button
                      type="submit"
                      onClick={handleSeoSubmit}
                      disabled={updateSeoMutation.isPending}
                    >
                      {updateSeoMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save SEO Settings"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : post ? (
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <article className="max-w-4xl mx-auto pb-12">
            <div className="space-y-6 mb-8">
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

                {/* Status indicator */}
                <div
                  className={`text-sm font-medium py-1 px-2 rounded-md w-fit ${
                    post.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}
                >
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
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
                                  "py-0 px-0 border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 !bg-muted/50 !rounded-0 font-mono w-full outline-none !shadow-none",
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
                  {!isInputVisible ? (
                    <button
                      onClick={() => {
                        setIsInputVisible(true);
                        // Set timeout to ensure it opens after render
                        setTimeout(() => {
                          setIsTagInputOpen(true);
                        }, 50);
                      }}
                      className="flex items-center gap-1 bg-secondary bg-opacity-20 hover:bg-primary hover:bg-opacity-30 px-3 py-1.5 rounded-md text-sm text-secondary-foreground hover:text-primary-foreground transition-colors duration-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Tag
                    </button>
                  ) : (
                    <div className="relative">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={newTag}
                          onChange={(e) => {
                            handleTagSearch(e.target.value);
                            // Make sure popover stays open
                            setIsTagInputOpen(true);
                          }}
                          placeholder="Search or create tag..."
                          className="h-8 min-w-[200px] text-sm bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                          autoFocus
                          onFocus={() => setIsTagInputOpen(true)}
                          onBlur={(e) => {
                            // Don't close if relatedTarget is within the popover
                            if (
                              !e.relatedTarget ||
                              !e.relatedTarget.closest(".tag-popover-content")
                            ) {
                              if (!newTag.trim()) {
                                setIsTagInputOpen(false);
                                setIsInputVisible(false);
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newTag.trim()) {
                              e.preventDefault();
                              handleAddTag(newTag);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              setIsTagInputOpen(false);
                              setIsInputVisible(false);
                              setNewTag("");
                            }
                          }}
                        />
                      </div>

                      {isTagInputOpen && (
                        <div className="absolute top-full left-0 mt-1 w-[200px] z-50 bg-background ring-2 ring-secondary border border-border  rounded-md shadow-md tag-popover-content">
                          <div className="max-h-[200px] overflow-auto">
                            {isSearching ? (
                              <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : tagSearchResults.length > 0 ? (
                              <div className="space-y-1">
                                {tagSearchResults.map((tag) => (
                                  <button
                                    key={tag.id}
                                    className="flex items-center w-full text-left px-2 py-1.5 text-sm hover:bg-muted dark:hover:bg-gray-800 rounded-sm"
                                    onClick={() => handleTagSelect(tag.tag)}
                                  >
                                    {tag.tag}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="py-1 px-2">
                                {newTag.trim() ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTagSelect(newTag.trim())
                                    }
                                    className="flex items-center gap-2 text-sm w-full px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-sm"
                                  >
                                    <Plus className="h-4 w-4" />
                                    <span>Create tag</span>
                                  </button>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Type to search tags
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Add a wrapper with negative margin to align editor text */}
            <div className="-ml-12">
              <Editor />
            </div>
          </article>
        </ScrollArea>
      ) : null}
    </div>
  );
}
