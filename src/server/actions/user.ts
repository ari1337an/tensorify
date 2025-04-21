"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function getUserEmailFromUserId(
  userId: string
): Promise<string | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses[0]?.emailAddress || null;
  } catch (error) {
    console.error(`Failed to fetch email for user ${userId}:`, error);
    return null;
  }
}
