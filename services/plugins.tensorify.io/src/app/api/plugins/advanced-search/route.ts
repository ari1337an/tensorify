import db from "@/server/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Prisma } from "@/server/database/prisma/generated/client";

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

    // Function to safely split and trim search terms
    const splitTerms = (input: string): string[] =>
      input
        .split(/[\s,]+/) // Split by spaces and commas
        .map((term) => term.trim())
        .filter(Boolean);

    // Function to calculate relevance score for a plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calculateScore = (plugin: any): number => {
      if (!query) return 1; // If no query, all plugins have equal base score

      let score = 0;
      const searchText = query.toLowerCase();
      const queryTerms = splitTerms(query);
      const searchTerms = queryTerms.map((term) => term.toLowerCase());

      const name = plugin.name.toLowerCase();
      const description = plugin.description.toLowerCase();
      const tags = (plugin.tags || "").toLowerCase();
      const slug = plugin.slug.toLowerCase();
      const readme = (plugin.readme || "").toLowerCase();

      // Exact full query match (highest priority)
      if (name.includes(searchText)) score += 100;
      if (description.includes(searchText)) score += 80;
      if (tags.includes(searchText)) score += 60;
      if (slug.includes(searchText)) score += 40;
      if (readme.includes(searchText)) score += 30;

      // Count matching terms and give higher score for more matches
      let matchingTerms = 0;
      searchTerms.forEach((term) => {
        if (name.includes(term)) {
          score += 20;
          matchingTerms++;
        }
        if (description.includes(term)) {
          score += 15;
          matchingTerms++;
        }
        if (tags.includes(term)) {
          score += 10;
          matchingTerms++;
        }
        if (slug.includes(term)) {
          score += 5;
          matchingTerms++;
        }
        if (readme.includes(term)) {
          score += 3;
          matchingTerms++;
        }
      });

      // Bonus for matching multiple terms (indicates better relevance)
      if (matchingTerms > 1) {
        score += matchingTerms * 10;
      }

      // Bonus if the percentage of matched terms is high
      const matchPercentage = matchingTerms / (searchTerms.length * 5); // 5 fields to search
      score += matchPercentage * 50;

      return score;
    };

    // Score and filter plugins if there's a search query
    let filteredPlugins = allPlugins;
    if (query) {
      filteredPlugins = allPlugins
        .map((plugin) => ({
          ...plugin,
          score: calculateScore(plugin),
        }))
        .filter((plugin) => plugin.score > 0) // Only include plugins with some relevance
        .sort((a, b) => b.score - a.score) // Sort by score descending initially
        .map(({ score: _, ...plugin }) => plugin); // Remove score from final result
    }

    // Extract base slug (everything before the colon) and group plugins by it
    const groupedPlugins = filteredPlugins.reduce(
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
      {} as Record<string, (typeof filteredPlugins)[0]>
    );

    // Convert back to array
    let uniquePlugins = Object.values(groupedPlugins);

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
