import { NextResponse } from "next/server";
import db from "@/server/database/db";

export async function GET() {
  try {
    const permissions = await db.permission.findMany({
      orderBy: [{ resourceType: "asc" }, { action: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
