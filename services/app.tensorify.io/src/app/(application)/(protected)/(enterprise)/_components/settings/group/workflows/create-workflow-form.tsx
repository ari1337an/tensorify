"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { DialogDescription, DialogFooter } from "@/app/_components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { postWorkflow } from "@/app/api/v1/_client/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  projectId: z.string().min(1, "Project is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateWorkflowFormProps {
  onClose: () => void;
  onWorkflowCreated: () => void;
  projects: Array<{ id: string; name: string }>;
}

export function CreateWorkflowForm({
  onClose,
  onWorkflowCreated,
  projects,
}: CreateWorkflowFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      projectId: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      const response = await postWorkflow({
        body: {
          name: values.name,
          description: values.description,
          projectId: values.projectId,
        },
      });

      if (response.status === 201) {
        toast.success(response.body.message || "Workflow created successfully");
        form.reset();
        onWorkflowCreated();
        onClose();
      } else if (response.status === 400) {
        toast.error(`Error: ${response.body.message}`);
      } else {
        toast.error(response.body.message || "Failed to create workflow");
      }
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogDescription>
        Add a new workflow to your organization. Workflows help you organize and
        manage your work processes within projects.
      </DialogDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workflow Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter workflow name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter workflow description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Workflow...
                </>
              ) : (
                "Create Workflow"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

export default CreateWorkflowForm;
