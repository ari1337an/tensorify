"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </QueryClientProvider>
  );
}
