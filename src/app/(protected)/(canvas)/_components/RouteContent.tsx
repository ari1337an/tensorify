"use client";

import React from "react";
import useStore from "@/app/(protected)/(enterprise)/_store/store";
import { CanvasClient } from "@/app/(protected)/(canvas)/_components/CanvasClient";
import { NotFound } from "@/app/(protected)/(enterprise)/_components/layout/NotFound";

// Blog Posts Component
const BlogPostsContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sample blog post cards */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-40 bg-gray-200 rounded-md mb-3"></div>
            <h3 className="font-medium text-lg mb-2">Sample Blog Post {i}</h3>
            <p className="text-gray-600 text-sm mb-3">
              This is a sample blog post description that would appear in the
              card.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Published: {new Date().toLocaleDateString()}
              </span>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Pages Component
const PagesContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pages</h1>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h3 className="font-medium">Page {i}</h3>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                View
              </button>
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Media Component
const MediaContent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Media Library</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="border rounded-lg p-2 aspect-square flex items-center justify-center bg-gray-100"
          >
            <div className="text-gray-400">Image {i}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Component
const DashboardContent = () => {
  return <CanvasClient />;
};

// Default Component for other routes
const DefaultContent = () => {
  return <NotFound />;
};

export function RouteContent() {
  const currentRoute = useStore((state) => state.currentRoute);

  // Render different content based on the current route
  const renderContent = () => {
    switch (currentRoute) {
      case "Dashboard":
        return <DashboardContent />;
      case "Blog Posts":
        return <BlogPostsContent />;
      case "Pages":
        return <PagesContent />;
      case "Media":
        return <MediaContent />;
      default:
        return <DefaultContent />;
    }
  };

  return <div className="h-full overflow-auto">{renderContent()}</div>;
}
