import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import JSZip from "jszip";
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

    // List all files for this plugin in S3
    const listCommand = new ListObjectsV2Command({
      Bucket: "plugins.tensorify.io",
      Prefix: `${decodedSlug}/`,
    });

    const listResponse = await s3.send(listCommand);
    const files = listResponse.Contents || [];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files found for this plugin" },
        { status: 404 }
      );
    }

    // Create ZIP file
    const zip = new JSZip();

    // Download and add each file to the ZIP
    for (const file of files) {
      if (!file.Key) continue;
      
      const relativePath = file.Key.replace(`${decodedSlug}/`, "");
      if (!relativePath) continue; // Skip the root folder itself

      try {
        const getObjectCommand = new GetObjectCommand({
          Bucket: "plugins.tensorify.io",
          Key: file.Key,
        });

        const response = await s3.send(getObjectCommand);
        const fileContent = await response.Body?.transformToByteArray();
        
        if (fileContent) {
          zip.file(relativePath, fileContent);
        }
      } catch (error) {
        console.error(`Failed to download file ${file.Key}:`, error);
        // Continue with other files instead of failing completely
      }
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    // Return ZIP file as download
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${plugin.name}-${plugin.version}.zip"`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });

  } catch (error) {
    console.error("Error downloading plugin:", error);
    return NextResponse.json(
      { error: "Failed to download plugin" },
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