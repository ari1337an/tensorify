"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/server/database/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import type { User } from "@clerk/clerk-sdk-node";

const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 63; // Standard subdomain length limit

const updateOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, `URL must be at least ${SLUG_MIN_LENGTH} characters`)
    .max(SLUG_MAX_LENGTH, `URL cannot exceed ${SLUG_MAX_LENGTH} characters`)
    .regex(
      /^[a-z0-9-]+$/,
      "URL can only contain lowercase letters, numbers, and hyphens"
    ),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export async function updateOrganization(data: UpdateOrganizationInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Validate input
    const validatedData = updateOrganizationSchema.parse(data);

    // Check if slug is already taken
    const existingOrg = await db.organization.findFirst({
      where: {
        slug: validatedData.slug,
        NOT: {
          superAdminId: userId,
        },
      },
    });

    if (existingOrg) {
      throw new Error("This URL is already taken");
    }

    // Update organization
    const updatedOrg = await db.organization.update({
      where: {
        superAdminId: userId,
      },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    // Revalidate paths
    revalidatePath("/settings/organization");
    revalidatePath(`/${updatedOrg.slug}`);

    return { success: true, data: updatedOrg };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Something went wrong" };
  }
}

export type OrganizationMember = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
};

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMember[]> {
  try {
    const members = await db.user.findMany({
      where: {
        organizationId,
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Get Clerk user data for avatars
    const clerkUsersResponse = await clerkClient.users.getUserList({
      userId: members.map((member) => member.userId),
    });

    return members.map((member) => {
      // Find corresponding Clerk user
      const clerkUser = clerkUsersResponse.data.find(
        (user: User) => user.id === member.userId
      );

      // Get the highest priority role
      const highestRole = member.roles.reduce((highest, current) => {
        const getRolePriority = (role: string) => {
          switch (role.toLowerCase()) {
            case "super admin":
              return 4;
            case "admin":
              return 3;
            case "member":
              return 2;
            case "viewer":
              return 1;
            default:
              return 0;
          }
        };

        const currentPriority = getRolePriority(current.role.name);
        const highestPriority = getRolePriority(highest?.role.name || "");

        return currentPriority > highestPriority ? current : highest;
      }, member.roles[0]);

      return {
        id: member.userId,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        imageUrl: clerkUser?.imageUrl || "",
        role: highestRole?.role.name || "member",
      };
    });
  } catch (error) {
    console.error("Error fetching organization members:", error);
    throw new Error("Failed to fetch organization members");
  }
}
