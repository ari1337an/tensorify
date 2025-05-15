"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import db from "@/server/database/db";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import type { User } from "@clerk/clerk-sdk-node";
import { type Role as PrismaRole } from "@prisma/client";
import {
  PeopleListEntry,
  RoleDisplayInfo,
} from "@/app/(protected)/(enterprise)/_components/settings/group/people/columns";

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

export async function getOrganizationMembersAndInvites(
  organizationId: string
): Promise<PeopleListEntry[]> {
  try {
    // 1. Fetch active members
    const memberRecords = await db.user.findMany({
      where: { organizationId },
      include: {
        roles: { include: { role: true } },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });

    let clerkUsersMap = new Map<string, User>();
    if (memberRecords.length > 0) {
      const clerkUsersResponse = await clerkClient.users.getUserList({
        userId: memberRecords.map((member) => member.userId),
      });
      clerkUsersMap = new Map(clerkUsersResponse.data.map((u) => [u.id, u]));
    }

    const activeMembers: PeopleListEntry[] = memberRecords.map((member) => {
      const clerkUser = clerkUsersMap.get(member.userId);
      const memberRoles: RoleDisplayInfo[] = member.roles.map((userRole) => ({
        id: userRole.role.id,
        name: userRole.role.name,
      }));

      return {
        id: member.userId, // Use user.userId as the primary ID for members
        type: "member",
        name: `${member.firstName} ${member.lastName}`.trim(),
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        imageUrl: clerkUser?.imageUrl || null,
        roles: memberRoles,
        status: "Active",
        organizationId: member.organizationId || organizationId, // Ensure orgId is present
        userId: member.userId,
      };
    });

    // 2. Fetch invitations
    const invitationRecords = await db.invitation.findMany({
      where: { organizationId },
      include: {
        invitedBy: { select: { firstName: true, lastName: true, email: true } }, // Fetch inviter details
        // organization: { select: { name: true } } // Organization name if needed elsewhere
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all unique role IDs from all invitations to query roles efficiently
    const allRoleIdsFromInvites = Array.from(
      new Set(
        invitationRecords.flatMap((inv) => (inv.roleIds as string[]) || [])
      )
    );

    let rolesMap = new Map<string, PrismaRole>();
    if (allRoleIdsFromInvites.length > 0) {
      const rolesData = await db.role.findMany({
        where: { id: { in: allRoleIdsFromInvites } },
      });
      rolesMap = new Map(rolesData.map((r) => [r.id, r]));
    }

    const invitedUsers: PeopleListEntry[] = invitationRecords.map((invite) => {
      const inviteRoles: RoleDisplayInfo[] = (
        (invite.roleIds as string[]) || []
      )
        .map((roleId) => {
          const role = rolesMap.get(roleId);
          return { id: roleId, name: role?.name || "Unknown Role" };
        })
        .filter((role) => role.name !== "Unknown Role");

      let invStatus: PeopleListEntry["status"] = "Pending";
      switch (invite.status) {
        case "PENDING":
          // Check for expiration if pending
          if (new Date(invite.expiresAt) < new Date()) {
            invStatus = "Expired";
          } else {
            invStatus = "Pending";
          }
          break;
        case "ACCEPTED":
          invStatus = "Accepted";
          break;
        case "DECLINED":
          invStatus = "Declined";
          break;
        case "EXPIRED":
          invStatus = "Expired";
          break;
      }

      // If status became 'Accepted', check if they are already in activeMembers list
      // This handles the case where an invitation is accepted but user object might not be fully synced or viewed as member yet.
      // For simplicity, we'll rely on the UI to mostly show them as 'Active' if they are a member.
      // If an accepted invite still shows up, it might mean the user hasn't fully completed a potential post-acceptance setup.
      const isAlreadyMember = activeMembers.some(
        (m) => m.email.toLowerCase() === invite.email.toLowerCase()
      );
      if (invStatus === "Accepted" && isAlreadyMember) {
        // Optionally, filter these out if they are already in activeMembers
        // For now, we'll let them through, view.tsx can decide if it wants to merge or hide.
      }

      return {
        id: invite.id, // Use invitation.id as the primary ID for invitations
        type: "invitation",
        name: null, // Name might not be known until user accepts and sets up profile
        firstName: null,
        lastName: null,
        email: invite.email,
        imageUrl: null,
        roles: inviteRoles,
        status: invStatus,
        invitationDetails: {
          invitedAt: invite.createdAt.toISOString(),
          expiresAt: invite.expiresAt.toISOString(),
          invitedBy: invite.invitedBy
            ? {
                name:
                  `${invite.invitedBy.firstName || ""} ${invite.invitedBy.lastName || ""}`.trim() ||
                  null,
                email: invite.invitedBy.email || null,
              }
            : undefined,
        },
        organizationId: invite.organizationId,
        userId: undefined, // userId may not exist for pending invitees
      };
    });

    // Combine and potentially filter/sort
    // For now, simple concatenation. The UI might want to sort differently or filter out accepted invites if user is active.
    const combinedList = [
      ...activeMembers,
      ...invitedUsers.filter((inv) => {
        // If an invitation is accepted, and a member with that email exists, don't show the accepted invitation.
        if (
          inv.status === "Accepted" &&
          activeMembers.some(
            (m) => m.email.toLowerCase() === inv.email.toLowerCase()
          )
        ) {
          return false;
        }
        return true;
      }),
    ];

    // A more sophisticated sort might be needed, e.g., active members first, then by status/date.
    // Default sort: type (member first), then by name/email.
    combinedList.sort((a, b) => {
      if (a.type === "member" && b.type === "invitation") return -1;
      if (a.type === "invitation" && b.type === "member") return 1;
      const nameA = a.name || a.email;
      const nameB = b.name || b.email;
      return nameA.localeCompare(nameB);
    });

    return combinedList;
  } catch (error) {
    console.error("Error fetching organization members and invites:", error);
    // It's crucial that Prisma errors (like missing Invitation model if client is not updated) are caught here.
    if (
      error instanceof Error &&
      error.message.includes("PrismaClientKnownRequestError")
    ) {
      // Or check for specific error codes if db.invitation doesn't exist
      throw new Error(
        `Database error: Failed to fetch organization members and invites. Please ensure database schema is up to date. Original: ${error.message}`
      );
    }
    throw new Error(
      `Failed to fetch organization members and invites. ${error instanceof Error ? error.message : ""}`
    );
  }
}

// Placeholder for the detailed PersonDetails type. This should be more fleshed out.
// It might be beneficial to move this and PeopleListEntry to a shared types file.
export type PersonDetails = PeopleListEntry & {
  // Member specific
  teams?: { id: string; name: string }[];
  projects?: { id: string; name: string; teamName?: string | null }[];
  workflows?: {
    id: string;
    name: string;
    projectName?: string | null;
    teamName?: string | null;
  }[];
  effectivePermissions?: {
    action: string;
    resourceType: string;
    resourceId?: string | null;
    sourceRole?: string;
  }[]; // Detailed permissions

  // Invitation specific (already in PeopleListEntry.invitationDetails)

  // Common
  detailedRoles?: {
    id: string;
    name: string;
    permissions: { action: string; resourceType: string }[];
  }[];
};

export async function getPersonDetails(
  personId: string, // userId for member, invitationId for invitation
  personType: "member" | "invitation",
  organizationId: string
): Promise<{ success: boolean; data?: PersonDetails; error?: string }> {
  try {
    if (personType === "member") {
      // TODO: Fetch detailed member information
      // - User record from db.user
      // - Clerk user data
      // - Detailed roles with their permissions (from db.userRole -> db.role -> db.rolePermission -> db.permission)
      // - Team memberships (db.teamMember -> db.team)
      // - Project access (direct or via team - db.projectMember -> db.project)
      // - Workflow access (direct or via team/project - db.workflowMember -> db.workflow)
      // - Aggregate all permissions
      console.log(
        "TODO: Fetch member details for",
        personId,
        "in org",
        organizationId
      );
      // Placeholder data
      const memberPlaceholder: PersonDetails = {
        id: personId,
        userId: personId,
        type: "member",
        email: "member@example.com",
        name: "A Member",
        organizationId,
        roles: [{ id: "role1", name: "Editor" }],
        detailedRoles: [
          {
            id: "role1",
            name: "Editor",
            permissions: [{ action: "edit", resourceType: "document" }],
          },
        ],
        status: "Active",
        teams: [{ id: "team1", name: "Alpha Team" }],
        projects: [
          { id: "proj1", name: "Omega Project", teamName: "Alpha Team" },
        ],
        workflows: [
          { id: "wf1", name: "Main Workflow", projectName: "Omega Project" },
        ],
        effectivePermissions: [
          { action: "edit", resourceType: "document", sourceRole: "Editor" },
        ],
      };
      return { success: true, data: memberPlaceholder };
    } else if (personType === "invitation") {
      // TODO: Fetch detailed invitation information
      // - Invitation record from db.invitation (include invitedBy)
      // - Resolve roleIds to detailed roles with their permissions
      console.log(
        "TODO: Fetch invitation details for",
        personId,
        "in org",
        organizationId
      );
      const invitationPlaceholder: PersonDetails = {
        id: personId,
        type: "invitation",
        email: "invitee@example.com",
        organizationId,
        roles: [{ id: "role2", name: "Viewer" }],
        detailedRoles: [
          {
            id: "role2",
            name: "Viewer",
            permissions: [{ action: "view", resourceType: "document" }],
          },
        ],
        status: "Pending",
        invitationDetails: {
          invitedAt: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          invitedBy: { name: "Inviter Person", email: "inviter@example.com" },
        },
      };
      return { success: true, data: invitationPlaceholder };
    }

    return { success: false, error: "Invalid person type specified." };
  } catch (error) {
    console.error(
      `Error fetching details for ${personType} ${personId}:`,
      error
    );
    return {
      success: false,
      error: `Failed to fetch details. ${error instanceof Error ? error.message : ""}`,
    };
  }
}
