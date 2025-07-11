"use client";

import { createPlugin } from "@/server/actions/plugin-actions";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function DevModeCreateButton() {
  const router = useRouter();
  const { user } = useUser();
  const userName = user?.username;

  const handleQuickCreate = async () => {
    try {
      const plugin = await createPlugin({
        name: "Test Plugin",
        description: "This is a test plugin created in dev mode",
        githubUrl: "https://github.com/ari1337an/mock-api",
        status: "beta",
        tags: "test,dev",
        tensorifyVersion: "1.0.0",
        version: "1.0.0",
        isPublic: false,
        slug: `@${userName}/test:1.0.0`,
      });

      if (plugin) {
        router.push(`/plugins/${plugin.slug}`);
      }
    } catch (error) {
      console.error("Error creating test plugin:", error);
    }
  };

  return process.env.NODE_ENV === "development" ? (
    <button
      onClick={handleQuickCreate}
      className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
    >
      Quick Create Test Plugin
    </button>
  ) : null;
}
