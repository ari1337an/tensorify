import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Zod schema for webhook body validation
const pluginWebhookSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
  tensorifyVersion: z.string().optional(),
  version: z.string().optional(),
  releaseTag: z.string().optional(),
  authorName: z.string().optional(),
  authorId: z.string().min(1, "Author ID is required"),
  sha: z.string().optional(),
  isPublic: z.boolean().optional(),
  readme: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = pluginWebhookSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const {
      slug,
      name,
      description,
      githubUrl,
      status,
      tags,
      tensorifyVersion,
      version,
      releaseTag,
      authorName,
      authorId,
      sha,
      isPublic,
      readme,
    } = validationResult.data;

    // Check if plugin already exists
    const existingPlugin = await prisma.plugin.findUnique({
      where: { slug },
    });

    if (existingPlugin) {
      // Update existing plugin
      const updatedPlugin = await prisma.plugin.update({
        where: { slug },
        data: {
          name,
          description: description || existingPlugin.description,
          githubUrl: githubUrl || existingPlugin.githubUrl,
          status: status || existingPlugin.status,
          tags: tags || existingPlugin.tags,
          tensorifyVersion: tensorifyVersion || existingPlugin.tensorifyVersion,
          version: version || existingPlugin.version,
          releaseTag: releaseTag || existingPlugin.releaseTag,
          authorName: authorName || existingPlugin.authorName,
          sha: sha || existingPlugin.sha,
          isPublic: isPublic !== undefined ? isPublic : existingPlugin.isPublic,
          readme: readme || existingPlugin.readme,
          processingStatus: "published",
          processingTitle: "Plugin published successfully",
          processingMessage:
            "This plugin has been published and is available for installation.",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Plugin updated successfully",
        plugin: updatedPlugin,
      });
    } else {
      // Create new plugin
      const newPlugin = await prisma.plugin.create({
        data: {
          slug,
          name,
          description: description || "",
          githubUrl: githubUrl || "",
          status: status || "active",
          tags: tags || null,
          tensorifyVersion: tensorifyVersion || "1.0.0",
          version: version || "1.0.0",
          releaseTag: releaseTag || null,
          authorName: authorName || "Unknown",
          authorId,
          sha: sha || null,
          isPublic: isPublic !== undefined ? isPublic : true,
          readme: readme || null,
          processingStatus: "published",
          processingTitle: "Plugin published successfully",
          processingMessage:
            "This plugin has been published and is available for installation.",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Plugin created successfully",
        plugin: newPlugin,
      });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    endpoint: "plugin-published webhook",
  });
}
