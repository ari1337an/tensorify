"use client";

import React from "react";
import { Button } from "@/app/_components/ui/button";
import { Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

// Sample data - replace with your actual data source
const blogPosts = [
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

export default function BlogPostsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Post
        </Button>
      </div>

      <DataTable columns={columns} data={blogPosts} />
    </div>
  );
}
