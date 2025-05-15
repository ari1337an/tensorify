import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

export default function useRBACLogic() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  const createRole = async (values: RoleFormValues) => {
    setIsLoading(true);
    try {
      // Here you would normally make a fetch request to your API
      // For now, we'll just simulate it
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create role");
      }

      const newRole = await response.json();
      setRoles((prev) => [...prev, newRole]);
      toast.success("Role created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create role");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    roles,
    createRole,
    roleSchema,
  };
}
