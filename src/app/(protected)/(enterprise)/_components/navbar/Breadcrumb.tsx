"use client";

import React from "react";
import useStore from "@enterprise/_store/store";
import { useBreadcrumbs } from "@enterprise/_hooks";

export function Breadcrumb() {
  const { breadcrumbs } = useStore();
  useBreadcrumbs(); // This will update breadcrumbs based on route changes

  return (
    <div className="w-full flex-shrink overflow-hidden">
      <div className="flex items-center overflow-hidden">
        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-bold text-primary truncate">Tensorify</span>
        </div>

        {breadcrumbs.map((item) => (
          <React.Fragment key={item.path}>
            <span className="text-muted-foreground mx-1 flex-shrink-0">/</span>
            <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
              <span className="font-medium text-muted-foreground truncate">
                {item.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
