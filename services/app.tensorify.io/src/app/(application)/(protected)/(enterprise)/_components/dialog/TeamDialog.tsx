"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { postTeam } from "@/app/api/v1/_client/client";
import { toast } from "sonner";
import useStore from "@/app/_store/store";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";

const teamFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Team name must be at least 2 characters." })
    .max(100, { message: "Team name must be less than 100 characters." }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters." })
    .optional(),
});

interface TeamDialogProps {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  onTeamCreated?: () => void; // Callback to refresh team list
}

export function TeamDialog({
  children,
  onOpenChange,
  open = false,
  onTeamCreated,
}: TeamDialogProps) {
  const form = useForm<z.infer<typeof teamFormSchema>>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const currentOrg = useStore((state) => state.currentOrg);

  const onSubmit = async (values: z.infer<typeof teamFormSchema>) => {
    if (!currentOrg) {
      toast.error("Organization not found. Please select an organization.");
      return;
    }

    try {
      const response = await postTeam({
        body: {
          name: values.name,
          description: values.description,
          orgId: currentOrg.id,
        },
      });

      if (response.status === 201) {
        toast.success(response.body.message);
        if (onTeamCreated) {
          onTeamCreated(); // Call the callback to refresh the team list
        }
        if (onOpenChange) {
          onOpenChange(false); // Close the dialog on success
        }
        form.reset(); // Reset form fields
      } else if (response.status === 400) {
        toast.error(`Error: ${response.body.message}`);
      } else {
        toast.error(response.body.message);
      }
    } catch (error) {
      console.error("Team creation failed:", error);
      toast.error("Failed to create team. Please try again.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    // Reset form when dialog closes
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          if (onOpenChange) onOpenChange(true);
        }}
      >
        {children}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Enter the details for your new team. You can add members later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Team" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of your team's purpose."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
