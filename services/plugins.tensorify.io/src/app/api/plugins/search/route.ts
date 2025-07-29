import db from "@/server/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { processSearchResults } from "@/lib/search-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const username = (await currentUser())?.username || "";

    if (!query) {
      return NextResponse.json({ plugins: [] });
    }

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
        createdAt: true,
        updatedAt: true,
      },
    });

    // Process search results using shared logic
    const { plugins, searchMeta } = processSearchResults(allPlugins, query, {
      includeReadme: false, // Basic search doesn't include readme
      limit: 5,
      includeSearchMeta: true,
    });

    return NextResponse.json({
      plugins,
      searchMeta,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search plugins" },
      { status: 500 }
    );
  }
}
