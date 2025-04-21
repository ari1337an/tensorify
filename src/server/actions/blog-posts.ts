"use server";

import { db } from "@/server/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BlogPostStatus, BlogPostType } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { getUserEmailFromUserId } from "./user";

// Schema for creating a new blog post
const createBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.nativeEnum(BlogPostType).default(BlogPostType.ARTICLE),
  status: z.nativeEnum(BlogPostStatus).default(BlogPostStatus.DRAFT),
  tags: z.array(z.string()).default([]),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;

// Create a new blog post
export async function createBlogPost(data: CreateBlogPostInput) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to create a blog post" };
    }

    const email = await getUserEmailFromUserId(userId);

    if (!email) {
      return { error: "Could not find email for user" };
    }

    const adminAccount = await db.adminAccount.findFirst({
      where: { email },
    });

    if (!adminAccount) {
      return { error: "You do not have permission to create blog posts" };
    }

    const validatedData = createBlogPostSchema.parse(data);

    // First, create or find the tags
    const tagConnections = await Promise.all(
      validatedData.tags.map(async (tagName) => {
        const tag = await db.blogTag.upsert({
          where: { tag: tagName },
          create: { tag: tagName },
          update: {},
        });
        return { id: tag.id };
      })
    );

    const post = await db.blogPost.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        type: validatedData.type,
        status: validatedData.status,
        content: {},
        authorId: adminAccount.id,
        tags: {
          connect: tagConnections,
        },
      },
      include: {
        tags: true,
        author: true,
      },
    });

    revalidatePath("/blog-posts");
    return { post };
  } catch (error) {
    console.error("Error creating blog post:", error);

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    if (error instanceof Error) {
      // Check for unique constraint violations
      if (error.message.includes("Unique constraint")) {
        return { error: "A blog post with this slug already exists" };
      }
      return { error: error.message };
    }

    return {
      error: "An unexpected error occurred while creating the blog post",
    };
  }
}

// Get all blog posts
export async function getBlogPosts() {
  try {
    const posts = await db.blogPost.findMany({
      include: {
        author: true,
        tags: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { posts };
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return { error: "Failed to fetch blog posts" };
  }
}

// Get a single blog post by slug
export async function getBlogPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: true,
        tags: true,
      },
    });

    if (!post) {
      return { error: "Blog post not found" };
    }

    return { post };
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return { error: "Failed to fetch blog post" };
  }
}
