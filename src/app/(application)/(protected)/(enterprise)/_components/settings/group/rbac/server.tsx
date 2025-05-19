"use server";

import db from "@/server/database/db";

export async function fetchRoles() {
  try {
    const roles = await db.role.findMany({
      where: {
        NOT: {
          name: {
            equals: "Super Admin",
            mode: "insensitive",
          },
        },
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return { success: true, data: roles };
  } catch (error) {
    console.error("Error fetching roles:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}
