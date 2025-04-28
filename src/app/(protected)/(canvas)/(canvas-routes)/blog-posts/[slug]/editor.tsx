"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { Block as BlockNoteBlock } from "@blocknote/core";
import { codeBlock } from "@blocknote/code-block";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBlogPostBySlug,
  updateBlogPostContent,
} from "@/server/actions/blog-posts";
import { useTheme } from "next-themes";
import "./editor-style.css";
import uploadFile from "./upload-file";

// Use BlockNote's Block type or our fallback if needed
type Block = BlockNoteBlock;

// ContentSaving context shared with parent component
const contentSavingState = { isSaving: false };

// Define the window interface extension
declare global {
  interface Window {
    editorContentSavingState?: typeof contentSavingState;
  }
}

// Our <Editor> component we can reuse later
export default function Editor() {
  const { theme } = useTheme();
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();

  // Store content state
  const [blocks, setBlocks] = useState<Block[]>([]);

  // For debounce timer
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>("");

  // Get post data
  interface BlogPostResponse {
    post?: {
      id: string;
      content?: {
        blocks?: Block[];
      };
      updatedAt: Date;
    };
    error?: string;
  }

  const { data } = useQuery<BlogPostResponse>({
    queryKey: ["blogPost", slug],
    queryFn: async () => {
      const response = await getBlogPostBySlug(slug);
      if (response.error) {
        throw new Error(response.error);
      }
      return response as BlogPostResponse;
    },
    enabled: !!slug,
  });

  const post = data?.post;

  // Set up the editor with initial content
  const editor = useCreateBlockNote({
    codeBlock,
    uploadFile: uploadFile,
    initialContent: post?.content?.blocks || [
      {
        type: "paragraph",
        content: "Write your blog post content here...",
      },
    ],
  });

  // Mutation for saving content
  const updateContentMutation = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: { blocks: Block[] };
    }) => {
      const result = await updateBlogPostContent(postId, content);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      // Update the cache
      queryClient.setQueryData(
        ["blogPost", slug],
        (oldData: BlogPostResponse | undefined) => {
          if (!oldData?.post) return oldData;
          return {
            ...oldData,
            post: {
              ...oldData.post,
              content: { blocks },
              updatedAt: new Date(),
            },
          };
        }
      );
      contentSavingState.isSaving = false;
      lastSavedContentRef.current = JSON.stringify(blocks);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save content"
      );
      contentSavingState.isSaving = false;
    },
  });

  // Debounced save handler
  const debouncedSave = (newBlocks: Block[]) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Skip saving if content hasn't changed
    const newContent = JSON.stringify(newBlocks);
    if (newContent === lastSavedContentRef.current) {
      return;
    }

    contentSavingState.isSaving = true;

    // Set a new timeout for 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      if (!post?.id) return;

      updateContentMutation.mutate({
        postId: post.id,
        content: { blocks: newBlocks },
      });
    }, 2000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Reset saving state when component unmounts
      contentSavingState.isSaving = false;
    };
  }, []);

  // Initialize blocks from post data if available
  useEffect(() => {
    if (post?.content?.blocks) {
      setBlocks(post.content.blocks);
      lastSavedContentRef.current = JSON.stringify(post.content.blocks);
    }
  }, [post]);

  // Export the saving state via window object for parent component to use
  useEffect(() => {
    window.editorContentSavingState = contentSavingState;

    return () => {
      delete window.editorContentSavingState;
    };
  }, []);

  // Renders the editor instance using a React component.
  return (
    <BlockNoteView
      className="mb-6"
      editor={editor}
      theme={theme === "dark" ? "dark" : "light"}
      onChange={() => {
        // Get the current document
        const newBlocks = editor.document as Block[];
        // Update local state
        setBlocks(newBlocks);
        // Trigger debounced save
        debouncedSave(newBlocks);
      }}
    />
  );
}
