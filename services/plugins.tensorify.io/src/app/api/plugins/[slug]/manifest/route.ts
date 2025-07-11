import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getPluginBySlug } from "@/server/actions/plugin-actions";

const s3 = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Get plugin details from database
    const plugin = await getPluginBySlug(decodedSlug);
    if (!plugin) {
      return NextResponse.json(
        { error: "Plugin not found" },
        { status: 404 }
      );
    }

    // Check if plugin is published
    if (plugin.processingStatus !== "published") {
      return NextResponse.json(
        { error: "Plugin is not published" },
        { status: 400 }
      );
    }

    // Check permissions for private plugins
    if (!plugin.isPublic) {
      if (!userId || plugin.authorId !== userId) {
        return NextResponse.json(
          { error: "Access denied to private plugin" },
          { status: 403 }
        );
      }
    }

    // Try to get plugin.json manifest from S3
    let manifestData = null;
    try {
      const manifestCommand = new GetObjectCommand({
        Bucket: "plugins.tensorify.io",
        Key: `${decodedSlug}/plugin.json`,
      });

      const manifestResponse = await s3.send(manifestCommand);
      const manifestContent = await manifestResponse.Body?.transformToString();
      
      if (manifestContent) {
        manifestData = JSON.parse(manifestContent);
      }
    } catch {
      console.log("No plugin.json found, using database metadata");
      // Error is logged but not used further - this is intentional
    }

    // List all files for this plugin in S3
    const listCommand = new ListObjectsV2Command({
      Bucket: "plugins.tensorify.io",
      Prefix: `${decodedSlug}/`,
    });

    const listResponse = await s3.send(listCommand);
    const files = listResponse.Contents?.map(file => ({
      path: file.Key?.replace(`${decodedSlug}/`, "") || "",
      size: file.Size || 0,
      lastModified: file.LastModified?.toISOString(),
    })).filter(file => file.path) || [];

    // Build manifest response
    const manifest = {
      // Core plugin information
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      slug: plugin.slug,
      author: plugin.authorName,
      
      // Technical information
      tensorifyVersion: plugin.tensorifyVersion,
      status: plugin.status,
      githubUrl: plugin.githubUrl,
      
      // Categorization
      tags: plugin.tags ? plugin.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      
      // Permissions and visibility
      isPublic: plugin.isPublic,
      
      // File structure
      files: files,
      
      // Timestamps
      createdAt: plugin.createdAt.toISOString(),
      updatedAt: plugin.updatedAt.toISOString(),
      
      // Additional manifest data from plugin.json if available
      ...(manifestData || {}),
      
      // Dependencies (extract from manifest or default structure)
      dependencies: manifestData?.dependencies || {},
      devDependencies: manifestData?.devDependencies || {},
      
      // Entry points
      main: manifestData?.main || "index.js",
      types: manifestData?.types || "index.d.ts",
      
      // Plugin-specific metadata
      nodes: manifestData?.nodes || [],
      category: manifestData?.category || "utility",
      
      // Compatibility
      engines: manifestData?.engines || {
        tensorify: `^${plugin.tensorifyVersion}`
      },
    };

    return NextResponse.json(manifest, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error("Error getting plugin manifest:", error);
    return NextResponse.json(
      { error: "Failed to get plugin manifest" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
} 