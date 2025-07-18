import { NextResponse } from "next/server";
import { db } from "@/server/database";
import { BlogPostStatus } from "@prisma/client";

// Define interfaces for the content structure
interface ContentItem {
  text?: string;
  type?: string;
  styles?: Record<string, unknown>;
}

interface BlockContent {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
  content?: ContentItem[];
  children?: BlockContent[];
}

interface BlogContent {
  blocks?: BlockContent[];
  [key: string]: unknown;
}

export async function GET() {
  try {
    // Fetch only published blogs with selective fields
    // Explicitly ensure deletedAt is null to exclude deleted blogs
    const blogs = await db.blogPost.findMany({
      where: {
        status: BlogPostStatus.PUBLISHED,
        // Ensure deleted blogs are excluded
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        // Include author with specific fields
        author: {
          select: {
            name: true,
            picture: true,
            profileLink: true,
            designation: true,
          },
        },
        // Include SEO data without ID
        seo: {
          select: {
            metaTitle: true,
            metaDescription: true,
            metaRobots: true,
            keywords: true,
            canonicalUrl: true,
            ogTitle: true,
            ogDescription: true,
            ogImage: true,
            ogUrl: true,
            ogType: true,
            ogSiteName: true,
            twitterCardType: true,
            twitterTitle: true,
            twitterDescription: true,
            twitterImage: true,
            twitterSite: true,
            blogpostingHeadline: true,
            blogpostingDescription: true,
            blogpostingAuthorName: true,
            blogpostingAuthorUrl: true,
            blogpostingPublisherName: true,
            blogpostingPublisherLogo: true,
            blogpostingKeywords: true,
            blogpostingFeaturedImage: true,
            mainEntityOfPage: true,
            favicon: true,
            language: true,
            faqEnabled: true,
            faqData: true,
          },
        },
        // Include tags without ID, createdAt, updatedAt
        tags: {
          select: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the tags array and calculate word count
    const transformedBlogs = blogs.map((blog) => {
      // Calculate word count from content blocks
      let wordCount = 0;

      // Check if content exists and has blocks array
      if (blog.content && typeof blog.content === "object") {
        const contentObj = blog.content as BlogContent;
        const blocks = Array.isArray(contentObj.blocks)
          ? contentObj.blocks
          : [];

        // Iterate through each block
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];

          // Check if block has content array with text items
          if (block && Array.isArray(block.content)) {
            // Process each content item in the block
            block.content.forEach((contentItem: ContentItem) => {
              if (contentItem && typeof contentItem.text === "string") {
                // Split text by whitespace and count words
                const text = contentItem.text.trim();
                if (text) {
                  wordCount += text.split(/\s+/).length;
                }
              }
            });
          }
        }
      }

      return {
        ...blog,
        tags: blog.tags.map((tag) => tag.tag),
        wordCount,
      };
    });

    return NextResponse.json({
      status: "ok",
      data: transformedBlogs,
    });
  } catch (error) {
    console.error("Failed to fetch published blogs:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to fetch published blogs" },
      { status: 500 }
    );
  }
}
