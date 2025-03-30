"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Navbar } from "./Navbar";
import { Sidebar, SidebarProvider, useSidebar } from "./Sidebar";
import { WorkflowCanvas } from "./WorkflowCanvas";

const queryClient = new QueryClient();

// Main app content with navbar and workflow canvas
function MainContent() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <WorkflowCanvas />
      </main>
    </div>
  );
}

// Layout component that handles the sidebar and main content arrangement
function AppLayout() {
  const { isOpen, sidebarWidth } = useSidebar();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar className="absolute h-screen z-10" />

      {/* Main content that gets pushed right */}
      <motion.div
        className="flex-1 w-full h-screen overflow-hidden"
        animate={{
          marginLeft: isOpen ? sidebarWidth : "0",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 40,
        }}
      >
        <MainContent />
      </motion.div>
    </div>
  );
}

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppLayout />
        </SidebarProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
