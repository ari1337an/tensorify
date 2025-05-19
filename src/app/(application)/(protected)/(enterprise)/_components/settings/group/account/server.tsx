"use server";
import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function revokeSession(sessionId: string) {
  await clerkClient.sessions.revokeSession(sessionId);
}

export async function getSessions(userId: string) {
  const sessions = await clerkClient.sessions.getSessionList({
    userId: userId,
    status: "active",
  });

  return JSON.parse(JSON.stringify(sessions.data));
}
