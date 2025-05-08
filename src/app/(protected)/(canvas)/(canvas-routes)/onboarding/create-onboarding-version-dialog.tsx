"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { createOnboardingTagVersion } from "@/server/actions/onboarding";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  tag: z
    .string()
    .min(3, {
      message: "Tag must be at least 3 characters.",
    })
    .max(50, {
      message: "Tag must not be longer than 50 characters.",
    })
    .regex(/^[a-z0-9-_]+$/, {
      message:
        "Tag can only contain lowercase letters, numbers, hyphens, and underscores.",
    }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to convert a string to a valid slug
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export function CreateOnboardingVersionDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidTag, setIsValidTag] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      tag: "",
      description: "",
    },
  });

  // Watch the title field to auto-generate the tag
  const title = form.watch("title");
  const tag = form.watch("tag");

  // Handle title changes to auto-generate the tag
  useEffect(() => {
    if (title && !tag) {
      const generatedTag = slugify(title);
      form.setValue("tag", generatedTag, { shouldValidate: true });
    }
  }, [title, tag, form]);

  // Validate tag on change
  useEffect(() => {
    if (tag) {
      try {
        formSchema.shape.tag.parse(tag);
        setIsValidTag(true);
      } catch (error) {
        setIsValidTag(false);
      }
    } else {
      setIsValidTag(false);
    }
  }, [tag]);

  // Handle manual tag changes to ensure they remain valid slugs
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sluggedValue = slugify(value);
    form.setValue("tag", sluggedValue, { shouldValidate: true });
  };

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      const result = await createOnboardingTagVersion({
        title: values.title,
        tag: values.tag,
        description: values.description || undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Onboarding version created successfully");
      queryClient.invalidateQueries({ queryKey: ["onboardingTagVersions"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create onboarding version");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Version
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Create New Onboarding Version</DialogTitle>
          <DialogDescription>
            Create a new versioned onboarding flow with custom questions and
            analytics.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g. Developer Onboarding Q2 2023"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The title of this onboarding version.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="E.g. dev-onboarding-q2-2023"
                        {...field}
                        onChange={(e) => {
                          handleTagChange(e);
                        }}
                        className="pr-10"
                      />
                    </FormControl>
                    <div className="absolute right-3 top-2.5">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              {tag &&
                                (isValidTag ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-amber-500" />
                                ))}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isValidTag
                              ? "Valid tag format"
                              : "Tag must contain only lowercase letters, numbers, hyphens and underscores"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <FormDescription>
                    A unique identifier for this version. Will be automatically
                    generated from the title.
                    <br />
                    <span className="text-xs text-muted-foreground italic">
                      Valid format: lowercase letters, numbers, hyphens, and
                      underscores only.
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of this onboarding version..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this onboarding version.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
