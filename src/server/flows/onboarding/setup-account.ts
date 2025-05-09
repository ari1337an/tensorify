"use server";

import db from "@/server/database/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Setup new user account with organizational structure
 *
 * Creates a complete account setup in a single transaction:
 * 1. Creates/Updates the user with Clerk auth details
 * 2. Creates an organization with the user as super admin
 * 3. Creates a team inside the organization with the user as admin
 * 4. Creates a project in the team with the user as admin
 * 5. Creates a default workflow in the project with the user as admin
 *
 * Each entity (organization, team, project, workflow) gets its own resource
 * for role-based access control and the user is added as a member to each.
 */
export const setupInitialTensorifyAccountWithDefaults = async (
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  orgUrl: string
): Promise<
  | { success: true; message: string }
  | { success: false; error: string; stack?: string }
> => {
  const missingFields: string[] = [];

  if (!userId) missingFields.push("userId");
  if (!email) missingFields.push("email");
  if (!firstName) missingFields.push("firstName");
  if (!lastName) missingFields.push("lastName");
  if (!orgUrl) missingFields.push("orgUrl");

  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing required field${
        missingFields.length > 1 ? "s" : ""
      }: ${missingFields.join(", ")}`,
    };
  }

  // Extract the slug from the orgUrl
  // Format: "example.app.tensorify.io" -> "example"
  const slug = orgUrl.split(".app.tensorify.io")[0];

  if (!slug) {
    return {
      success: false,
      error: "Invalid organization URL format",
    };
  }

  try {
    await db.$transaction(
      async (tx) => {
        const user = await tx.user.upsert({
          where: { userId },
          update: { email, firstName, lastName },
          create: { userId, email, firstName, lastName },
        });

        const organizationResource = await tx.resource.create({ data: {} });

        const organization = await tx.organization.create({
          data: {
            id: organizationResource.id,
            slug,
            name: `${firstName}'s Organization`,
            superAdminId: user.userId,
          },
        });

        await tx.user.update({
          where: { userId: user.userId },
          data: { organizationId: organization.id },
        });

        const teamResource = await tx.resource.create({ data: {} });

        const team = await tx.team.create({
          data: {
            id: teamResource.id,
            name: `${firstName}'s Team`,
            adminId: user.userId,
            organizationId: organization.id,
          },
        });

        await tx.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.userId,
          },
        });

        const projectResource = await tx.resource.create({ data: {} });

        const project = await tx.project.create({
          data: {
            id: projectResource.id,
            name: `${firstName}'s Project`,
            adminId: user.userId,
            organizationId: organization.id,
            teamId: team.id,
          },
        });

        await tx.projectMember.create({
          data: {
            projectId: project.id,
            userId: user.userId,
          },
        });

        const workflowResource = await tx.resource.create({ data: {} });

        const workflow = await tx.workflow.create({
          data: {
            id: workflowResource.id,
            name: `${firstName}'s Workflow`,
            code: {},
            adminId: user.userId,
            organizationId: organization.id,
            teamId: team.id,
            projectId: project.id,
          },
        });

        await tx.workflowMember.create({
          data: {
            workflowId: workflow.id,
            userId: user.userId,
          },
        });

        revalidatePath("/");
      },
      {
        timeout: 15000, // 15 seconds timeout
        maxWait: 10000, // Maximum wait time for transaction to start
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return {
      success: true,
      message: "Account setup completed successfully.",
    };
  } catch (err: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ setupInitialTensorifyAccountWithDefaults failed:", err);
    }

    return {
      success: false,
      error: "Internal server error during account setup.",
      stack:
        process.env.NODE_ENV === "development" && err instanceof Error
          ? err.stack
          : undefined,
    };
  }
};
