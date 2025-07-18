"use client";

import useStore from "@/app/_store/store";

export function Breadcrumb() {
  const { currentWorkflow } = useStore();
  return (
    <div className="w-full flex-shrink overflow-hidden">
      <div className="flex items-center overflow-hidden">
        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-bold text-primary truncate">
            {currentWorkflow?.projectName || "Project Name"}
          </span>
        </div>

        <span className="text-muted-foreground mx-1 flex-shrink-0">/</span>

        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-medium text-muted-foreground truncate">
            {currentWorkflow?.name || "Workflow Name"}
          </span>
        </div>
      </div>
    </div>
  );
}
