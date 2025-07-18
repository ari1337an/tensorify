"use client";

import useStore from "@/app/_store/store";
import { CanvasContainer } from "./CanvasContainer";
import WorkflowSkeleton from "../_workflow/layout/WorkflowSkeleton";
import { WorkflowLayout } from "../_workflow/layout/WorkflowLayout";

export function CanvasRoot() {
  const currentWorkflow = useStore((state) => state.currentWorkflow);
  if (!currentWorkflow) {
    return (
      <CanvasContainer>
        <WorkflowSkeleton />
      </CanvasContainer>
    );
  } else {
    return (
      <CanvasContainer>
        <WorkflowLayout workflow={currentWorkflow} />
      </CanvasContainer>
    );
  }
}
