
import { Skeleton } from "@/app/_components/ui/skeleton";

/**
 * A reusable skeleton component for individual workflow nodes.
 * Includes placeholders for an icon and a label.
 */
function NodeSkeleton() {
  return (
    <div className="flex w-52 h-20 items-center gap-3 rounded-lg border bg-card p-4">
      <Skeleton className="h-9 w-9 rounded-md" />
      <div className="flex flex-col gap-2 w-full">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * A skeleton component that visually represents a complex HORIZONTAL n8n-style workflow.
 * It features a main path that flows left-to-right, splitting into two parallel horizontal
 * branches that then merge back into a single path.
 */
export default function WorkflowSkeleton() {
  return (
    <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
      {/* Grid pattern background */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(var(--muted-foreground) / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(var(--muted-foreground) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Main workflow container, ensuring it stays in front of the grid */}
      <div className="relative z-10 flex items-center gap-4">
        {/* === STARTING ROW: Start Node -> Regular Node === */}
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-1 w-12" />
        <NodeSkeleton />

        {/* === SPLIT CONNECTOR === */}
        <div className="relative h-48 flex items-center">
          {/* Line entering the split */}
          <Skeleton className="h-1 w-6" />
          {/* Vertical line of the split */}
          <Skeleton className="h-full w-1" />
          {/* Two horizontal lines exiting the split */}
          <div className="absolute left-6 h-full w-6">
            <Skeleton className="absolute top-0 h-1 w-full" />
            <Skeleton className="absolute bottom-0 h-1 w-full" />
          </div>
        </div>

        {/* === PARALLEL BRANCHES === */}
        <div className="flex flex-col gap-28">
          {/* --- Branch A (Top) --- */}
          <div className="flex items-center gap-4">
            <NodeSkeleton />
            <Skeleton className="h-1 w-12" />
            <NodeSkeleton />
          </div>

          {/* --- Branch B (Bottom)--- */}
          <div className="flex items-center gap-4">
            <NodeSkeleton />
            <Skeleton className="h-1 w-12" />
            <NodeSkeleton />
          </div>
        </div>

        {/* === MERGE CONNECTOR === */}
        <div className="relative h-48 flex items-center">
          {/* Two horizontal lines entering the merge */}
          <div className="absolute right-6 h-full w-6">
            <Skeleton className="absolute top-0 h-1 w-full" />
            <Skeleton className="absolute bottom-0 h-1 w-full" />
          </div>
          {/* Vertical line of the merge */}
          <Skeleton className="h-full w-1" />
          {/* Line exiting the merge */}
          <Skeleton className="h-1 w-6" />
        </div>

        {/* === FINAL NODE === */}
        <NodeSkeleton />
      </div>
    </div>
  );
}