"use client";

import React from "react";

export default function PagesPage() {
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
}
