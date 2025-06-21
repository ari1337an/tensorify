"use client";

import { WorkflowDetails } from "@/app/_components/WorkflowDetails";

export function CanvasRoot() {
  return (
    <div className="w-full h-[calc(100vh-2.75rem)] bg-background">
      <WorkflowDetails />
    </div>
  );
}
