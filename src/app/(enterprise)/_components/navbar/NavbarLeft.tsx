"use client";
import { Menu } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { useSidebar } from "../sidebar";
import { Breadcrumb } from "./Breadcrumb";

export function NavbarLeft() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center gap-2 px-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb component */}
      <Breadcrumb />
    </div>
  );
}
