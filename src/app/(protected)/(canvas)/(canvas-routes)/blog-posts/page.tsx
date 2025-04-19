"use client";

import React from "react";

export default function BlogPostsPage() {
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
}
