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
    author: "John Doe",
    status: "Published",
    date: "2024-04-18",
  },
  {
    id: 2,
    title: "Understanding TypeScript",
    author: "Jane Smith",
    status: "Draft",
    date: "2024-04-17",
  },
  {
    id: 3,
    title: "React Best Practices",
    author: "Mike Johnson",
    status: "Published",
    date: "2024-04-16",
  },
  {
    id: 4,
    title: "Building Scalable Web Applications",
    author: "Sarah Williams",
    status: "Published",
    date: "2024-04-15",
  },
  {
    id: 5,
    title: "CSS Grid vs Flexbox",
    author: "David Brown",
    status: "Draft",
    date: "2024-04-14",
  },
  {
    id: 6,
    title: "State Management in React",
    author: "Emily Davis",
    status: "Published",
    date: "2024-04-13",
  },
  {
    id: 7,
    title: "API Design Best Practices",
    author: "Robert Wilson",
    status: "Draft",
    date: "2024-04-12",
  },
  {
    id: 8,
    title: "Testing React Applications",
    author: "Lisa Anderson",
    status: "Published",
    date: "2024-04-11",
  },
  {
    id: 9,
    title: "Performance Optimization Techniques",
    author: "James Taylor",
    status: "Published",
    date: "2024-04-10",
  },
  {
    id: 10,
    title: "Deploying to Production",
    author: "Patricia Martinez",
    status: "Draft",
    date: "2024-04-09",
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
