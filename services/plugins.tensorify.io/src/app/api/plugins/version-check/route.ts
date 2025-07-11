import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Request schema for version checking
const versionCheckSchema = z.object({
  name: z.string().min(1, "Plugin name is required"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning"),
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
    const { name, version, access } = versionCheckSchema.parse(body);

    console.log(
      `Checking version for plugin: ${name}@${version} with access: ${access}`
    );

    // Check if exact version already exists
    const existingPlugin = await prisma.plugin.findFirst({
      where: {
        name: name,
        version: version,
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
      const existingAccess = existingPlugin.isPublic ? "public" : "private";
      return NextResponse.json(
        {
          conflict: true,
          existingAccess: existingAccess,
          existingPlugin: {
            id: existingPlugin.id,
            name: existingPlugin.name,
            version: existingPlugin.version,
            status: existingPlugin.status,
            createdAt: existingPlugin.createdAt,
          },
          message: `Plugin ${name}@${version} already exists with ${existingAccess} access`,
        },
        { status: 409 }
      );
    }

    // Check for access level consistency with previous versions
    const previousVersions = await prisma.plugin.findMany({
      where: {
        name: name,
        NOT: {
          version: version, // Exclude the current version we're checking
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
      take: 10, // Check last 10 versions for pattern
    });

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
            previousAccess: previousAccess,
            requestedAccess: access,
            previousVersions: previousVersions.map((v) => ({
              version: v.version,
              access: v.isPublic ? "public" : "private",
              createdAt: v.createdAt,
            })),
            message: `Access level mismatch: Previous versions were ${previousAccess}, but requesting ${access}`,
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
        previousVersionsCount: previousVersions.length,
        previousVersions: previousVersions.map((v) => ({
          version: v.version,
          access: v.isPublic ? "public" : "private",
          createdAt: v.createdAt,
        })),
        message: `Plugin ${name}@${version} is available for publishing with ${access} access`,
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
 * GET /api/plugins/version-check?name=...&version=...&access=...
 * Alternative GET endpoint for version checking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const version = searchParams.get("version");
    const access = searchParams.get("access");

    // Validate query parameters
    const {
      name: validName,
      version: validVersion,
      access: validAccess,
    } = versionCheckSchema.parse({
      name,
      version,
      access,
    });

    // Reuse the same logic as POST
    const postRequest = new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: validName,
        version: validVersion,
        access: validAccess,
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
