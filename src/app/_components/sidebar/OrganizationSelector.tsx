"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";

type OrganizationProps = {
  name: string;
  icon: string;
};

export function OrganizationSelector({ name, icon }: OrganizationProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="flex items-center px-4 h-14 rounded-lg cursor-pointer relative overflow-hidden hover:bg-white/5 transition-colors duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent transition-opacity duration-300"
        style={{ opacity: isHovered ? 0.6 : 0 }}
      />

      <div className="hover:scale-105 transition-transform duration-200">
        <Avatar className="h-8 w-8 mr-2 bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md">
          {icon}
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
      </div>

      <div className="hover:translate-y-0.5 transition-transform duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
