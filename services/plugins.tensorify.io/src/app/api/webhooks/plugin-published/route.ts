import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import db from "@/server/database/db";

// Zod schema for webhook body validation
const pluginWebhookSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  githubUrl: z.string().url("Invalid GitHub URL").optional(),
  status: z.string().optional(),
  tags: z.string().optional(),
  sdkVersion: z.string().optional(),
  version: z.string().optional(),
  author: z.string(),
  authorId: z.string().min(1, "Author ID is required"),
  isPublic: z.boolean().optional(),
  readme: z.string().optional(),
  pluginType: z.string().optional(), // Added plugin type from SDK NodeType enum
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = pluginWebhookSchema.safeParse(body.data);

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

    // If user is not in the database, insert him
    const user = await db.user.findUnique({
      where: { id: validationResult.data.authorId },
    });
    if (!user) {
      await db.user.create({
        data: {
          id: validationResult.data.authorId,
          username: validationResult.data.author,
        },
      });
    }

    // Now Add a row in the database for this plugin
    const {
      slug,
      name,
      description,
      githubUrl,
      status,
      tags,
      sdkVersion,
      version,
      author,
      authorId,
      isPublic,
      readme,
      pluginType,
    } = validationResult.data;

    // Check if plugin already exists
    const existingPlugin = await db.plugin.findUnique({
      where: { slug },
    });

    if (!existingPlugin) {
      // Create new plugin
      const newPlugin = await db.plugin.create({
        data: {
          slug,
          name,
          description: description || "",
          githubUrl: githubUrl || "",
          status: status || "active",
          tags: tags || null,
          sdkVersion: sdkVersion || "1.0.0",
          version: version || "1.0.0",
          authorName: author || "Unknown",
          authorId,
          isPublic: isPublic !== undefined ? isPublic : true,
          readme: readme || null,
          pluginType: pluginType || "miscellaneous",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Plugin created successfully",
        plugin: newPlugin,
      });
    }
    // If the plugin already exists, update it
    else {
      return NextResponse.json(
        {
          error: `Plugin ${slug} already exists. If you are trying to publish another version of the plugin, try running "npm version patch" before publishing again.`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for health check
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    endpoint: "plugin-published webhook",
  });
}
