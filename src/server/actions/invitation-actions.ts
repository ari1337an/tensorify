"use server";

import db from "@/server/database/db";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { sendInviteEmailAction } from "./email-actions";
// import { setupInvitedUserAccount } from "@/server/flows/onboarding/setup-invited-account"; // Removed unused import

const CreateInvitationSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  organizationId: z.string().cuid({ message: "Invalid organization ID." }),
  roleIds: z
    .array(z.string().cuid())
    .min(1, { message: "At least one role must be selected." }),
  expiresInDays: z.number().int().positive().optional(),
});

export async function createInvitation(
  values: z.infer<typeof CreateInvitationSchema>
): Promise<
  | { success: true; message: string; invitationId?: string }
  | { success: false; error: string }
> {
  try {
    // The user performing the invite action
    const authResult = await auth();
    const inviterId = authResult.userId;

    if (!inviterId) {
      return { success: false, error: "User not authenticated." };
    }

    const validatedFields = CreateInvitationSchema.safeParse(values);
    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      };
    }

    const { email, organizationId, roleIds, expiresInDays } =
      validatedFields.data; // Now const

    const actualExpiresInDays = expiresInDays === undefined ? 7 : expiresInDays;

    const organization = await db.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      return { success: false, error: "Organization not found." };
    }

    const inviterMembership = await db.user.findFirst({
      where: {
        userId: inviterId,
        organizationId: organizationId,
      },
    });
    const isSuperAdmin = organization.superAdminId === inviterId;

    if (!inviterMembership && !isSuperAdmin) {
      return {
        success: false,
        error:
          "Inviter is not authorized to invite members to this organization.",
      };
    }

    const existingMember = await db.user.findFirst({
      where: {
        email, // This is the invitee's email
        organizationId,
      },
    });
    if (existingMember) {
      return {
        success: false,
        error: "User with this email is already a member of the organization.",
      };
    }

    const existingPendingInvitation = await db.invitation.findFirst({
      where: {
        email, // Invitee's email
        organizationId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPendingInvitation) {
      return {
        success: false,
        error:
          "An active invitation already exists for this email in this organization.",
      };
    }

    const roles = await db.role.findMany({
      where: {
        id: { in: roleIds },
      },
    });
    if (roles.length !== roleIds.length) {
      const foundRoleIds = roles.map((r) => r.id);
      const notFoundRoles = roleIds.filter((id) => !foundRoleIds.includes(id));
      return {
        success: false,
        error: `Invalid role IDs provided: ${notFoundRoles.join(", ")}`,
      };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + actualExpiresInDays);

    // Wrap DB operations and email sending in a transaction
    // This is a conceptual change. Prisma transactions with external calls like email sending
    // need careful handling. For now, we'll check email result and act accordingly.
    // A true rollback would require sendInviteEmailAction to be part of the transaction or
    // a more complex state management for the invitation.

    const invitation = await db.invitation.create({
      data: {
        email, // Invitee's email
        organizationId,
        roleIds: roleIds as Prisma.JsonArray,
        invitedById: inviterId, // ID of the user sending the invite
        expiresAt,
        status: "PENDING",
      },
    });

    // Get inviter information
    const inviter = await db.user.findFirst({
      where: { userId: inviterId }, // Assuming inviterId is unique across User table or scoped by org if User table is multi-tenant without unique userId
    });

    const inviterInfo = inviter
      ? {
          name: `${inviter.firstName} ${inviter.lastName}`,
          email: inviter.email,
        }
      : undefined;

    // Send invitation email and check result
    const emailResult = await sendInviteEmailAction(
      email,
      invitation.id,
      inviterInfo,
      organization
    );

    if (!emailResult.success) {
      // Optional: Attempt to delete the invitation or mark it as failed if email sending fails
      // For simplicity now, we just return the error.
      // await db.invitation.delete({ where: { id: invitation.id } });
      return {
        success: false,
        error: `Invitation created (ID: ${invitation.id}) but failed to send email: ${emailResult.error}`,
      };
    }

    return {
      success: true,
      message: "Invitation sent successfully.",
      invitationId: invitation.id,
    };
  } catch (error) {
    console.error("Error creating invitation:", error);
    return {
      success: false,
      error: "Failed to create invitation. Please try again.",
    };
  }
}

export async function getPendingInvitationForUserByEmail(
  email: string
): Promise<
  | {
      success: true;
      invitation: Prisma.InvitationGetPayload<{
        include: { organization: true };
      }> | null;
    }
  | { success: false; error: string }
> {
  if (!email) {
    return { success: false, error: "Email is required." };
  }
  try {
    const invitation = await db.invitation.findFirst({
      where: {
        email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, invitation };
  } catch (error) {
    console.error("Error fetching pending invitation:", error);
    return { success: false, error: "Failed to fetch invitation details." };
  }
}

export async function acceptInvitation(
  invitationId: string
): Promise<
  | { success: true; message: string; organizationSlug: string }
  | { success: false; error: string }
> {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    // Accessing claims after ensuring userId exists
    const userEmail = authResult.sessionClaims?.email as string | undefined;
    const userFirstName = authResult.sessionClaims?.firstName as
      | string
      | undefined;
    const userLastName = authResult.sessionClaims?.lastName as
      | string
      | undefined;
    const userImageUrl = authResult.sessionClaims?.imageUrl as
      | string
      | null
      | undefined;

    if (!userId || !userEmail) {
      // Only email is required, firstName, lastName and imageUrl are optional
      return {
        success: false,
        error: "User not authenticated or email missing from token.",
      };
    }

    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        email: userEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found, is invalid, or has expired.",
      };
    }

    const result = await db.$transaction(async (tx) => {
      // Create user data with optional fields
      const userData = {
        email: userEmail,
        // Only include firstName, lastName if they exist
        ...(userFirstName && { firstName: userFirstName }),
        ...(userLastName && { lastName: userLastName }),
        imageUrl: userImageUrl === undefined ? null : userImageUrl,
        organizationId: invitation.organizationId,
      };

      const user = await tx.user.upsert({
        where: { userId },
        update: userData,
        create: {
          userId,
          // Default values for required fields if not provided
          firstName: userFirstName || "User",
          lastName: userLastName || userEmail.split("@")[0], // Use part of email as last name if not provided
          ...userData,
        },
      });

      const roleIds = invitation.roleIds as string[];
      if (roleIds && roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({
            userId: user.userId,
            roleId: roleId,
            resourceId: invitation.organizationId,
          })),
        });
      }

      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      });

      return { user, organizationSlug: invitation.organization.slug };
    });

    return {
      success: true,
      message:
        "Invitation accepted successfully! You are now part of the organization.",
      organizationSlug: result.organizationSlug,
    };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
    }
    return {
      success: false,
      error: "Failed to accept invitation. Please try again.",
    };
  }
}

export async function declineInvitation(
  invitationId: string
): Promise<
  { success: true; message: string } | { success: false; error: string }
> {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    const userEmail = authResult.sessionClaims?.email as string | undefined;

    if (!userId || !userEmail) {
      return {
        success: false,
        error: "User not authenticated or email missing from token.",
      };
    }

    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        email: userEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Invitation not found, is invalid, or has expired.",
      };
    }

    await db.invitation.update({
      where: { id: invitationId },
      data: {
        status: "DECLINED",
        // Optional: Log who revoked and when, if you add fields to your model
        // revokedById: currentUserId,
        // revokedAt: new Date(),
      },
    });

    return { success: true, message: "Invitation declined." };
  } catch (error) {
    console.error("Error declining invitation:", error);
    return {
      success: false,
      error: "Failed to decline invitation. Please try again.",
    };
  }
}

export async function canInviteUser(
  email: string,
  organizationId: string
): Promise<{ canInvite: boolean; reason?: string }> {
  try {
    const existingMember = await db.user.findFirst({
      where: {
        email,
        organizationId,
      },
    });
    if (existingMember) {
      return {
        canInvite: false,
        reason: "User with this email is already a member of the organization.",
      };
    }

    const existingPendingInvitation = await db.invitation.findFirst({
      where: {
        email,
        organizationId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPendingInvitation) {
      return {
        canInvite: false,
        reason:
          "An active invitation already exists for this email in this organization.",
      };
    }

    return { canInvite: true };
  } catch (error) {
    console.error("Error checking if user can be invited:", error);
    return { canInvite: false, reason: "Error checking invitation status." };
  }
}

const UpdateInvitationRolesSchema = z.object({
  invitationId: z.string().cuid({ message: "Invalid invitation ID." }),
  organizationId: z.string().cuid({ message: "Invalid organization ID." }),
  newRoleIds: z
    .array(z.string().cuid())
    .min(1, { message: "At least one role must be selected." }),
});

export async function updateInvitationRoles(
  values: z.infer<typeof UpdateInvitationRolesSchema>
): Promise<
  { success: true; message: string } | { success: false; error: string }
> {
  try {
    const authResult = await auth();
    const currentUserId = authResult.userId;

    if (!currentUserId) {
      return { success: false, error: "User not authenticated." };
    }

    const validatedFields = UpdateInvitationRolesSchema.safeParse(values);
    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      };
    }

    const { invitationId, organizationId, newRoleIds } = validatedFields.data;

    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        organizationId: organizationId,
      },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found." };
    }

    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: "Roles can only be updated for pending invitations.",
      };
    }

    if (invitation.expiresAt < new Date()) {
      return {
        success: false,
        error: "Cannot update roles for an expired invitation.",
      };
    }

    // Authorization: For now, let's assume any authenticated user who can find the invitation
    // can update its roles. In a real scenario, you might restrict this to the original inviter
    // or an organization admin.
    // Example: if (invitation.invitedById !== currentUserId && !isOrgAdmin(currentUserId, organizationId)) {
    //   return { success: false, error: "Not authorized to update this invitation." };
    // }

    const roles = await db.role.findMany({
      where: {
        id: { in: newRoleIds },
        NOT: {
          name: {
            equals: "Super Admin",
            mode: "insensitive",
          },
        },
      },
    });

    if (roles.length !== newRoleIds.length) {
      const foundRoleIds = roles.map((r) => r.id);
      const notFoundOrInvalidRoles = newRoleIds.filter(
        (id) => !foundRoleIds.includes(id)
      );
      return {
        success: false,
        error: `Invalid or non-assignable role IDs provided: ${notFoundOrInvalidRoles.join(", ")}`,
      };
    }

    await db.invitation.update({
      where: { id: invitationId },
      data: {
        roleIds: newRoleIds as Prisma.JsonArray,
      },
    });

    return { success: true, message: "Invitation roles updated successfully." };
  } catch (error) {
    console.error("Error updating invitation roles:", error);
    return {
      success: false,
      error: "Failed to update invitation roles. Please try again.",
    };
  }
}

const RevokeInvitationSchema = z.object({
  invitationId: z.string().cuid({ message: "Invalid invitation ID." }),
  organizationId: z.string().cuid({ message: "Invalid organization ID." }),
});

export async function revokeInvitation(
  values: z.infer<typeof RevokeInvitationSchema>
): Promise<
  { success: true; message: string } | { success: false; error: string }
> {
  try {
    const authResult = await auth();
    const currentUserId = authResult.userId;

    if (!currentUserId) {
      return { success: false, error: "User not authenticated." };
    }

    const validatedFields = RevokeInvitationSchema.safeParse(values);
    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", "),
      };
    }

    const { invitationId, organizationId } = validatedFields.data;

    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        organizationId: organizationId,
      },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found." };
    }

    // Authorization: Only the original inviter can revoke.
    if (invitation.invitedById !== currentUserId) {
      // Alternative: Check if currentUserId is an admin of the organizationId
      // const orgAdmin = await db.user.findFirst({ where: { userId: currentUserId, organizationId: organizationId, role: { name: "Admin" // or some admin role check } } });
      // if (!orgAdmin) {
      return {
        success: false,
        error:
          "Not authorized to revoke this invitation. Only the original inviter can revoke it.",
      };
      // }
    }

    if (invitation.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending invitations can be revoked.",
      };
    }

    if (invitation.expiresAt < new Date()) {
      // Also update status to EXPIRED if it's past expiry and somehow still PENDING
      await db.invitation.update({
        where: { id: invitationId },
        data: { status: "DECLINED" },
      });
      return {
        success: false,
        error:
          "This invitation has expired and cannot be revoked. It has been marked as declined.",
      };
    }

    await db.invitation.update({
      where: { id: invitationId },
      data: {
        status: "DECLINED",
        // Optional: Log who revoked and when, if you add fields to your model
        // revokedById: currentUserId,
        // revokedAt: new Date(),
      },
    });

    return { success: true, message: "Invitation revoked successfully." };
  } catch (error) {
    console.error("Error revoking invitation:", error);
    return {
      success: false,
      error: "Failed to revoke invitation. Please try again.",
    };
  }
}

export async function getPendingInvitationById(invitationId: string): Promise<
  | {
      success: true;
      invitation: {
        id: string;
        email: string;
        organizationId: string;
        roleIds: Prisma.JsonValue;
        status: string;
        expiresAt: Date;
        invitedById: string;
        createdAt: Date;
        updatedAt: Date;
        organization: {
          id: string;
          name: string;
          slug: string;
          superAdminId: string;
        };
      } | null;
    }
  | { success: false; error: string }
> {
  if (!invitationId) {
    return { success: false, error: "Invitation ID is required." };
  }
  try {
    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: {
        organization: true,
      },
    });
    return { success: true, invitation };
  } catch (error) {
    console.error("Error fetching invitation by ID:", error);
    return { success: false, error: "Failed to fetch invitation details." };
  }
}

// Re-saving to potentially trigger cache update for exports.
