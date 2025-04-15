"use client";

export function Breadcrumb() {
  return (
    <div className="w-full flex-shrink overflow-hidden">
      <div className="flex items-center overflow-hidden">
        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-bold text-primary truncate">Tensorify</span>
        </div>

        <span className="text-muted-foreground mx-1 flex-shrink-0">/</span>

        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-medium text-muted-foreground truncate">
            Control Panel
          </span>
        </div>

        <span className="text-muted-foreground mx-1 flex-shrink-0">/</span>

        <div className="flex items-center gap-1 overflow-hidden flex-shrink min-w-0">
          <span className="font-medium text-muted-foreground truncate">
            Controls
          </span>
        </div>
      </div>
    </div>
  );
}
