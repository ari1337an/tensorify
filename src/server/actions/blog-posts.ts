"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define blog post schema
const blogPostSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  authors: z.array(z.string()),
  status: z.enum(["Published", "Draft"]),
  date: z.string(),
  tags: z.array(z.string()),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

// Get all blog posts
export async function getBlogPosts() {
  try {
    // Mock data for now since there's no BlogPost table in schema
    // In a real implementation, this would be:
    // const posts = await db.blogPost.findMany();

    const posts = [
      {
        id: 1,
        title: "Getting Started with Next.js",
        slug: "getting-started-with-nextjs",
        authors: ["John Doe", "Jane Smith"],
        status: "Published",
        date: "2024-04-18T14:30:00Z",
        tags: ["Next.js", "React", "JavaScript", "Web Development"],
      },
      {
        id: 2,
        title: "Understanding TypeScript",
        slug: "understanding-typescript",
        authors: ["Jane Smith"],
        status: "Draft",
        date: "2024-04-17T10:15:00Z",
        tags: ["TypeScript", "JavaScript", "Programming"],
      },
      {
        id: 3,
        title: "React Best Practices",
        slug: "react-best-practices",
        authors: ["Mike Johnson", "Sarah Williams"],
        status: "Published",
        date: "2024-04-16T16:45:00Z",
        tags: ["React", "JavaScript", "Frontend", "Best Practices"],
      },
      {
        id: 4,
        title: "Building Scalable Web Applications",
        slug: "building-scalable-web-applications",
        authors: ["Sarah Williams"],
        status: "Published",
        date: "2024-04-15T09:20:00Z",
        tags: ["Architecture", "Scalability", "Web Development"],
      },
      {
        id: 5,
        title: "CSS Grid vs Flexbox",
        slug: "css-grid-vs-flexbox",
        authors: ["David Brown"],
        status: "Draft",
        date: "2024-04-14T11:10:00Z",
        tags: ["CSS", "Frontend", "Layout", "Web Design"],
      },
      {
        id: 6,
        title: "State Management in React",
        slug: "state-management-in-react",
        authors: ["Emily Davis", "John Doe"],
        status: "Published",
        date: "2024-04-13T13:25:00Z",
        tags: ["React", "State Management", "Redux", "Context API"],
      },
      {
        id: 7,
        title: "API Design Best Practices",
        slug: "api-design-best-practices",
        authors: ["Robert Wilson"],
        status: "Draft",
        date: "2024-04-12T15:40:00Z",
        tags: ["API", "Backend", "REST", "Best Practices"],
      },
      {
        id: 8,
        title: "Testing React Applications",
        slug: "testing-react-applications",
        authors: ["Lisa Anderson", "Mike Johnson"],
        status: "Published",
        date: "2024-04-11T08:50:00Z",
        tags: ["Testing", "React", "Jest", "Frontend"],
      },
      {
        id: 9,
        title: "Performance Optimization Techniques",
        slug: "performance-optimization-techniques",
        authors: ["James Taylor"],
        status: "Published",
        date: "2024-04-10T12:05:00Z",
        tags: ["Performance", "Optimization", "Web Development"],
      },
      {
        id: 10,
        title: "Deploying to Production",
        slug: "deploying-to-production",
        authors: ["Patricia Martinez", "David Brown"],
        status: "Draft",
        date: "2024-04-09T17:30:00Z",
        tags: ["Deployment", "DevOps", "CI/CD", "Production"],
      },
    ];

    return { posts };
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
    return { error: "Failed to fetch blog posts" };
  }
}

// Get a blog post by ID
export async function getBlogPostById(id: number) {
  try {
    // In a real implementation, this would be:
    // const post = await db.blogPost.findUnique({ where: { id } });

    const allPosts = await getBlogPosts();
    const post = allPosts.posts?.find((post) => post.id === id);

    if (!post) {
      return { error: "Blog post not found" };
    }

    return { post };
  } catch (error) {
    console.error(`Failed to fetch blog post ${id}:`, error);
    return { error: `Failed to fetch blog post ${id}` };
  }
}

// Create a new blog post
export async function createBlogPost(data: BlogPostFormValues) {
  try {
    const validated = blogPostSchema.safeParse(data);

    if (!validated.success) {
      return { error: validated.error.message };
    }

    // In a real implementation, this would be:
    // const post = await db.blogPost.create({ data: validated.data });

    // Mock implementation
    console.log("Created blog post:", validated.data);

    revalidatePath("/blog-posts");
    return { success: true };
  } catch (error) {
    console.error("Failed to create blog post:", error);
    return { error: "Failed to create blog post" };
  }
}

// Update a blog post
export async function updateBlogPost(id: number, data: BlogPostFormValues) {
  try {
    const validated = blogPostSchema.safeParse(data);

    if (!validated.success) {
      return { error: validated.error.message };
    }

    // In a real implementation, this would be:
    // const post = await db.blogPost.update({
    //   where: { id },
    //   data: validated.data,
    // });

    // Mock implementation
    console.log(`Updated blog post ${id}:`, validated.data);

    revalidatePath("/blog-posts");
    return { success: true };
  } catch (error) {
    console.error(`Failed to update blog post ${id}:`, error);
    return { error: `Failed to update blog post ${id}` };
  }
}

// Delete a blog post
export async function deleteBlogPost(id: number) {
  try {
    // In a real implementation, this would be:
    // await db.blogPost.delete({ where: { id } });

    // Mock implementation
    console.log(`Deleted blog post ${id}`);

    revalidatePath("/blog-posts");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete blog post ${id}:`, error);
    return { error: `Failed to delete blog post ${id}` };
  }
}
