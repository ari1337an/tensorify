"use server";

import db from "@/server/database/db";
import { Plugin } from "@/server/database/prisma/generated/client";
import { auth, clerkClient } from "@clerk/nextjs/server";

interface AuthorDetails {
  id: string;
  username: string | null;
  fullName: string | null;
  avatarUrl: string;
  plugins: Plugin[];
}

export async function getUserByUsername(username: string) {
  const client = await clerkClient();
  const users = await client.users.getUserList({
    username: [username],
  }); 
  const user = users.data[0];
  if (!user) return null;
  return user;
}

export async function getUserByUserId(userId: string) {
  const client = await clerkClient();
  try {
    const user = await client.users.getUser(userId);
    return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
}

export async function getAuthorDetails(
  authorId: string
): Promise<AuthorDetails | null> {
  try {
    const client = await clerkClient();

    // auth user
    const currentUser = await auth();
    let currentUsername = null;
    if (currentUser?.userId)
      currentUsername = (await client.users.getUser(currentUser?.userId))
        .username;

    // Get user details from Clerk
    const authorIdWithoutAt = decodeURIComponent(authorId)
      .replace("@", "")
      .trim();
    const user = await getUserByUsername(authorIdWithoutAt);
    if (!user) return null;

    // Get author's plugins from Prisma
    let plugins = null;

    if (currentUsername === authorIdWithoutAt) {
      plugins = await db.plugin.findMany({
        where: {
          authorName: authorIdWithoutAt,
          status: "published",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      plugins = await db.plugin.findMany({
        where: {
          authorName: authorIdWithoutAt,
          status: "published",
          isPublic: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return {
      id: user.id,
      username: user.username,
      fullName: `${user.firstName} ${user.lastName}`.trim() || null,
      avatarUrl: user.imageUrl,
      plugins,
    };
  } catch (error) {
    console.error("Error fetching author details:", error);
    return null;
  }
}
