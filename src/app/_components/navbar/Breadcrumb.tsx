"use client";

export function Breadcrumb() {
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-1">
        <span className="font-bold text-primary">AlphaWolf</span>
        <span className="text-muted-foreground">Ventures, Inc.</span>
      </div>

      <span className="text-muted-foreground mx-1">/</span>

      <div className="flex items-center gap-1">
        <span className="font-semibold">Projects</span>
      </div>
    </div>
  );
}
