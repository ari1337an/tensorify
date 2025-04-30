// app/server-sitemap.xml/route.ts
import { getServerSideSitemap } from "next-sitemap";
import { BlogsResponse } from "../blog/page";
import type { ISitemapField } from "next-sitemap";

export async function GET() {
  // Fetch blogs from API
  let sitemapEntries: ISitemapField[] = [
    {
      loc: "https://tensorify.io",
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 1.0,
    },
    {
      loc: "https://tensorify.io/blog",
      lastmod: new Date().toISOString(),
      changefreq: "daily",
      priority: 0.8,
    },
  ];

  try {
    // Fetch blog data from API
    const response = await fetch("https://controls.tensorify.io/api/blogs");
    const { data }: BlogsResponse = await response.json();

    // Add each blog post to sitemap entries
    const blogEntries = data.map(
      (blog) =>
        ({
          loc: `https://tensorify.io/blog/${blog.slug}`,
          lastmod: new Date(blog.updatedAt).toISOString(),
          changefreq: "weekly",
          priority: 0.7,
        } as ISitemapField)
    );

    sitemapEntries = [...sitemapEntries, ...blogEntries];
  } catch (error) {
    console.error("Error fetching blog data for sitemap:", error);
  }

  return getServerSideSitemap(sitemapEntries);
}
