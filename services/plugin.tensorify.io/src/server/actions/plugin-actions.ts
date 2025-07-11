"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { PluginRepository } from "../database/repository/plugin-repository";
import { PluginUseCase } from "../usecases/plugin-usecase";
import { CreatePluginInput } from "../validation/plugin-schema";
import { ProcessingStatus } from "../models/plugin";
import { Plugin } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { getPluginReadme, deletePlugin as deletePluginS3 } from "@/lib/s3";
import { publishTensorifyPluginTriggerTask } from "@/trigger/publish-tensorify-plugin";

const pluginUseCase = new PluginUseCase(new PluginRepository());
const prisma = new PrismaClient();

export async function createPlugin(data: CreatePluginInput) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized");

  // Check for any unpublished plugins
  const hasUnpublished = await hasUnpublishedPlugins(userId);
  if (hasUnpublished) {
    throw new Error(
      "You have unpublished plugins. Please wait for them to be published before creating new ones."
    );
  }

  let createdPlugin: Plugin | null = null;

  try {
    // Generate the full slug with version
    const authorSlug = user.username?.toLowerCase() || user.id;
    const nameSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // const fullSlug = `@${authorSlug}/${nameSlug}:${data.version}`;
    const fullSlug = data.slug ?? `@${authorSlug}/${nameSlug}:${data.version}`;

    // Create plugin with versioned slug and SHA
    const plugin = await pluginUseCase.createPlugin(
      {
        ...data,
        slug: fullSlug,
        authorName: user.username || user.firstName || "Anonymous",
        authorId: userId,
        processingStatus: "queued" as ProcessingStatus,
        sha: data.sha || null, // Include SHA in creation
      },
      userId
    );

    createdPlugin = plugin;

    // Retrieve user's GitHub access token
    const userWithToken = await prisma.user.findFirst({
      where: { username: user.username || "" },
      select: { accessToken: true },
    });

    // Trigger the publish-tensorify-plugin trigger with the access token if available
    await publishTensorifyPluginTriggerTask.trigger({
      slug: fullSlug,
      githubUrl: data.githubUrl,
      releaseTag: data.releaseTag || data.version, // Use releaseTag if provided, otherwise fall back to version
      accessToken: userWithToken?.accessToken || undefined,
    });

    return plugin;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error in createPlugin:", error);
    }
    // delete the plugin
    if (createdPlugin) {
      await deletePluginAction(createdPlugin.slug);
    }
    throw error;
  }
}

export async function listPlugins(userId?: string) {
  if (userId) {
    return pluginUseCase.listPluginsByUser(userId);
  }
  return pluginUseCase.listPlugins();
}

export async function getPluginById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return pluginUseCase.getPluginById(id);
}

export async function getLatestPluginVersion(baseSlug: string) {
  const plugin = await prisma.plugin.findFirst({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      processingStatus: "published",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return plugin;
}

export async function getPluginBySlug(slug: string) {
  // If no version specified, get the latest version
  if (!slug.includes(":")) {
    return getLatestPluginVersion(slug);
  }

  // If version is specified, get that specific version
  const plugin = await prisma.plugin.findUnique({
    where: { slug },
  });
  return plugin;
}

export async function getNextVersion(baseSlug: string) {
  const latestPlugin = await prisma.plugin.findFirst({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestPlugin) return "0.0.1";

  const currentVersion = latestPlugin.slug.split(":")[1];
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  if (patch < 9) {
    return `${major}.${minor}.${patch + 1}`;
  } else if (minor < 9) {
    return `${major}.${minor + 1}.0`;
  } else {
    return `${major + 1}.0.0`;
  }
}

// // Add this function to check if latest version has SHA
// async function validateLatestVersionSHA(baseSlug: string) {
//   const latestPlugin = await prisma.plugin.findFirst({
//     where: {
//       slug: {
//         startsWith: baseSlug,
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   if (!latestPlugin)
//     return { valid: false, error: "No previous version found" };
//   if (!latestPlugin.sha)
//     return {
//       valid: false,
//       error: "Latest version has no SHA commit reference",
//     };

//   return { valid: true, sha: latestPlugin.sha };
// }

// Add this helper function
async function hasUnpublishedPlugins(userId: string, baseSlug?: string) {
  const where = baseSlug
    ? {
        authorId: userId,
        slug: { startsWith: baseSlug },
        processingStatus: { not: "published" },
      }
    : {
        authorId: userId,
        processingStatus: { not: "published" },
      };

  const unpublishedCount = await prisma.plugin.count({
    where,
  });

  return unpublishedCount > 0;
}

export async function publishNewVersion(
  baseSlug: string,
  data: CreatePluginInput
) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return {
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Check for unpublished versions of this plugin
    const hasUnpublished = await hasUnpublishedPlugins(userId, baseSlug);
    if (hasUnpublished) {
      return {
        error: {
          code: "UNPUBLISHED_EXISTS",
          message:
            "This plugin has unpublished versions. Please wait for them to be published before creating new versions.",
        },
      };
    }

    const getPlugin = await getPluginBySlug(baseSlug);

    if (!getPlugin) {
      return {
        error: { code: "NOT_FOUND", message: "Plugin not found" },
      };
    }

    // Exclude existing slug to force generation of new slug with custom version
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { slug, ...dataWithoutSlug } = data;

    const authorSlug = user.username?.toLowerCase() || user.id;
    const nameSlug = dataWithoutSlug.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const newSlug = `@${authorSlug}/${nameSlug}:${dataWithoutSlug.version}`;

    console.log("Publishing new version:", {
      baseSlug,
      customVersion: dataWithoutSlug.version,
      releaseTag: dataWithoutSlug.releaseTag,
      newSlug,
    });

    const plugin = await createPlugin({
      ...dataWithoutSlug,
      isPublic: getPlugin.isPublic,
      slug: newSlug,
    });

    return { data: plugin };
  } catch (error) {
    console.error("Error publishing new version:", error);
    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: "Failed to publish new version. Please try again later.",
      },
    };
  }
}

export async function listPluginVersions(baseSlug: string) {
  return prisma.plugin.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listPluginsByUsername(username: string) {
  return prisma.plugin.findMany({
    where: {
      authorName: username,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPluginReadmeContent(pluginSlug: string) {
  try {
    return await getPluginReadme(pluginSlug);
  } catch (error) {
    console.error("Error fetching plugin readme:", error);
    return "No README content available.";
  }
}

export async function createTestPlugin() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) throw new Error("Unauthorized");

  return createPlugin({
    name: "Test Plugin",
    description: "A test plugin created for development purposes",
    githubUrl: "https://github.com/tensorify/demo-plugin",
    status: "active",
    isPublic: false,
    slug: `@${user.username}/test:1.0.0`,
    tensorifyVersion: "1.0.0", // Tensorify compatibility version
    version: "1.0.0", // Plugin version
    tags: "test,development",
  });
}

export async function retryPluginPublication(slug: string, githubUrl: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the plugin to verify ownership
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return {
        success: false,
        error: "Plugin not found",
      };
    }

    // Verify ownership
    if (plugin.authorId !== userId) {
      return {
        success: false,
        error: "You are not authorized to retry this plugin publication",
      };
    }

    // Retrieve user's GitHub access token
    const userWithToken = await prisma.user.findFirst({
      where: { username: user.username || "" },
      select: { accessToken: true },
    });

    // Trigger the publish-tensorify-plugin trigger with the access token if available
    await publishTensorifyPluginTriggerTask.trigger({
      slug,
      githubUrl: githubUrl,
      releaseTag: plugin.releaseTag || plugin.version, // Use stored releaseTag or fall back to version
      accessToken: userWithToken?.accessToken || undefined,
    });

    await prisma.plugin.update({
      where: { slug },
      data: {
        processingStatus: "queued",
        updatedAt: new Date(),
        processingTitle: "Publication retry started",
        processingMessage: "Your plugin is being processed again.",
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update plugin status:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update plugin status",
    };
  }
}

export async function deletePluginAction(slug: string) {
  const { userId } = await auth();

  if (!userId) {
    return {
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Get the plugin to check ownership and if it's private
    const plugin = await getPluginBySlug(slug);

    if (!plugin) {
      return {
        error: { code: "NOT_FOUND", message: "Plugin not found" },
      };
    }

    // Check if the user is the owner
    if (plugin.authorId !== userId) {
      return {
        error: {
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this plugin",
        },
      };
    }

    // Check if plugin is private
    if (plugin.isPublic && plugin.processingStatus === "published") {
      return {
        error: {
          code: "FORBIDDEN",
          message: "Public plugins cannot be deleted",
        },
      };
    }

    // Get base slug (without version) to find all versions
    const baseSlug = slug.split(":")[0];

    // Get all versions of this plugin
    const allVersions = await listPluginVersions(baseSlug);

    // Delete each version from S3 and database
    const deletionPromises = allVersions.map(async (versionedPlugin) => {
      try {
        // Delete from S3
        await deletePluginS3(versionedPlugin.slug);

        // Delete from database
        await pluginUseCase.deletePlugin(versionedPlugin.id);
      } catch (versionError) {
        console.error(
          `Error deleting version ${versionedPlugin.slug}:`,
          versionError
        );
        // Continue with other versions even if one fails
      }
    });

    // Wait for all deletions to complete
    await Promise.all(deletionPromises);

    return { success: true };
  } catch (error) {
    console.error("Error deleting plugin:", error);
    return {
      error: {
        code: "UNKNOWN_ERROR",
        message: "Failed to delete plugin. Please try again later.",
      },
    };
  }
}

export async function updatePluginTags(slug: string, tags: string) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Get the plugin to verify ownership
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Plugin not found" },
      };
    }

    // Verify ownership
    if (plugin.authorId !== userId) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not the owner of this plugin",
        },
      };
    }

    // Extract base slug to update all versions
    const baseSlug = slug.split(":")[0];

    // Update tags for all versions of this plugin
    await prisma.plugin.updateMany({
      where: {
        slug: {
          startsWith: baseSlug + ":",
        },
      },
      data: { tags },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating plugin tags:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while updating plugin tags",
      },
    };
  }
}

export async function updatePluginDescription(
  slug: string,
  description: string
) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Get the plugin to verify ownership
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Plugin not found" },
      };
    }

    // Verify ownership
    if (plugin.authorId !== userId) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not the owner of this plugin",
        },
      };
    }

    // Extract base slug to update all versions
    const baseSlug = slug.split(":")[0];

    // Update description for all versions of this plugin
    await prisma.plugin.updateMany({
      where: {
        slug: {
          startsWith: baseSlug + ":",
        },
      },
      data: { description },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating plugin description:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while updating plugin description",
      },
    };
  }
}

export async function updatePluginTensorifyVersion(
  slug: string,
  tensorifyVersion: string
) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Get the plugin to verify ownership
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Plugin not found" },
      };
    }

    // Verify ownership
    if (plugin.authorId !== userId) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not the owner of this plugin",
        },
      };
    }

    // Update tensorify version
    await prisma.plugin.update({
      where: { slug },
      data: { tensorifyVersion },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating plugin Tensorify version:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while updating Tensorify version",
      },
    };
  }
}

export async function updatePluginStatus(slug: string, status: string) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Get the plugin to verify ownership
    const plugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (!plugin) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Plugin not found" },
      };
    }

    // Verify ownership
    if (plugin.authorId !== userId) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not the owner of this plugin",
        },
      };
    }

    // Update status
    await prisma.plugin.update({
      where: { slug },
      data: { status },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating plugin status:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An error occurred while updating plugin status",
      },
    };
  }
}

// Define the return type for checkRepositoryExists
type CheckRepositoryResult = {
  exists: boolean;
  plugin?: {
    name: string;
    slug: string;
  };
  error?: {
    code: string;
    message: string;
  };
};

export async function checkRepositoryExists(
  githubUrl: string
): Promise<CheckRepositoryResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      exists: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    // Check if this GitHub URL is already used in any plugin by this user
    const existingPlugin = await prisma.plugin.findFirst({
      where: {
        githubUrl,
        authorId: userId,
      },
      select: {
        name: true,
        slug: true,
      },
    });

    if (existingPlugin) {
      return {
        exists: true,
        plugin: {
          name: existingPlugin.name,
          slug: existingPlugin.slug,
        },
      };
    }

    return { exists: false };
  } catch (error) {
    console.error("Error checking repository existence:", error);
    return {
      exists: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Failed to check repository. Please try again later.",
      },
    };
  }
}

/**
 * Revokes GitHub access by removing the access token from the user record
 * and also revoking the token on GitHub's side to ensure the OAuth
 * permission screen is shown again on reconnection.
 */
export async function revokeGitHubAccess(userId: string) {
  const { userId: authUserId } = await auth();

  // Ensure the user can only revoke their own access
  if (!authUserId || authUserId !== userId) {
    throw new Error("Unauthorized: You can only revoke your own GitHub access");
  }

  try {
    // First retrieve the user's access token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });

    if (user?.accessToken) {
      // Client ID and secret are needed for authentication
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("GitHub client credentials not configured");
      }

      // Revoke the token on GitHub's side
      const response = await fetch(
        `https://api.github.com/applications/${clientId}/grant`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`,
          },
          body: JSON.stringify({ access_token: user.accessToken }),
        }
      );

      if (!response.ok) {
        // Even if the GitHub revocation fails, we'll still remove it from our DB
        console.error("Failed to revoke GitHub token:", await response.text());
      }
    }

    // Update the user record to remove the access token
    await prisma.user.update({
      where: { id: userId },
      data: { accessToken: null },
    });

    return { success: true };
  } catch (error) {
    console.error("Error revoking GitHub access:", error);
    throw new Error("Failed to revoke GitHub access");
  }
}

// Define the return type for checkVersionExists
type CheckVersionResult = {
  exists: boolean;
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Checks if a specific version slug already exists for a user
 */
export async function checkVersionExists(
  baseSlug: string,
  version: string
): Promise<CheckVersionResult> {
  const { userId } = await auth();

  console.log("Checking version existence:", { baseSlug, version });

  if (!userId) {
    return {
      exists: false,
      error: { code: "UNAUTHORIZED", message: "You must be logged in" },
    };
  }

  try {
    const fullSlug = `${baseSlug}:${version}`;

    // Check if this version slug already exists
    const existingPlugin = await prisma.plugin.findFirst({
      where: {
        slug: fullSlug,
      },
    });

    return { exists: !!existingPlugin };
  } catch (error) {
    console.error("Error checking version existence:", error);
    return {
      exists: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Failed to check version. Please try again later.",
      },
    };
  }
}

/**
 * Validates if a version string is in the correct semantic version format (a.b.c)
 */
export async function validateVersionFormat(version: string): Promise<boolean> {
  const semverRegex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
  return semverRegex.test(version);
}
