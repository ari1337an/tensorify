import { NextRequest, NextResponse } from "next/server";
import db from "@/server/database/db";

export async function POST(req: NextRequest) {
  try {
    const { name, permissions } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Role name is required." },
        { status: 400 }
      );
    }

    if (
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "At least one permission is required." },
        { status: 400 }
      );
    }

    // Create role and assign permissions in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create the role
      const role = await tx.role.create({
        data: {
          name,
        },
      });

      // Create role-permission associations
      const rolePermissions = await Promise.all(
        permissions.map((permissionId) =>
          tx.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId,
            },
          })
        )
      );

      return { role, rolePermissions };
    });

    // Fetch the complete role with permissions for the response
    const roleWithPermissions = await db.role.findUnique({
      where: { id: result.role.id },
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
      data: roleWithPermissions,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const roles = await db.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Server error." },
      { status: 500 }
    );
  }
}
