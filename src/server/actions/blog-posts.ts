"use server";

import { db } from "@/server/database";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BlogPostStatus, BlogPostType } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { Block } from "@blocknote/core";
import crypto from "crypto";

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
    const { sessionClaims } = await auth();

    const email = sessionClaims?.email;
    if (!email) {
      return { error: "You must be logged in to create a blog post" };
    }

    const adminAccount = await db.adminAccount.findFirst({
      where: { email },
    });

    if (!adminAccount) {
      return { error: "You do not have permission to create blog posts" };
    }

    const validatedData = createBlogPostSchema.parse(data);

    const post = await db.blogPost.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        type: validatedData.type,
        status: validatedData.status,
        content: {},
        authorId: adminAccount.id,
        seo: {
          create: {
            metaTitle: validatedData.title,
            metaDescription: `${validatedData.title} - Learn more about this topic`,
            ogTitle: validatedData.title,
            twitterTitle: validatedData.title,
          },
        },
      },
      include: {
        tags: true,
        author: true,
        seo: true,
      },
    });

    revalidatePath("/blog-posts");
    return { post };
  } catch (error) {
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
      where: {
        deletedAt: null, // Only return non-deleted posts
      },
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
      where: {
        slug,
        deletedAt: null, // Only return non-deleted posts
      },
      include: {
        author: true,
        tags: true,
        seo: true,
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

// Add a tag to a blog post
export async function addTagToBlogPost(postId: string, tagName: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update a blog post" };
    }

    // First, create or find the tag
    const tag = await db.blogTag.upsert({
      where: { tag: tagName },
      create: { tag: tagName },
      update: {},
    });

    // Connect the tag to the blog post
    await db.blogPost.update({
      where: { id: postId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
    });

    // Remove revalidatePath since React Query handles cache invalidation client-side
    // revalidatePath("/blog-posts");
    // revalidatePath(`/blog-posts/${postId}`);
    return { success: true, tagId: tag.id };
  } catch (error) {
    console.error("Error adding tag to blog post:", error);
    return { error: "Failed to add tag to blog post" };
  }
}

// Remove a tag from a blog post
export async function removeTagFromBlogPost(postId: string, tagId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update a blog post" };
    }

    // Disconnect the tag from the blog post
    await db.blogPost.update({
      where: { id: postId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });

    // Remove revalidatePath since React Query handles cache invalidation client-side
    // revalidatePath("/blog-posts");
    // revalidatePath(`/blog-posts/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Error removing tag from blog post:", error);
    return { error: "Failed to remove tag from blog post" };
  }
}

// Update blog post title
export async function updateBlogPostTitle(postId: string, title: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update a blog post" };
    }

    const post = await db.blogPost.update({
      where: { id: postId },
      data: {
        title,
        updatedAt: new Date(), // Explicitly update the timestamp
      },
    });

    return { success: true, post };
  } catch (error) {
    console.error("Error updating blog post title:", error);
    return { error: "Failed to update blog post title" };
  }
}

// Update blog post slug
export async function updateBlogPostSlug(postId: string, slug: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update a blog post" };
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return {
        error: "Slug must contain only lowercase letters, numbers, and hyphens",
      };
    }

    const post = await db.blogPost.update({
      where: { id: postId },
      data: {
        slug,
        updatedAt: new Date(),
      },
    });

    return { success: true, post };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { error: "A blog post with this slug already exists" };
    }
    console.error("Error updating blog post slug:", error);
    return { error: "Failed to update blog post slug" };
  }
}

// Search tags
export async function searchTags(query: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to search tags" };
    }

    const normalizedQuery = query.toLowerCase().trim();

    const tags = await db.blogTag.findMany({
      where: {
        tag: {
          contains: normalizedQuery,
          mode: "insensitive",
        },
      },
      orderBy: {
        tag: "asc",
      },
      take: 10,
    });

    return { tags };
  } catch (error) {
    console.error("Error searching tags:", error);
    return { error: "Failed to search tags" };
  }
}

// Update blog post content
export async function updateBlogPostContent(
  postId: string,
  content: { blocks: Block[] }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update blog post content" };
    }

    const post = await db.blogPost.update({
      where: { id: postId },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return { success: true, post };
  } catch (error) {
    console.error("Error updating blog post content:", error);
    return { error: "Failed to update blog post content" };
  }
}

// Define interface for SEO data
interface BlogSeoData {
  // Basic Metadata
  metaTitle?: string;
  metaDescription?: string;
  metaRobots?: string;
  keywords?: string;
  canonicalUrl?: string;
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  ogSiteName?: string;
  // Twitter Card
  twitterCardType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  // Structured Data
  blogpostingHeadline?: string;
  blogpostingDescription?: string;
  blogpostingAuthorName?: string;
  blogpostingAuthorUrl?: string;
  blogpostingPublisherName?: string;
  blogpostingPublisherLogo?: string;
  blogpostingKeywords?: string;
  blogpostingFeaturedImage?: string;
  mainEntityOfPage?: string;
  // FAQ Section
  faqEnabled?: boolean;
  faqData?: {
    questions: {
      questionName: string;
      acceptedAnswerText: string;
    }[];
  };
  // Additional
  favicon?: string;
  language?: string;
}

// Update blog post SEO
export async function updateBlogPostSeo(postId: string, seoData: BlogSeoData) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update SEO settings" };
    }

    // Ensure faqData has a valid structure if it's enabled but data is undefined
    const processedFaqData = seoData.faqEnabled
      ? seoData.faqData || { questions: [] }
      : { questions: [] };

    // Check if SEO record already exists
    const existingSeo = await db.blogSeo.findUnique({
      where: { blogPostId: postId },
    });

    let seo;

    if (existingSeo) {
      // Update existing SEO record
      seo = await db.blogSeo.update({
        where: { id: existingSeo.id },
        data: {
          // Basic Metadata
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          metaRobots: seoData.metaRobots,
          keywords: seoData.keywords,
          canonicalUrl: seoData.canonicalUrl,
          // Open Graph
          ogTitle: seoData.ogTitle,
          ogDescription: seoData.ogDescription,
          ogImage: seoData.ogImage,
          ogUrl: seoData.ogUrl,
          ogType: seoData.ogType,
          ogSiteName: seoData.ogSiteName,
          // Twitter Card
          twitterCardType: seoData.twitterCardType,
          twitterTitle: seoData.twitterTitle,
          twitterDescription: seoData.twitterDescription,
          twitterImage: seoData.twitterImage,
          twitterSite: seoData.twitterSite,
          // Structured Data
          blogpostingHeadline: seoData.blogpostingHeadline,
          blogpostingDescription: seoData.blogpostingDescription,
          blogpostingAuthorName: seoData.blogpostingAuthorName,
          blogpostingAuthorUrl: seoData.blogpostingAuthorUrl,
          blogpostingPublisherName: seoData.blogpostingPublisherName,
          blogpostingPublisherLogo: seoData.blogpostingPublisherLogo,
          blogpostingKeywords: seoData.blogpostingKeywords,
          blogpostingFeaturedImage: seoData.blogpostingFeaturedImage,
          mainEntityOfPage: seoData.mainEntityOfPage,
          // FAQ Section
          faqEnabled: seoData.faqEnabled,
          faqData: processedFaqData,
          // Additional
          favicon: seoData.favicon,
          language: seoData.language,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new SEO record
      seo = await db.blogSeo.create({
        data: {
          // Basic Metadata
          metaTitle: seoData.metaTitle,
          metaDescription: seoData.metaDescription,
          metaRobots: seoData.metaRobots,
          keywords: seoData.keywords,
          canonicalUrl: seoData.canonicalUrl,
          // Open Graph
          ogTitle: seoData.ogTitle,
          ogDescription: seoData.ogDescription,
          ogImage: seoData.ogImage,
          ogUrl: seoData.ogUrl,
          ogType: seoData.ogType,
          ogSiteName: seoData.ogSiteName,
          // Twitter Card
          twitterCardType: seoData.twitterCardType,
          twitterTitle: seoData.twitterTitle,
          twitterDescription: seoData.twitterDescription,
          twitterImage: seoData.twitterImage,
          twitterSite: seoData.twitterSite,
          // Structured Data
          blogpostingHeadline: seoData.blogpostingHeadline,
          blogpostingDescription: seoData.blogpostingDescription,
          blogpostingAuthorName: seoData.blogpostingAuthorName,
          blogpostingAuthorUrl: seoData.blogpostingAuthorUrl,
          blogpostingPublisherName: seoData.blogpostingPublisherName,
          blogpostingPublisherLogo: seoData.blogpostingPublisherLogo,
          blogpostingKeywords: seoData.blogpostingKeywords,
          blogpostingFeaturedImage: seoData.blogpostingFeaturedImage,
          mainEntityOfPage: seoData.mainEntityOfPage,
          // FAQ Section
          faqEnabled: seoData.faqEnabled,
          faqData: processedFaqData,
          // Additional
          favicon: seoData.favicon,
          language: seoData.language,
          // Relation
          blogPostId: postId,
        },
      });
    }

    // Also update the blog post's updatedAt timestamp
    await db.blogPost.update({
      where: { id: postId },
      data: { updatedAt: new Date() },
    });

    return { success: true, seo };
  } catch (error) {
    console.error("Error updating blog post SEO:", error);
    return { error: "Failed to update SEO settings" };
  }
}

// Update blog post publish status
export async function updateBlogPostPublishStatus(
  postId: string,
  status: "DRAFT" | "PUBLISHED"
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to update a blog post status" };
    }

    const post = await db.blogPost.update({
      where: { id: postId },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return { success: true, post };
  } catch (error) {
    console.error("Error updating blog post publish status:", error);
    return { error: "Failed to update blog post status" };
  }
}

// Delete a blog post (soft delete)
export async function deleteBlogPost(postId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "You must be logged in to delete a blog post" };
    }

    // Generate a random UUID to replace the slug
    const randomUuid = crypto.randomUUID();

    // Save the original slug before updating
    const existingPost = await db.blogPost.findUnique({
      where: { id: postId },
      select: { slug: true, content: true },
    });

    if (!existingPost) {
      return { error: "Blog post not found" };
    }

    // Prepare the content object with the original slug info
    const updatedContent = {
      ...(typeof existingPost.content === "object"
        ? (existingPost.content as object)
        : {}),
      _deletion: {
        originalSlug: existingPost.slug,
        deletedAt: new Date().toISOString(),
      },
    };

    // Perform a soft delete by setting the deletedAt field and changing the slug to a UUID
    const post = await db.blogPost.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        slug: `deleted-${randomUuid}`, // Prefix with 'deleted-' for clarity
        content: updatedContent,
      },
    });

    return { success: true, post };
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return { error: "Failed to delete blog post" };
  }
}
