import React from "react";
import { notFound } from "next/navigation";
import { Blog, BlogsResponse } from "../page";
import { Metadata } from "next";
import { Block as BlockNoteBlock } from "@blocknote/core";
import ClientBlog from "./blog";

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

// Fetch all blogs for static generation
async function getAllBlogs(): Promise<Blog[]> {
  try {
    const response = await fetch("https://controls.tensorify.io/api/blogs");
    const { data }: BlogsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all blog data:", error);
    return [];
  }
}

// Generate static paths for all blogs at build time
export async function generateStaticParams() {
  const blogs = await getAllBlogs();

  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
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

  // Convert blog to BlogPost format expected by ClientBlog component
  const blogPost = {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    type: blog.type,
    status: blog.status,
    content: {
      blocks: blog.content.blocks as unknown as BlockNoteBlock[],
    },
    author: {
      name: blog.author?.name || "Author",
      picture: blog.author?.picture || "/placeholder-avatar.png",
      designation: blog.author?.designation || "",
      profileLink: blog.author?.profileLink || "#",
    },
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    tags: blog.tags || [],
  };

  return <ClientBlog blog={blogPost} />;
}
