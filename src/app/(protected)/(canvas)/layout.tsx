"use client";

import React from "react";

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
