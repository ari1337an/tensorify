"use client";
import { Navbar } from "../navbar";

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
