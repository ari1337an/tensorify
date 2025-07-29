import db from "@/server/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const username = (await currentUser())?.username || "";

    if (!query) {
      return NextResponse.json({ plugins: [] });
    }

    // Function to safely split and trim tags/terms
    const splitTerms = (input: string): string[] =>
      input
        .split(/[\s,]+/) // Split by spaces and commas
        .map((term) => term.trim())
        .filter(Boolean);

    const queryTerms = splitTerms(query);

    // Get all plugins that might match
    const allPlugins = await db.plugin.findMany({
      where: {
        OR: [{ isPublic: true }, { authorName: username }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        authorName: true,
        tags: true,
        pluginType: true,
      },
    });

    // Function to calculate relevance score for a plugin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calculateScore = (plugin: any): number => {
      let score = 0;
      const searchText = query.toLowerCase();
      const searchTerms = queryTerms.map((term) => term.toLowerCase());

      const name = plugin.name.toLowerCase();
      const description = plugin.description.toLowerCase();
      const tags = (plugin.tags || "").toLowerCase();
      const slug = plugin.slug.toLowerCase();

      // Exact full query match (highest priority)
      if (name.includes(searchText)) score += 100;
      if (description.includes(searchText)) score += 80;
      if (tags.includes(searchText)) score += 60;
      if (slug.includes(searchText)) score += 40;

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
      });

      // Bonus for matching multiple terms (indicates better relevance)
      if (matchingTerms > 1) {
        score += matchingTerms * 10;
      }

      // Bonus if the percentage of matched terms is high
      const matchPercentage = matchingTerms / (searchTerms.length * 4); // 4 fields to search
      score += matchPercentage * 50;

      return score;
    };

    // Score and filter plugins
    const scoredPlugins = allPlugins
      .map((plugin) => ({
        ...plugin,
        score: calculateScore(plugin),
      }))
      .filter((plugin) => plugin.score > 0) // Only include plugins with some relevance
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 5) // Take top 5
      .map(({ score: _, ...plugin }) => plugin); // Remove score from final result

    return NextResponse.json({ plugins: scoredPlugins });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search plugins" },
      { status: 500 }
    );
  }
}
