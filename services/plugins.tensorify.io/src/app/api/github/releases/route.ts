"use server";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const githubUrl = searchParams.get("githubUrl");

    if (!githubUrl) {
      return NextResponse.json(
        { error: "githubUrl parameter is required" },
        { status: 400 }
      );
    }

    // Extract owner and repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid GitHub URL format" },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;

    // Get user's GitHub access token from the database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (!user?.accessToken) {
      return NextResponse.json(
        { error: "GitHub access token not found" },
        { status: 404 }
      );
    }

    // Fetch releases from GitHub
    const releasesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=30`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!releasesResponse.ok) {
      const errorData = await releasesResponse.json();
      console.error("GitHub API error:", errorData);

      if (releasesResponse.status === 404) {
        return NextResponse.json(
          { error: "Repository not found or no releases available" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch releases from GitHub" },
        { status: releasesResponse.status }
      );
    }

    const releases = await releasesResponse.json();

    // Filter and format releases
    const formattedReleases = releases
      .filter((release: { draft: boolean }) => !release.draft) // Exclude draft releases
      .map((release: {
        id: number;
        tag_name: string;
        name: string;
        created_at: string;
        published_at: string;
        body: string;
        prerelease: boolean;
        html_url: string;
      }) => ({
        id: release.id,
        tagName: release.tag_name,
        name: release.name,
        createdAt: release.created_at,
        publishedAt: release.published_at,
        body: release.body,
        isPrerelease: release.prerelease,
        htmlUrl: release.html_url,
      }));

    return NextResponse.json({ releases: formattedReleases });
  } catch (error) {
    console.error("Error fetching GitHub releases:", error);
    return NextResponse.json(
      { error: "Failed to fetch releases" },
      { status: 500 }
    );
  }
}
