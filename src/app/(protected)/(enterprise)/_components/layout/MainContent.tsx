"use client";
import { Navbar } from "../navbar";
import { RouteContent } from "./RouteContent";

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <RouteContent />
      </main>
    </div>
  );
}
