import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPluginBySlug } from "@/server/actions/plugin-actions";

interface InstallRequest {
  pluginSlug: string;
  targetVersion?: string;
  installationId: string;
  environment?: {
    tensorifyVersion: string;
    platform: string;
    nodeVersion?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body: InstallRequest = await request.json();
    const { pluginSlug, targetVersion, installationId, environment } = body;

    if (!pluginSlug || !installationId) {
      return NextResponse.json(
        { error: "Missing required fields: pluginSlug, installationId" },
        { status: 400 }
      );
    }

    // Resolve plugin version
    let resolvedSlug = pluginSlug;
    if (targetVersion && !pluginSlug.includes(":")) {
      resolvedSlug = `${pluginSlug}:${targetVersion}`;
    }

    // Get plugin details
    const plugin = await getPluginBySlug(resolvedSlug);
    if (!plugin) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    // Check if plugin is published
    if (plugin.processingStatus !== "published") {
      return NextResponse.json(
        { error: "Plugin is not available for installation" },
        { status: 400 }
      );
    }

    // Check permissions for private plugins
    if (!plugin.isPublic && plugin.authorId !== userId) {
      return NextResponse.json(
        { error: "Access denied to private plugin" },
        { status: 403 }
      );
    }

    // Validate version compatibility if provided
    if (environment?.tensorifyVersion) {
      const requiredVersion = plugin.tensorifyVersion;
      const userVersion = environment.tensorifyVersion;
      
      // Simple version compatibility check (can be enhanced)
      if (!isVersionCompatible(userVersion, requiredVersion)) {
        return NextResponse.json({
          error: "Version incompatible",
          details: {
            required: requiredVersion,
            current: userVersion,
            message: `This plugin requires Tensorify ${requiredVersion} but you have ${userVersion}`
          }
        }, { status: 409 });
      }
    }

    // Record installation attempt (optional tracking)
    try {
      // You could create an Installation table to track installations
      // For now, we'll just log it
      console.log(`Plugin installation attempt: ${plugin.slug} by user ${userId}`, {
        installationId,
        environment,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to record installation:", error);
      // Don't fail the request for tracking errors
    }

    // Return successful installation response
    const response = {
      success: true,
      plugin: {
        slug: plugin.slug,
        name: plugin.name,
        version: plugin.version,
        description: plugin.description,
        author: plugin.authorName,
        tensorifyVersion: plugin.tensorifyVersion,
        downloadUrl: `/api/plugins/${encodeURIComponent(plugin.slug)}/download`,
        manifestUrl: `/api/plugins/${encodeURIComponent(plugin.slug)}/manifest`,
      },
      installation: {
        id: installationId,
        status: "ready",
        installedAt: new Date().toISOString(),
      },
      next_steps: [
        "Download the plugin bundle",
        "Extract to your plugins directory", 
        "Restart your Tensorify instance",
        "The plugin will be available in your node palette"
      ]
    };

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

  } catch (error) {
    console.error("Error installing plugin:", error);
    return NextResponse.json(
      { error: "Failed to install plugin" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// Simple version compatibility check
function isVersionCompatible(userVersion: string, requiredVersion: string): boolean {
  try {
    // Remove 'v' prefix if present
    const normalizeVersion = (v: string) => v.replace(/^v/, "");
    
    const userV = normalizeVersion(userVersion);
    const requiredV = normalizeVersion(requiredVersion);
    
    // Split into major.minor.patch
    const parseVersion = (v: string) => v.split(".").map(n => parseInt(n) || 0);
    
    const [userMajor, userMinor, userPatch] = parseVersion(userV);
    const [reqMajor, reqMinor, reqPatch] = parseVersion(requiredV);
    
    // Major version must match
    if (userMajor !== reqMajor) {
      return false;
    }
    
    // User version must be >= required version for minor/patch
    if (userMinor < reqMinor) {
      return false;
    }
    
    if (userMinor === reqMinor && userPatch < reqPatch) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Version comparison error:", error);
    // If we can't parse versions, assume compatibility
    return true;
  }
} 