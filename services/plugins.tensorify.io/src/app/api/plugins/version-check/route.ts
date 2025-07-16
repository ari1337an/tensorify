import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/server/database/db";

// Request schema for version checking
const versionCheckSchema = z.object({
  slug: z.string().min(1, "Plugin name is required"),
  access: z.enum(["public", "private"], {
    required_error: "Access level must be public or private",
  }),
});

/**
 * POST /api/plugins/version-check
 * Check if a plugin version already exists and validate access level consistency
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { slug, access } = versionCheckSchema.parse(body);

    // Check if exact version already exists
    const existingPlugin = await db.plugin.findFirst({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        name: true,
        version: true,
        isPublic: true,
        status: true,
        createdAt: true,
      },
    });

    // If exact version exists, it's a conflict
    if (existingPlugin) {
      return NextResponse.json(
        {
          conflict: true,
          message: `Plugin ${slug} already exists.`,
        },
        { status: 409 }
      );
    }

    // Check for access level consistency with previous versions
    const previousVersions = await db.plugin.findMany({
      where: {
        slug: {
          startsWith: slug.split(":")[0],
        },
      },
      select: {
        version: true,
        isPublic: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    console.log({previousVersions})
    console.log({slug})
    console.log({access})

    // If there are previous versions, check access consistency
    if (previousVersions.length > 0) {
      const previousAccess = previousVersions[0].isPublic
        ? "public"
        : "private";
      const requestedPublic = access === "public";

      // Check if access level is inconsistent
      if (previousVersions[0].isPublic !== requestedPublic) {
        return NextResponse.json(
          {
            conflict: false,
            accessMismatch: true,
            available: false,
            message: `Access level mismatch: Previous versions were ${previousAccess}, but currently you are requesting ${access}.`,
          },
          { status: 400 }
        );
      }
    }

    // No conflicts found
    return NextResponse.json(
      {
        conflict: false,
        accessMismatch: false,
        available: true,
        message: `Plugin ${slug} is available for publishing with ${access} access`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Version check error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/plugins/version-check?slug=...
 * Alternative GET endpoint for version checking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    // Validate query parameters
    const validatedSlug = versionCheckSchema.parse({ slug: slug });

    // Reuse the same logic as POST
    const postRequest = new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: validatedSlug.slug,
      }),
    });

    return await POST(postRequest as NextRequest);
  } catch (error) {
    console.error("Version check GET error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/plugins/version-check
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
