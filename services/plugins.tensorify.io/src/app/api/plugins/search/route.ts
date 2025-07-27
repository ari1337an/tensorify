import db from "@/server/database/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Prisma } from "@/server/database/prisma/generated/client";

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
        .split(",")
        .map((term) => term.trim())
        .filter(Boolean);

    const queryTerms = splitTerms(query);

    // Ensure correct Prisma filtering structure
    const searchConditions: Prisma.PluginWhereInput[] = queryTerms.map(
      (term) => ({
        OR: [
          { name: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
          {
            description: {
              contains: term,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          { slug: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
          { tags: { contains: term, mode: "insensitive" as Prisma.QueryMode } },
          {
            authorName: {
              contains: term,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
      })
    );

    const plugins = await db.plugin.findMany({
      where: {
        AND: [
          { OR: searchConditions },
          { OR: [{ isPublic: true }, { authorName: username }] },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        authorName: true,
        tags: true,
      },
      take: 5,
    });

    return NextResponse.json({ plugins });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search plugins" },
      { status: 500 }
    );
  }
}
