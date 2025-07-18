"use client";

import * as React from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "sonner";
import { useProjects } from "@/app/_providers/project-provider";
import { useWorkflows } from "@/app/_providers/workflow-provider";
import useStore from "@/app/_store/store";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  projectId: z.string().min(1, "Project is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkflowDialogProps {
  projectId: string;
  projectName: string;
}

export function WorkflowDialog({
  projectId,
  projectName,
}: WorkflowDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { refetch, addWorkflowOptimistically } = useProjects();
  const {
    addWorkflowOptimistically: addWorkflowOptimisticallyToWorkflows,
    refetch: refetchWorkflows,
  } = useWorkflows();
  const currentTeam = useStore((state) => state.currentTeam);
  const currentOrg = useStore((state) => state.currentOrg);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      projectId: projectId,
    },
  });

  // Update projectId when prop changes
  React.useEffect(() => {
    form.setValue("projectId", projectId);
  }, [projectId, form]);

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
        const workflowName = values.name;

        // Optimistically add the workflow to ProjectProvider
        addWorkflowOptimistically(projectId, workflowName);

        // Optimistically add the workflow to WorkflowProvider with temporary data
        if (currentTeam && currentOrg) {
          addWorkflowOptimisticallyToWorkflows({
            name: workflowName,
            description: values.description,
            projectId: projectId,
            projectName: projectName,
            teamId: currentTeam.id,
            teamName: currentTeam.name,
            organizationId: currentOrg.id,
            memberCount: currentTeam.memberCount,
            createdAt: new Date().toISOString(),
            version: null, // No version yet
            allVersions: [], // Empty versions array
          });
        }

        toast.success(response.body.message || "Workflow created successfully");
        form.reset({
          name: "",
          description: "",
          projectId: projectId,
        });
        setIsOpen(false);

        // Refresh in background to ensure data consistency
        setTimeout(async () => {
          await Promise.all([refetch(), refetchWorkflows()]);
        }, 1000);
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="hover:cursor-pointer w-full flex items-center rounded-md px-3 py-2 text-sm transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent">
          <div className="w-5 flex items-center justify-center flex-shrink-0">
            <Plus className="h-3 w-3" />
          </div>
          <span className="truncate ml-2">Create workflow</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a workflow</DialogTitle>
          <DialogDescription>
            Add a new workflow to &quot;{projectName}&quot;. Workflows help you
            organize and manage your work processes within projects.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
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
      </DialogContent>
    </Dialog>
  );
}
