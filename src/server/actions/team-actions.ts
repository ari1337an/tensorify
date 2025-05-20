"use server";

import { z } from "zod";
import db from "@/server/database/db";
import { PeopleListEntry } from "@/app/(application)/(protected)/(enterprise)/_components/settings/group/people/columns";
import { auth } from "@clerk/nextjs/server";

const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  organizationId: z.string().optional(),
});

export type TeamWithMemberCount = {
  id: string;
  name: string;
  adminId: string;
  organizationId: string | null;
  memberCount: number;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type PaginatedTeams = {
  teams: TeamWithMemberCount[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};

/**
 * Get paginated list of teams with member count
 */
export async function getTeams(
  input: z.infer<typeof paginationSchema>
): Promise<PaginatedTeams> {
  try {
    const { page, limit, organizationId } = paginationSchema.parse(input);

    const skip = (page - 1) * limit;

    // Where clause for filtering by organization if provided
    const where = organizationId ? { organizationId } : {};

    // Get teams with count of members and admin details
    const teams = await db.team.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await db.team.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        adminId: team.adminId,
        organizationId: team.organizationId,
        memberCount: team._count.members,
        admin: team.admin,
      })),
      totalCount,
      totalPages,
      currentPage: page,
      limit,
    };
    return response;
  } catch (error) {
    console.error("Error in getTeams:", error);
    throw error; // Re-throw to be caught by the client
  }
}

/**
 * Create a new team
 */
export async function createTeam(
  name: string,
  adminId: string,
  organizationId?: string
) {
  try {
    const resourceId = await db.$transaction(async (tx) => {
      // First create the resource
      const resource = await tx.resource.create({
        data: {},
      });

      // Then create the team with the resource ID
      const team = await tx.team.create({
        data: {
          id: resource.id, // Use same ID
          name,
          adminId,
          organizationId,
        },
      });

      return team.id;
    });

    return resourceId;
  } catch (error) {
    console.error("Error in createTeam:", error);
    throw error;
  }
}

export async function getTeamMembers(
  teamId: string
): Promise<PeopleListEntry[]> {
  // 1. Find all team members for the given teamId
  const teamMembers = await db.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
    },
  });

  // 2. Map to PeopleListEntry[]
  return teamMembers.map((tm) => {
    const user = tm.user;
    return {
      id: user.userId,
      type: "member",
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      imageUrl: user.imageUrl || null,
      roles: (user.roles || []).map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      })),
      status: "Active",
      organizationId: user.organizationId || "",
      userId: user.userId,
    };
  });
}

/**
 * Check if a user can be invited to a specific team
 */
export async function canInviteUserToTeam(
  email: string,
  teamId: string
): Promise<{ canInvite: boolean; reason?: string }> {
  try {
    // First get the team to retrieve the organization ID
    const team = await db.team.findUnique({
      where: { id: teamId },
      select: { organizationId: true },
    });

    if (!team || !team.organizationId) {
      return {
        canInvite: false,
        reason: "Team not found or not associated with an organization.",
      };
    }

    // Check if the user is already a member of the organization
    const existingMember = await db.user.findFirst({
      where: {
        email,
        organizationId: team.organizationId,
      },
    });

    if (!existingMember) {
      return {
        canInvite: false,
        reason:
          "User must be a member of the organization before they can be added to a team.",
      };
    }

    // Check if the user is already a member of this team
    const existingTeamMember = await db.teamMember.findFirst({
      where: {
        teamId,
        user: {
          email,
        },
      },
    });

    if (existingTeamMember) {
      return {
        canInvite: false,
        reason: "User is already a member of this team.",
      };
    }

    // Check if there's a pending invitation to this team
    // Note: This would require a team-specific invitation model,
    // which isn't available in the current schema. The current
    // invitation model is only for organization invitations.

    return { canInvite: true };
  } catch (error) {
    console.error("Error checking if user can be invited to team:", error);
    return {
      canInvite: false,
      reason: "Error checking team invitation status.",
    };
  }
}

/**
 * Invite a user to a specific team
 */
export async function inviteToTeam(
  email: string,
  teamId: string,
  roleIds: string[] = []
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const authResult = await auth();
    const inviterId = authResult.userId;

    if (!inviterId) {
      return { success: false, error: "User not authenticated." };
    }

    // First validate if the user can be invited
    const canInvite = await canInviteUserToTeam(email, teamId);
    if (!canInvite.canInvite) {
      return { success: false, error: canInvite.reason };
    }

    // Get the user to add to the team
    const user = await db.user.findFirst({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    // Add the user to the team
    await db.teamMember.create({
      data: {
        teamId,
        userId: user.userId,
      },
    });

    // If roleIds are provided, assign the roles to the user
    if (roleIds.length > 0) {
      // Verify the roles exist
      const roles = await db.role.findMany({
        where: {
          id: { in: roleIds },
        },
      });

      if (roles.length !== roleIds.length) {
        // Still continue with team membership even if some roles don't exist
        console.warn(
          "Some role IDs were not found:",
          roleIds.filter((id) => !roles.map((r) => r.id).includes(id))
        );
      }

      // Assign each valid role to the user
      for (const role of roles) {
        // Check if user already has this role
        const existingRole = await db.userRole.findFirst({
          where: {
            userId: user.userId,
            roleId: role.id,
          },
        });

        if (!existingRole) {
          await db.userRole.create({
            data: {
              userId: user.userId,
              roleId: role.id,
              resourceId: teamId, // Use team as the resource
            },
          });
        }
      }
    }

    return {
      success: true,
      message: `Successfully added ${email} to the team.`,
    };
  } catch (error) {
    console.error("Error inviting user to team:", error);
    return {
      success: false,
      error: "Failed to invite user to team. Please try again.",
    };
  }
}
