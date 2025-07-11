"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { AlertCircle, Github, Loader2, Trash2, RefreshCw } from "lucide-react";
import { revokeGitHubAccess } from "@/server/actions/plugin-actions";
import { useRouter } from "next/navigation";

interface PermissionsClientProps {
  hasGitHubAccess: boolean;
  dbUserId: string;
  username: string;
}

export default function PermissionsClient({
  hasGitHubAccess,
  dbUserId,
  username,
}: PermissionsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Connect to GitHub
  const handleConnectGitHub = () => {
    setIsLoading(true);
    setError(null);

    try {
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/github-access`;
      const scope = "repo"; // Default scope for repository access
      const state = Math.random().toString(36).substring(7);

      // Store state in localStorage for verification during callback
      localStorage.setItem("github_oauth_state", state);

      // Redirect to GitHub for authorization
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    } catch (error) {
      console.error("GitHub connection error:", error);
      setError("Failed to initiate GitHub connection. Please try again.");
      setIsLoading(false);
    }
  };

  // Revoke GitHub access
  const handleRevokeAccess = async () => {
    setIsRevoking(true);
    setError(null);

    try {
      // Call server action to revoke access
      await revokeGitHubAccess(dbUserId);

      // Refresh the page to show updated permissions status
      router.refresh();
    } catch (error) {
      console.error("Error revoking access:", error);
      setError("Failed to revoke GitHub access. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">GitHub Integration</h2>

        {hasGitHubAccess ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">GitHub Connected</p>
                <p className="text-sm text-green-600">
                  Your GitHub account is connected as @{username}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Manage Permissions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You can revoke access and reconnect if needed.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleRevokeAccess}
                    disabled={isRevoking}
                    className="flex items-center gap-2"
                  >
                    {isRevoking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Revoke GitHub Access
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleConnectGitHub}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Reconnect GitHub Access
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-amber-50 text-amber-700 px-4 py-3 rounded-lg">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Not Connected</p>
                <p className="text-sm text-amber-600">
                  Connect to GitHub to create and manage plugins
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={handleConnectGitHub}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-black hover:bg-black/90 text-white px-6 py-5"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="h-5 w-5" />
                  )}
                  Connect GitHub Account
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center mt-4">
                GitHub permissions are required to access repositories for
                plugin creation and management.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">About GitHub Permissions</h2>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>Connecting to GitHub allows Tensorify to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Read your repository contents for plugin creation</li>
            <li>Verify repository ownership when publishing plugins</li>
            <li>Sync plugin updates with your GitHub repository</li>
          </ul>
          <p>
            We only store the access token needed to perform these operations
            and never share your data with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
