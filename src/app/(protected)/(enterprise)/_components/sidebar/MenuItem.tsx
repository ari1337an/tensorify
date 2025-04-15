"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { cn } from "@/app/_lib/utils";

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  notification?: boolean;
  onClick?: () => void;
};

export function MenuItem({
  icon,
  label,
  active = false,
  collapsed = false,
  notification = false,
  onClick,
}: MenuItemProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "hover:cursor-pointer w-full flex items-center rounded-md px-3 py-2 text-sm transition-all duration-200 relative overflow-hidden",
              active
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={onClick}
          >
            {/* Background decoration for active item */}
            {active && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary to-primary/80 opacity-20" />
            )}

            <span className="text-lg flex-shrink-0">{icon}</span>
            <span className="truncate ml-2">{label}</span>

            {/* Notification dot */}
            {notification && (
              <div className="h-2 w-2 rounded-full bg-blue-500 ml-auto" />
            )}
          </button>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}
