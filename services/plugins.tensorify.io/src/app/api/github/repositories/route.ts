"use server";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/server/database/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Fetch repositories from GitHub
    const reposResponse = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const repos = await reposResponse.json();

    if (!reposResponse.ok) {
      console.error("GitHub API error:", repos);
      return NextResponse.json(
        { error: "Failed to fetch repositories from GitHub" },
        { status: reposResponse.status }
      );
    }

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
