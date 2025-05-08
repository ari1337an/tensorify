"use client";

import { useState, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, X, Info, Trash } from "lucide-react";
import { toast } from "sonner";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/app/_components/ui/radio-group";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { addOnboardingQuestion } from "@/server/actions/onboarding";
import { Checkbox } from "@/app/_components/ui/checkbox";

// Schema for form validation
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  slug: z
    .string()
    .min(3, {
      message: "Slug must be at least 3 characters.",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  type: z.enum(["single_choice", "multi_choice"], {
    required_error: "Please select a question type.",
  }),
  allowOtherOption: z.boolean().default(false),
  iconSlug: z.string().optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1, "Value is required"),
        label: z.string().min(1, "Label is required"),
        iconSlug: z.string().optional(),
      })
    )
    .min(2, {
      message: "At least 2 options are required",
    }),
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

interface AddQuestionDialogProps {
  children?: ReactNode;
  versionId: string | undefined;
  onQuestionAdded?: () => void;
}

export function AddQuestionDialog({
  children,
  versionId,
  onQuestionAdded,
}: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: "single_choice",
      allowOtherOption: false,
      iconSlug: "",
      options: [
        { value: "", label: "", iconSlug: "" },
        { value: "", label: "", iconSlug: "" },
      ],
    },
  });

  // Watch title for auto-generating slug
  const title = form.watch("title");
  const slug = form.watch("slug");

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !slug) {
      const newSlug = slugify(value);
      form.setValue("slug", newSlug, { shouldValidate: true });
    }
  };

  // Add a new option to the form
  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [
      ...currentOptions,
      { value: "", label: "", iconSlug: "" },
    ]);
  };

  // Remove an option from the form
  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    if (currentOptions.length <= 2) {
      toast.error("At least 2 options are required");
      return;
    }
    const updatedOptions = currentOptions.filter((_, i) => i !== index);
    form.setValue("options", updatedOptions, { shouldValidate: true });
  };

  // Handle option value change and auto-generate the value from label if not set
  const handleOptionLabelChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const label = e.target.value;
    const currentOptions = form.getValues("options");

    // If no value set yet, auto-generate it from the label
    if (!currentOptions[index].value) {
      const value = slugify(label);
      const updatedOptions = [...currentOptions];
      updatedOptions[index] = {
        ...updatedOptions[index],
        label,
        value,
      };
      form.setValue("options", updatedOptions, { shouldValidate: true });
    } else {
      // Otherwise just update the label
      const updatedOptions = [...currentOptions];
      updatedOptions[index] = {
        ...updatedOptions[index],
        label,
      };
      form.setValue("options", updatedOptions, { shouldValidate: true });
    }
  };

  async function onSubmit(values: FormValues) {
    if (!versionId) {
      toast.error("No version ID provided");
      return;
    }

    try {
      setIsSubmitting(true);

      // Process options to ensure both value and label exist
      const processedOptions = values.options.map((option) => ({
        ...option,
        value: option.value || slugify(option.label),
        iconSlug: option.iconSlug || undefined,
      }));

      // Get the highest sortOrder from existing questions
      const response = await fetch(
        `/api/onboarding/versions?tag=${encodeURIComponent(versionId)}`
      );
      const versionData = await response.json();

      const result = await addOnboardingQuestion({
        versionId,
        title: values.title,
        slug: values.slug,
        type: values.type as any, // TypeScript conversion
        iconSlug: values.iconSlug || undefined,
        options: processedOptions,
        allowOtherOption: values.allowOtherOption,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Question added successfully");
      setOpen(false);
      form.reset();
      onQuestionAdded?.();
    } catch (error) {
      toast.error("Failed to add question");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for this onboarding version.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(80vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Question Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., What frameworks do you use?"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      The title of the question displayed to users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Question Slug
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              A unique identifier for this question within the
                              version.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., what-frameworks-do-you-use"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only apply slugify to value if it contains invalid characters
                          // This allows users to type hyphens directly
                          if (/^[a-z0-9-]*$/.test(value)) {
                            field.onChange(value);
                          } else {
                            const slugified = slugify(value);
                            form.setValue("slug", slugified, {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-generated from title. Used in analytics.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single_choice">
                          Single Choice
                        </SelectItem>
                        <SelectItem value="multi_choice">
                          Multiple Choice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Single choice allows one selection, multiple choice allows
                      many.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Allow Other Option */}
              <FormField
                control={form.control}
                name="allowOtherOption"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow custom "Other" input</FormLabel>
                      <FormDescription>
                        Adds an "Other" option with a text field for users to
                        enter custom responses.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Icon Slug (Optional) */}
              <FormField
                control={form.control}
                name="iconSlug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      Icon Slug (Optional)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              The slug for a Lucide icon (e.g., "check", "code")
                              that will be displayed with the question.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., code-2" {...field} />
                    </FormControl>
                    <FormDescription>
                      Lucide icon slug to display with the question.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-base">Options</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.watch("options").map((option, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="grid gap-2 flex-1">
                        <FormField
                          control={form.control}
                          name={`options.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Option label"
                                  {...field}
                                  onChange={(e) => {
                                    handleOptionLabelChange(index, e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name={`options.${index}.value`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Option value"
                                    {...field}
                                    className="text-xs font-mono"
                                    disabled
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`options.${index}.iconSlug`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    placeholder="Icon slug (optional)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-1"
                        onClick={() => removeOption(index)}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>

                <FormDescription>
                  Add at least 2 options for the question. Each option needs a
                  label that will be displayed to users.
                </FormDescription>
                {form.formState.errors.options?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.options.message}
                  </p>
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
