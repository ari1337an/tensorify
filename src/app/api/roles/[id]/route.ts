import { NextRequest, NextResponse } from "next/server";
import db from "@/server/database/db";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const updateRoleSchema = z.object({
  permissions: z.array(z.string()),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsObj = await params;
    const roleId = paramsObj.id;

    // Get user authentication info
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", details: "Not authenticated" },
        { status: 401 }
      );
    }

    // Properly await params before using its properties (Next.js requirement)

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: "Role ID is required" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateRoleSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { permissions } = validationResult.data;

    console.log(
      `Role ID: ${roleId}, Updating permissions: ${permissions.length}`
    );

    try {
      // First, check if role exists outside of transaction
      const existingRole = await db.role.findUnique({
        where: { id: roleId },
      });

      if (!existingRole) {
        return NextResponse.json(
          { success: false, error: "Role not found" },
          { status: 404 }
        );
      }

      // Delete existing permissions first
      await db.rolePermission.deleteMany({
        where: { roleId },
      });

      // Add new permissions if any
      if (permissions.length > 0) {
        // Batch create permissions in chunks to improve performance
        const chunkSize = 10;
        for (let i = 0; i < permissions.length; i += chunkSize) {
          const chunk = permissions.slice(i, i + chunkSize);
          await db.rolePermission.createMany({
            data: chunk.map((permissionId) => ({
              roleId,
              permissionId,
            })),
          });
        }
      }

      // Fetch the updated role with permissions
      const updatedRole = await db.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedRole,
      });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Database operation failed",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating role:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update role",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
