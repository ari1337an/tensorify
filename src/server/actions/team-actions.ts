"use server";

import { z } from "zod";
import db from "@/server/database/db";

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
  console.log("getTeams called with input:", input);

  try {
    const { page, limit, organizationId } = paginationSchema.parse(input);
    console.log("Parsed input:", { page, limit, organizationId });

    const skip = (page - 1) * limit;

    // Where clause for filtering by organization if provided
    const where = organizationId ? { organizationId } : {};
    console.log("Using where clause:", where);

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
    console.log("Found teams:", teams.length);

    // Get total count for pagination
    const totalCount = await db.team.count({ where });
    console.log("Total count:", totalCount);

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
    console.log("Returning response with teams count:", response.teams.length);
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
    console.log("Creating team:", { name, adminId, organizationId });

    const resourceId = await db.$transaction(async (tx) => {
      // First create the resource
      const resource = await tx.resource.create({
        data: {},
      });
      console.log("Created resource:", resource.id);

      // Then create the team with the resource ID
      const team = await tx.team.create({
        data: {
          id: resource.id, // Use same ID
          name,
          adminId,
          organizationId,
        },
      });
      console.log("Created team:", team.id);

      return resource.id;
    });

    return resourceId;
  } catch (error) {
    console.error("Error in createTeam:", error);
    throw error;
  }
}
