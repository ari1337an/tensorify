import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
// Define metadata for the blog listing page
export const metadata: Metadata = {
  title: "Blog | Tensorify.io",
  description:
    "Explore the latest articles and insights about AI, machine learning, and development from Tensorify.io",
  openGraph: {
    title: "Blog | Tensorify.io",
    description:
      "Explore the latest articles and insights about AI, machine learning, and development from Tensorify.io",
    type: "website",
  },
};

interface ContentBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children: ContentBlock[];
  content?: Array<{
    text?: string;
    type?: string;
    styles?: Record<string, boolean>;
    href?: string;
    content?: Array<{
      text?: string;
      type?: string;
      styles?: Record<string, boolean>;
    }>;
  }>;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  content: {
    blocks: ContentBlock[];
  };
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    picture: string;
    profileLink: string;
    designation: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaRobots: string;
    keywords: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
    ogType: string;
    ogSiteName: string;
    twitterCardType: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    twitterSite: string;
    blogpostingHeadline: string;
    blogpostingDescription: string;
    blogpostingAuthorName: string;
    blogpostingAuthorUrl: string;
    blogpostingPublisherName: string;
    blogpostingPublisherLogo: string;
    blogpostingKeywords: string;
    blogpostingFeaturedImage: string;
    mainEntityOfPage: string;
    favicon: string;
    language: string;
  };
  tags: string[];
  wordCount: number;
}

export interface BlogsResponse {
  status: string;
  data: Blog[];
}

// Make this page static with no revalidation (fully static)
export const dynamic = "force-static";

async function getBlogs(): Promise<Blog[]> {
  try {
    const response = await fetch("https://controls.tensorify.io/api/blogs", {
      cache: "force-cache", // Use the cached version from build time
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const { data }: BlogsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

// Enable static generation for blog pages
export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function Blog() {
  const blogs = await getBlogs();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Latest Insights & Articles
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Explore cutting-edge research, tutorials, and perspectives on AI,
            machine learning, and development from our expert team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => {
            const imageUrl =
              !blog.seo || !blog.seo.ogImage || blog.seo.ogImage === ""
                ? "https://placehold.co/600x400?text=ogImage"
                : blog.seo.ogImage;

            // Format date for better display
            const publishDate = new Date(blog.createdAt).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              }
            );

            return (
              <Link href={`/blog/${blog.slug}`} key={blog.id} className="group">
                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300 h-full flex flex-col border border-gray-800">
                  <div className="aspect-video overflow-hidden relative">
                    <Image
                      src={imageUrl}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-900/40 text-purple-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="text-xl font-bold leading-tight mb-3 text-white group-hover:text-purple-400 transition-colors duration-200">
                      {blog.title}
                    </h2>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {blog.seo?.metaDescription ||
                        `Read our latest article on ${blog.title}`}
                    </p>

                    <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between">
                      <div className="flex items-center">
                        {blog.author?.picture && (
                          <div className="relative w-8 h-8 rounded-full mr-3 border-2 border-gray-800 shadow-sm overflow-hidden">
                            <Image
                              src={blog.author.picture}
                              alt={blog.author?.name || "Author"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-300">
                            {blog.author?.name || "Tensorify Team"}
                          </p>
                          <p className="text-xs text-gray-500">{publishDate}</p>
                        </div>
                      </div>

                      <span className="text-purple-400 group-hover:translate-x-1 transition-transform duration-200">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {blogs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-gray-400">
              No blog posts available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </>
  );
}
