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

  // Prepare FAQ data for JSON-LD if available
  const hasFaq = Boolean(blog.seo?.faqEnabled && blog.seo?.faqData && blog.seo?.faqData.questions && blog.seo?.faqData.questions.length > 0);
  
  // Process FAQ questions into the format expected by FAQPageJsonLd
  const faqQuestions = hasFaq && blog.seo?.faqData?.questions 
    ? blog.seo.faqData.questions.map((question) => ({
        questionName: question.questionName,
        acceptedAnswerText: question.acceptedAnswerText,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background pt-[70px] sm:pt-[80px]">
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

      {/* JSON-LD for FAQ if available */}
      {hasFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqQuestions.map(question => ({
                "@type": "Question",
                "name": question.questionName,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": question.acceptedAnswerText
                }
              }))
            })
          }}
        />
      )}

      <div className="fixed top-0 left-0 z-50">
        <PageScrollProgressBar
          height="4px"
          bgColor="transparent"
          color="#7F22FF"
        />
      </div>

      <div className="relative lg:flex lg:gap-12 max-w-[1200px] mx-auto">
        {/* Main content area */}
        <div className="flex-1 w-full max-w-[900px] mx-auto px-5 sm:px-8 py-8 sm:py-12">
          <article>
            <div className="space-y-6 sm:space-y-8"> {/* Increased spacing between article sections */}
              {/* Article Type, Date, and Reading Time */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">{blog.type || "Article"}</span>
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

              <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-bold tracking-[-0.02em] sm:tracking-[-0.05em] leading-[1.2] text-zinc-800 dark:text-zinc-50 animate-fade-in mb-6">
                {blog.title}
              </h1>

              {/* Author section - enhanced */}
              <div className="flex items-center gap-4 pt-2 sm:pt-3 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-zinc-100 dark:ring-zinc-800 rounded-full">
                  <Image
                    src={authorPicture}
                    alt={authorName}
                    className="rounded-full object-cover"
                    fill
                    sizes="(max-width: 640px) 48px, 56px"
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
              <div className="block xl:hidden mt-8 mb-8 p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                <h4 className="text-base font-semibold mb-4">Table of Contents</h4>
                <TableOfContents blocks={blocksForTOC} />
              </div>

              {/* Main content */}
              <div className="prose-headings:scroll-mt-[100px] prose-p:my-6 prose-headings:mt-10 prose-headings:mb-6 prose-h2:pt-4 prose-h2:border-t prose-h2:border-zinc-100 dark:prose-h2:border-zinc-800 prose-ul:my-6 prose-ol:my-6 prose-li:mb-2">
                <Editor initialContent={blocksForEditor} />
              </div>

              {/* Tags if available */}
              {tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-sm font-medium mb-3 text-zinc-500 dark:text-zinc-400">RELATED TOPICS</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <a
                        key={index}
                        href={`/blog/tag/${tag}`}
                        className="text-sm px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Desktop Table of Contents - positioned normally in the sidebar */}
        <div className="hidden xl:block xl:w-[280px] xl:mt-12 xl:sticky xl:top-[100px] xl:h-fit">
            <TableOfContents blocks={blocksForTOC} />
          
        </div>
      </div>
    </div>
  );
}