"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/app/_components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { toast } from "sonner";
import {
  createBlogPost,
  CreateBlogPostInput,
} from "@/server/actions/blog-posts";
import { BlogPostType, BlogPostStatus } from "@prisma/client";

// Form schema for creating a new blog post
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.nativeEnum(BlogPostType).default(BlogPostType.ARTICLE),
  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),
  tags: z.array(z.string()).default([]),
});

export function CreateBlogPostDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<CreateBlogPostInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: BlogPostType.ARTICLE,
      status: BlogPostStatus.DRAFT,
      tags: [],
    },
  });

  // Watch the title field to enable/disable the generate button
  const titleValue = form.watch("title");

  // Handle form submission
  const onSubmit = async (data: CreateBlogPostInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await createBlogPost(data);

      if (result.error) {
        setError(result.error);
        return;
      }

      toast.success("Blog post created successfully");
      setOpen(false);

      // Redirect to the new blog post
      router.push(`/blog-posts/${data.slug}`);
    } catch (error) {
      setError("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Blog Post</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new blog post. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input placeholder="blog-post-slug" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateSlug}
                      disabled={!titleValue}
                    >
                      Generate
                    </Button>
                  </div>
                  <FormDescription>
                    This will be used in the URL: /blog-posts/
                    {form.watch("slug")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a blog post type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(BlogPostType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                  form.reset();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
