import { NextRequest, NextResponse } from "next/server";
import db from "@/server/database/db";

/**
 * GET handler for fetching onboarding data
 * Supports filtering by tag parameter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    // If tag is provided, find a specific version
    if (tag) {
      const version = await db.onboardingTagVersion.findUnique({
        where: { tag },
        include: {
          questions: {
            orderBy: {
              sortOrder: "asc",
            },
            include: {
              options: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
          },
        },
      });

      if (!version) {
        return NextResponse.json(
          { error: `Onboarding with tag "${tag}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({ version });
    }

    // If no tag, return all versions (with pagination later)
    const versions = await db.onboardingTagVersion.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Error fetching onboarding data:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}
