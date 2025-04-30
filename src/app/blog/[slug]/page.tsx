import React from "react";
import { notFound } from "next/navigation";
import { Blog, BlogsResponse } from "../page";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";

async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const response = await fetch("https://controls.tensorify.io/api/blogs");
    const { data }: BlogsResponse = await response.json();
    const blog = data.find((blog) => blog.slug === slug);
    return blog || null;
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  // Handle case where seo might be null
  if (!blog.seo) {
    return {
      title: blog.title,
      description: `Read our article on ${blog.title}`,
      openGraph: {
        title: blog.title,
        description: `Read our article on ${blog.title}`,
        type: "article",
      },
    };
  }

  return {
    title: blog.seo.metaTitle || blog.title,
    description:
      blog.seo.metaDescription || `Read our article on ${blog.title}`,
    keywords: blog.seo.keywords || "",
    openGraph: {
      title: blog.seo.ogTitle || blog.title,
      description:
        blog.seo.ogDescription || `Read our article on ${blog.title}`,
      url: blog.seo.ogUrl || "",
      siteName: blog.seo.ogSiteName || "Tensorify",
      images: blog.seo.ogImage ? [{ url: blog.seo.ogImage }] : undefined,
      type: (blog.seo.ogType || "article") as "website" | "article",
    },
    twitter: {
      card: (blog.seo.twitterCardType || "summary_large_image") as
        | "summary"
        | "summary_large_image"
        | "app"
        | "player",
      title: blog.seo.twitterTitle || blog.title,
      description:
        blog.seo.twitterDescription || `Read our article on ${blog.title}`,
      images: blog.seo.twitterImage ? [blog.seo.twitterImage] : undefined,
    },
    robots: blog.seo.metaRobots || "index, follow",
    alternates: {
      canonical: blog.seo.canonicalUrl || "",
    },
  };
}

// Define the content item type
interface ContentItem {
  text?: string;
  type?: string;
  styles?: Record<string, boolean>;
  href?: string;
  content?: ContentItem[];
}

// Safely render paragraph content
function renderParagraph(content: ContentItem[]): React.ReactNode {
  return content.map((item, index) => {
    if (item.href && typeof item.href === "string") {
      return (
        <a
          key={index}
          href={item.href}
          className="text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.text || ""}
        </a>
      );
    }

    const styles = item.styles || {};
    return (
      <span
        key={index}
        className={`
          ${styles.bold ? "font-bold" : ""}
          ${styles.italic ? "italic" : ""}
          ${styles.underline ? "underline" : ""}
        `}
      >
        {item.text || ""}
      </span>
    );
  });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/blog"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back to all blogs
      </Link>

      <article className="bg-gray-900 rounded-xl p-6 sm:p-8 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          {blog.title}
        </h1>

        <div className="flex items-center mb-8 border-b border-gray-800 pb-6">
          {blog.author?.picture ? (
            <div className="relative w-12 h-12 mr-4 rounded-full overflow-hidden">
              <Image
                src={blog.author.picture}
                alt={blog.author?.name || "Author"}
                fill
                className="object-cover rounded-full"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full mr-4 bg-gray-700 flex items-center justify-center">
              <span className="text-gray-300">A</span>
            </div>
          )}
          <div>
            <div className="font-medium text-white">
              {blog.author?.name || "Author"}
            </div>
            <div className="text-gray-400 text-sm">
              {blog.author?.designation || ""}
            </div>
            <div className="text-gray-400 text-sm mt-1">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <div className="prose prose-invert lg:prose-xl max-w-none">
          {blog.content?.blocks?.map((block, blockIndex) => {
            switch (block.type) {
              case "paragraph":
                return (
                  <p key={blockIndex} className="text-gray-300 mb-4">
                    {block.content && Array.isArray(block.content)
                      ? renderParagraph(block.content)
                      : null}
                  </p>
                );
              case "heading":
                const level =
                  typeof block.props?.level === "number"
                    ? block.props.level
                    : 2;
                const headingContent =
                  block.content && Array.isArray(block.content)
                    ? block.content.map((item) => item.text || "").join(" ")
                    : "";

                switch (level) {
                  case 1:
                    return (
                      <h1
                        key={blockIndex}
                        className="text-3xl font-bold my-4 text-white"
                      >
                        {headingContent}
                      </h1>
                    );
                  case 2:
                    return (
                      <h2
                        key={blockIndex}
                        className="text-2xl font-bold my-4 text-white"
                      >
                        {headingContent}
                      </h2>
                    );
                  case 3:
                    return (
                      <h3
                        key={blockIndex}
                        className="text-xl font-bold my-4 text-white"
                      >
                        {headingContent}
                      </h3>
                    );
                  case 4:
                    return (
                      <h4
                        key={blockIndex}
                        className="text-lg font-bold my-4 text-white"
                      >
                        {headingContent}
                      </h4>
                    );
                  case 5:
                    return (
                      <h5
                        key={blockIndex}
                        className="text-base font-bold my-4 text-white"
                      >
                        {headingContent}
                      </h5>
                    );
                  default:
                    return (
                      <h6
                        key={blockIndex}
                        className="text-sm font-bold my-4 text-white"
                      >
                        {headingContent}
                      </h6>
                    );
                }

              case "image":
                const imgUrl =
                  typeof block.props?.url === "string" ? block.props.url : "";
                const imgCaption =
                  typeof block.props?.caption === "string"
                    ? block.props.caption
                    : "";

                return (
                  <figure key={blockIndex} className="my-6">
                    {imgUrl && (
                      <div className="relative aspect-video w-full">
                        <Image
                          src={imgUrl}
                          alt={imgCaption || blog.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    {imgCaption && (
                      <figcaption className="text-sm text-gray-400 mt-2 text-center">
                        {imgCaption}
                      </figcaption>
                    )}
                  </figure>
                );

              case "bulletListItem":
                return (
                  <li
                    key={blockIndex}
                    className="ml-6 list-disc mb-2 text-gray-300"
                  >
                    {block.content && Array.isArray(block.content)
                      ? block.content.map((item, itemIndex) => (
                          <span key={itemIndex}>{item.text || ""}</span>
                        ))
                      : null}
                  </li>
                );

              default:
                return null;
            }
          })}
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-800 flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-800 text-gray-200 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
