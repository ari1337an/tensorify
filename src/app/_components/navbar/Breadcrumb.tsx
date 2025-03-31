"use client";
import { Wrench } from "lucide-react";

export function Breadcrumb() {
  return (
    <div className="w-full flex-shrink overflow-hidden">
      <div className="flex items-center overflow-hidden">
        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-bold text-primary truncate">Tensorify</span>
          <span className="text-primary truncate hidden sm:inline">Events</span>
        </div>

        <span className="text-muted-foreground mx-1 flex-shrink-0">/</span>

        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-medium text-muted-foreground truncate">
            plugin-status-updates
          </span>
        </div>

        <span className="text-muted-foreground mx-1 flex-shrink-0">/</span>

        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <Wrench className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="font-medium truncate">Plugins</span>
        </div>
      </div>
    </div>
  );
}
