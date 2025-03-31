"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { MenuItem } from "./MenuItem";

type ProjectsSectionProps = {
  activeItem: string;
  setActiveItem: (item: string) => void;
};

export function ProjectsSection({
  activeItem,
  setActiveItem,
}: ProjectsSectionProps) {
  return (
    <div className="py-3">
      <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-1.5">
        <FileText className="h-3 w-3" />
        <span>PROJECTS</span>
      </div>

      <MenuItem
        icon={
          <div className="relative">
            <Avatar className="h-5 w-5 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs">
              P
            </Avatar>
            {activeItem === "Projects" && (
              <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </div>
        }
        label="Projects"
        active={activeItem === "Projects"}
        onClick={() => setActiveItem("Projects")}
      />

      <div className="space-y-1 mt-1 ml-7">
        {["Wiki", "Meetings", "Docs", "Tasks Tracker"].map((item) => (
          <MenuItem
            key={item}
            icon={<div className="w-5" />} // Empty space for alignment
            label={item}
            active={activeItem === item}
            onClick={() => setActiveItem(item)}
          />
        ))}
      </div>
    </div>
  );
}
