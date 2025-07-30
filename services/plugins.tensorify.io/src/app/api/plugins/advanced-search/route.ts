import db from "@/server/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Prisma } from "@/server/database/prisma/generated/client";
import { processSearchResults } from "@/lib/search-utils";
import { getCorsHeaders, createOptionsHandler } from "@/lib/cors-utils";

export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
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
        // Include only published plugins
        { status: "published" },
      ] as Prisma.PluginWhereInput[],
    };

    // Add tags filter if specified
    if (tags.length > 0) {
      baseWhere.AND.push({
        OR: tags.map((tag) => ({
          tags: { contains: tag },
        })),
      } satisfies Prisma.PluginWhereInput);
    }

    // Get all plugins that match base criteria
    const allPlugins = await db.plugin.findMany({
      where: baseWhere,
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        authorName: true,
        tags: true,
        sdkVersion: true,
        createdAt: true,
        updatedAt: true,
        githubUrl: true,
        isPublic: true,
        status: true,
        version: true,
        authorId: true,
        readme: true,
        pluginType: true,
      },
    });

    // Process search results using shared logic, now with deduplication
    const { plugins: searchedPlugins, searchMeta } = processSearchResults(
      allPlugins,
      query,
      {
        includeReadme: true, // Advanced search includes readme
        limit: Infinity, // No limit before deduplication and sorting
        includeSearchMeta: !!query,
        deduplicate: true, // Enable deduplication
      }
    );

    // Apply sorting (only if not using relevance sorting or no query)
    if (sortBy !== "relevance" || !query) {
      switch (sortBy) {
        case "updated":
          searchedPlugins.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          break;
        case "newest":
          searchedPlugins.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          searchedPlugins.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        default:
          // For relevance with no query, sort by updated date
          searchedPlugins.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    }
    // If sortBy is "relevance" and there's a query, plugins are already sorted by score

    return NextResponse.json(
      {
        plugins: searchedPlugins.map((plugin) => ({
          ...plugin,
          createdAt: plugin.createdAt.toISOString(),
          updatedAt: plugin.updatedAt.toISOString(),
        })),
        total: searchedPlugins.length,
        searchMeta,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Advanced search error:", error);
    return NextResponse.json(
      { error: "Failed to search plugins" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle CORS preflight requests
export const OPTIONS = createOptionsHandler("GET, OPTIONS");
