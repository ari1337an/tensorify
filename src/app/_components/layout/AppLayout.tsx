"use client";
import { motion } from "framer-motion";
import { Sidebar, useSidebar } from "../sidebar";
import { MainContent } from "./MainContent";
import { useUser } from "@clerk/nextjs";
import useStore from "@/app/_store/store";
import { useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, sidebarWidth } = useSidebar();
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    if (isSignedIn && user && isLoaded) {
      useStore.setState({ currentUser: user });
    } else {
      useStore.setState({ currentUser: null });
    }
  }, [isSignedIn, user, isLoaded]);

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
