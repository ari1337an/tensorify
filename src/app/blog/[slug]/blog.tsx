"use client";

import Image from "next/image";
import { BlogPost } from "./types";
import { Editor } from "./_visuals/dynamic-editor";
import { format } from "timeago.js";
import { TableOfContents } from "./_visuals/TableOfContents";
import PageScrollProgressBar from "react-page-scroll-progress-bar";
import { Block as BlockNoteBlock } from "@blocknote/core";
import { ArticleJsonLd, BreadcrumbJsonLd } from "next-seo";

interface BlogProps {
  blog: BlogPost;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBlock = any;

export default function ClientBlog({ blog }: BlogProps) {
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Calculate reading time based on word count (150 wpm)
  const wordCount = blog.content.blocks.reduce((count: number, block) => {
    if (block.content) {
      const content = block.content as Array<{ text?: string }>;
      return (
        count +
        content.reduce((blockCount: number, item) => {
          return blockCount + (item.text?.split(/\s+/).length || 0);
        }, 0)
      );
    }
    return count;
  }, 0);

  const readingTime = Math.max(1, Math.ceil(wordCount / 150));

  // Cast blocks to appropriate types for each component
  const blocksForEditor = blog.content.blocks as BlockNoteBlock[];
  const blocksForTOC = blog.content.blocks as AnyBlock[];

  // Parse published date for JSON-LD
  const publishedDate = new Date(blog.createdAt).toISOString();
  // Parse modified date for JSON-LD (use published date if not available)
  const modifiedDate = blog.updatedAt
    ? new Date(blog.updatedAt).toISOString()
    : publishedDate;

  // Extract plain text description from first content block if available (limit to ~200 chars)
  let description =
    (blog.seo && blog.seo.metaDescription) || `Article about ${blog.title}`;
  if (
    !description &&
    blog.content.blocks.length > 0 &&
    blog.content.blocks[0].content
  ) {
    const firstBlock = blog.content.blocks[0].content as Array<{
      text?: string;
    }>;
    const text = firstBlock.map((item) => item.text || "").join(" ");
    if (text.length > 0) {
      description = text.substring(0, 200) + (text.length > 200 ? "..." : "");
    }
  }

  // Prepare image URLs for JSON-LD
  const images = [];
  if (blog.seo?.ogImage) {
    images.push(blog.seo.ogImage);
  }
  if (blog.author?.picture) {
    images.push(blog.author.picture);
  }
  if (images.length === 0) {
    images.push("https://tensorify.io/logo.png"); // Fallback image
  }

  // Prepare canonical URL
  const canonicalUrl =
    blog.seo?.canonicalUrl || `https://tensorify.io/blog/${blog.slug || ""}`;

  // Ensure tags is always an array
  const tags = Array.isArray(blog.tags) ? blog.tags : [];

  // Ensure all necessary author fields exist
  const authorName = blog.author?.name || "Tensorify Author";
  const authorUrl = blog.author?.profileLink || "https://tensorify.io";
  const authorPicture = blog.author?.picture || "https://tensorify.io/logo.png";
  const authorDesignation = blog.author?.designation || "";

  return (
    <div className="min-h-screen bg-background pt-[50px] sm:pt-[60px]">
      {/* JSON-LD for Article */}
      <ArticleJsonLd
        useAppDir={true}
        type="BlogPosting"
        headline={
          blog.seo?.blogpostingHeadline || blog.title || "Tensorify Blog"
        }
        description={blog.seo?.blogpostingDescription || description}
        images={images}
        authorName={[
          {
            name: authorName,
            url: authorUrl,
          },
        ]}
        publisherType="Organization"
        publisherName="Tensorify.io"
        publisherLogo="https://tensorify.io/tensorify-logo-only.svg"
        publisherUrl="https://tensorify.io"
        datePublished={publishedDate}
        dateModified={modifiedDate}
        title={blog.seo?.ogTitle || blog.title || "Tensorify Blog"}
        isAccessibleForFree={true}
        section={blog.type || "Article"}
        tags={tags}
        mainEntityOfPage={canonicalUrl}
        keywords={
          blog.seo?.blogpostingKeywords ||
          tags.join(", ") ||
          "AI, Machine Learning"
        }
        url={canonicalUrl}
      />

      {/* JSON-LD for Breadcrumb */}
      <BreadcrumbJsonLd
        useAppDir={true}
        itemListElements={[
          {
            position: 1,
            name: "Home",
            item: "https://tensorify.io",
          },
          {
            position: 2,
            name: "Blog",
            item: "https://tensorify.io/blog",
          },
          {
            position: 3,
            name: blog.title || "Blog Post",
            item: canonicalUrl,
          },
        ]}
      />

      <div className="fixed top-0 left-0 z-50">
        <PageScrollProgressBar
          height="4px"
          bgColor="transparent"
          color="#7F22FF"
        />
      </div>

      <div className="relative lg:flex lg:gap-8 max-w-[1200px] mx-auto">
        {/* Main content area */}
        <div className="flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-16">
          <article>
            <div className="space-y-3 sm:space-y-4">
              {/* Article Type, Date, and Reading Time */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span>{blog.type || "Article"}</span>
                <span>•</span>
                <span>{formattedDate}</span>
                {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {format(blog.updatedAt)}</span>
                  </>
                )}
                <span>•</span>
                <span>{readingTime} min read</span>
              </div>

              <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-bold tracking-[-0.02em] sm:tracking-[-0.05em] leading-[1.2] text-zinc-800 dark:text-zinc-50 animate-fade-in">
                {blog.title}
              </h1>

              {/* Author section - enhanced */}
              <div className="flex items-center gap-3 pt-1 sm:pt-2">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 ring-2 ring-zinc-100 dark:ring-zinc-800 rounded-full">
                  <Image
                    src={authorPicture}
                    alt={authorName}
                    className="rounded-full object-cover"
                    fill
                    sizes="(max-width: 640px) 40px, 48px"
                  />
                </div>
                <div>
                  <a
                    href={authorUrl}
                    className="font-medium text-[15px] sm:text-base text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  {authorName}
                </a>
                <p className="text-sm sm:text-[15px] text-zinc-500 dark:text-zinc-400">
                  {authorDesignation}
                </p>
              </div>
            </div>

              {/* Mobile Table of Contents - only shown on mobile */}
              <div className="block xl:hidden mt-4 mb-2">
                <h4 className="text-base font-semibold mb-2">Table of Contents</h4>
                <TableOfContents blocks={blocksForTOC} />
              </div>

              {/* Main content */}
              <div className="prose-headings:scroll-mt-[100px]">
                <Editor initialContent={blocksForEditor} />
              </div>
            </div>
          </article>
        </div>

        {/* Desktop Table of Contents - positioned normally in the sidebar */}
        <div className="hidden xl:block xl:w-[250px] xl:mt-10 xl:sticky xl:top-[100px] xl:h-fit">
          <TableOfContents blocks={blocksForTOC} />
        </div>
      </div>
    </div>
  );
}