import db from "@/server/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
    const username = (await currentUser())?.username;

    const baseWhere = {
      AND: [
        // Public plugins or user's own plugins
        { OR: [{ isPublic: true }, { authorName: username }] },
        // Include both published and processing plugins
        { processingStatus: "published" },
      ] as Prisma.PluginWhereInput[],
    };

    // Add search conditions if query exists
    if (query) {
      baseWhere.AND.push({
        OR: [
          {
            name: { contains: query, mode: "insensitive" },
          } satisfies Prisma.PluginWhereInput,
          {
            description: { contains: query, mode: "insensitive" },
          } satisfies Prisma.PluginWhereInput,
          {
            slug: { contains: query, mode: "insensitive" },
          } satisfies Prisma.PluginWhereInput,
          {
            authorName: { contains: query, mode: "insensitive" },
          } satisfies Prisma.PluginWhereInput,
        ],
      });
    }

    // Add version filter if specified
    // if (version) {
    //   baseWhere.AND.push({ tensorifyVersion: version });
    // }

    // Add tags filter if specified
    if (tags.length > 0) {
      baseWhere.AND.push({
        OR: tags.map((tag) => ({
          tags: { contains: tag },
        })),
      } satisfies Prisma.PluginWhereInput);
    }

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "updated":
        orderBy = { updatedAt: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        // For relevance, we'll keep the default order
        orderBy = { updatedAt: "desc" };
    }

    const plugins = await db.plugin.findMany({
      where: baseWhere,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        authorName: true,
        tags: true,
        tensorifyVersion: true,
        createdAt: true,
        updatedAt: true,
        githubUrl: true,
        isPublic: true,
        status: true,
        processingStatus: true,
        processingTitle: true,
        processingMessage: true,
      },
    });

    // Extract base slug (everything before the colon) and group plugins by it
    const groupedPlugins = plugins.reduce((result, plugin) => {
      // Extract the base slug (everything before the colon)
      const baseSlug = plugin.slug.split(":")[0];

      // If this base slug hasn't been seen or the current plugin is newer than the stored one, update it
      if (
        !result[baseSlug] ||
        new Date(plugin.updatedAt) > new Date(result[baseSlug].updatedAt)
      ) {
        result[baseSlug] = plugin;
      }
      return result;
    }, {} as Record<string, (typeof plugins)[0]>);

    // Convert back to array
    const uniquePlugins = Object.values(groupedPlugins);

    return NextResponse.json({
      plugins: uniquePlugins.map((plugin) => ({
        ...plugin,
        createdAt: plugin.createdAt.toISOString(),
        updatedAt: plugin.updatedAt.toISOString(),
      })),
      total: uniquePlugins.length,
    });
  } catch (error) {
    console.error("Advanced search error:", error);
    return NextResponse.json(
      { error: "Failed to search plugins" },
      { status: 500 }
    );
  }
}
