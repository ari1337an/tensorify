"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/server/database/db";
import { auth } from "@clerk/nextjs/server";

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
