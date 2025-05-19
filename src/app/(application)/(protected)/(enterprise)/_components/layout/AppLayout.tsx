"use client";
import { motion } from "framer-motion";
import { Sidebar, useSidebar } from "../sidebar";
import { MainContent } from "./MainContent";

export function AppLayout({ children }: { children: React.ReactNode }) {
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
        <MainContent>{children}</MainContent>
      </motion.div>
    </div>
  );
}
