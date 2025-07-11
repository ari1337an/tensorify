"use server";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserByUserId } from "@/server/actions/author-actions";
import db from "@/server/database/db";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/plugins/permissions", request.url));
    }

    const user = await getUserByUserId(userId);
    if (!user?.username) {
      return NextResponse.redirect(new URL("/plugins/permissions", request.url));
    }

    // Verify environment variables
    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      console.error("Missing GitHub OAuth credentials");
      return NextResponse.redirect(new URL("/plugins/permissions", request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.redirect(new URL("/plugins/permissions", request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/github-access`,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("GitHub token error:", tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || "Failed to get access token" },
        { status: tokenResponse.status }
      );
    }

    if (!tokenData.access_token) {
      console.error("No access token in response:", tokenData);
      return NextResponse.redirect(new URL("/plugins/permissions", request.url));
    }

    try {
      // Store or update the access token in the User model
      const updatedUser = await db.user.upsert({
        where: { id: userId },
        update: {
          accessToken: tokenData.access_token,
          updatedAt: new Date(),
        },
        create: {
          id: userId,
          username: user.username,
          accessToken: tokenData.access_token,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log("User updated/created:", updatedUser);

      // Redirect to the plugin creation page
      return NextResponse.redirect(new URL("/plugins/create", request.url));
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(new URL("/plugins/permissions", request.url));
    }
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(new URL("/plugins/permissions", request.url));
  }
}
