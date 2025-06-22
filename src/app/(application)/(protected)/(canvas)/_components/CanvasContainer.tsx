"use client";

/**
 * A container component that provides a full-height canvas for the workflow.
 * It ensures the canvas is the correct size and has the correct background color.
 */
export function CanvasContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-[calc(100vh-3rem)] bg-background">
      {children}
    </div>
  );
}