import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/server/database/db";
import PermissionsClient from "./PermissionsClient";

export default async function Permissions() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="text-muted-foreground mt-2">
            Please sign in to manage your GitHub permissions.
          </p>
        </div>
      </div>
    );
  }

  // Check if the user has already given GitHub permissions by looking for their record in the database
  const dbUser = await db.user.findFirst({
    where: {
      id: userId,
    },
  });

  const hasGitHubAccess = !!dbUser?.accessToken;

  // Get GitHub username if we have access
  let githubUsername = "";
  if (hasGitHubAccess && dbUser?.accessToken) {
    try {
      // Fetch GitHub user info using the access token
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${dbUser.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        const githubUser = await response.json();
        githubUsername = githubUser.login; // GitHub username
      }
    } catch (error) {
      console.error("Failed to fetch GitHub username:", error);
      // Fallback to username from database if available
      githubUsername = dbUser.username || "";
    }
  }

  // Fallback to Clerk username if GitHub username couldn't be fetched
  const displayUsername =
    githubUsername || user.username || user.firstName || "User";

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">GitHub Permissions</h1>
        <p className="text-muted-foreground">
          Manage your GitHub integration permissions for Tensorify plugins.
        </p>
      </div>

      <PermissionsClient
        hasGitHubAccess={hasGitHubAccess}
        dbUserId={userId}
        username={displayUsername}
      />
    </div>
  );
}
