"use client";

import Image from "next/image";
import { BlogPost } from "./types";
import { Editor } from "./_visuals/dynamic-editor";
import { format } from "timeago.js";
import { TableOfContents } from "./_visuals/TableOfContents";
import PageScrollProgressBar from "react-page-scroll-progress-bar";
import { Block as BlockNoteBlock } from "@blocknote/core";

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

  return (
    <div className="min-h-screen bg-background pt-[50px] sm:pt-[60px]">
      <div className="fixed top-0 left-0 z-50">
        <PageScrollProgressBar
          height="4px"
          bgColor="transparent"
          color="#7F22FF"
        />
      </div>
      <div className="relative lg:flex lg:gap-8 max-w-[1200px] mx-auto">
        {/* TableOfContents for desktop - hidden on mobile */}
        <div className="hidden xl:block">
          <TableOfContents blocks={blocksForTOC} />
        </div>

        <article className="flex-1 w-full max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-16">
          <div className="space-y-3 sm:space-y-4">
            {/* Article Type, Date, and Reading Time */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>Article</span>
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

            {/* Title */}
            <h1 className="text-[32px] sm:text-[40px] md:text-[50px] font-bold tracking-[-0.02em] sm:tracking-[-0.05em] leading-[1.2] bg-clip-text text-transparent bg-primary">
              {blog.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 pt-1 sm:pt-2">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <Image
                  src={blog.author.picture}
                  alt={blog.author.name}
                  className="rounded-full object-cover"
                  fill
                  sizes="(max-width: 640px) 40px, 48px"
                />
              </div>
              <div>
                <a
                  href={blog.author.profileLink}
                  className="font-medium text-[15px] sm:text-base text-foreground/90 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {blog.author.name}
                </a>
                <p className="text-sm sm:text-[15px] text-muted-foreground">
                  {blog.author.designation}
                </p>
              </div>
            </div>

            {/* TableOfContents for mobile - shown only on mobile, below author details */}
            <div className="block xl:hidden mt-4 mb-2">
              <TableOfContents blocks={blocksForTOC} />
            </div>

            <div className="prose-headings:scroll-mt-[100px]">
              <Editor initialContent={blocksForEditor} />
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
