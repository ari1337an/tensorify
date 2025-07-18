"use client";

import React from "react";

export default function MediaPage() {
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
}
