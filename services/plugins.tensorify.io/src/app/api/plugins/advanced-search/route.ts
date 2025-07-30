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
        // Include both published and processing plugins
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
      },
    });

    // Process search results using shared logic (includes readme for advanced search)
    const { plugins: searchedPlugins, searchMeta } = processSearchResults(
      allPlugins,
      query,
      {
        includeReadme: true, // Advanced search includes readme
        limit: Infinity, // Don't limit here, we'll handle deduplication first
        includeSearchMeta: !!query,
      }
    );

    // Extract base slug (everything before the colon) and group plugins by it
    const groupedPlugins = searchedPlugins.reduce(
      (result, plugin) => {
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
      },
      {} as Record<string, (typeof searchedPlugins)[0]>
    );

    // Convert back to array
    const uniquePlugins = Object.values(groupedPlugins);

    // Apply sorting after deduplication (only if not using relevance sorting or no query)
    if (sortBy !== "relevance" || !query) {
      switch (sortBy) {
        case "updated":
          uniquePlugins.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          break;
        case "newest":
          uniquePlugins.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          uniquePlugins.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        default:
          // For relevance with no query, sort by updated date
          uniquePlugins.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    }
    // If sortBy is "relevance" and there's a query, plugins are already sorted by relevance score

    return NextResponse.json(
      {
        plugins: uniquePlugins.map((plugin) => ({
          ...plugin,
          createdAt: plugin.createdAt.toISOString(),
          updatedAt: plugin.updatedAt.toISOString(),
        })),
        total: uniquePlugins.length,
        searchMeta: query
          ? {
              ...searchMeta,
              totalResults: uniquePlugins.length, // Update to reflect deduplicated count
            }
          : undefined,
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
