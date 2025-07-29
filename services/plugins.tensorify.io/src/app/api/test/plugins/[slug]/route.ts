import { NextRequest, NextResponse } from "next/server";
import db from "@/server/database/db";

// // SECURITY: Only works in development environment
// if (process.env.NODE_ENV !== "development") {
//   throw new Error(
//     "Test endpoints are only available in development environment"
//   );
// }

/**
 * DELETE /api/test/plugins/[slug]
 * Development-only endpoint for cleaning up test plugins
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slugParam = (await params).slug;

    // Double-check environment in request handler
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Test endpoints only available in development environment" },
        { status: 403 }
      );
    }

    // Verify test environment header
    const testEnvHeader = request.headers.get("x-test-environment");
    if (testEnvHeader !== "development") {
      return NextResponse.json(
        { error: "Missing or invalid X-Test-Environment header" },
        { status: 400 }
      );
    }

    // Verify authorization header (test token)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    const slug = decodeURIComponent(slugParam);

    // Find the plugin
    const plugin = await db.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }

    // Additional safety check: only allow deletion of test plugins
    const isTestPlugin =
      plugin.slug.includes("test-plugin-") ||
      plugin.authorName.includes("testing-bot-tensorify-dev") ||
      plugin.name.includes("test-plugin-");

    if (!isTestPlugin) {
      return NextResponse.json(
        { error: "Only test plugins can be deleted via this endpoint" },
        { status: 403 }
      );
    }

    // Delete the plugin
    await db.plugin.delete({
      where: { slug },
    });

    // Also clean up the test user if they have no other plugins
    const userPluginCount = await db.plugin.count({
      where: { authorId: plugin.authorId },
    });

    if (userPluginCount === 0) {
      // Delete the test user as well
      await db.user
        .delete({
          where: { id: plugin.authorId },
        })
        .catch(() => {
          // Ignore errors if user doesn't exist
        });
    }

    return NextResponse.json({
      success: true,
      message: "Test plugin deleted successfully",
      plugin: {
        slug: plugin.slug,
        name: plugin.name,
        authorName: plugin.authorName,
      },
    });
  } catch (error) {
    console.error("Error deleting test plugin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/plugins/[slug]
 * Development-only endpoint for checking if a test plugin exists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Double-check environment
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Test endpoints only available in development environment" },
        { status: 403 }
      );
    }

    const slug = decodeURIComponent((await params).slug);

    const plugin = await db.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return NextResponse.json({ exists: false, slug }, { status: 404 });
    }

    return NextResponse.json({
      exists: true,
      plugin: {
        id: plugin.id,
        slug: plugin.slug,
        name: plugin.name,
        authorName: plugin.authorName,
        status: plugin.status,
        createdAt: plugin.createdAt,
      },
    });
  } catch (error) {
    console.error("Error checking test plugin:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
