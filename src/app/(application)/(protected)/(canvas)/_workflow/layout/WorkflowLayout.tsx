"use client";

import { Workflow } from "@/app/_store/store";
import { ReactFlow, Background, Controls, BackgroundVariant } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@workflow/style/flow.css";
import { useTheme } from "next-themes";

export function WorkflowLayout({ workflow }: { workflow: Workflow }) {
  const { theme } = useTheme();
  if (!workflow) return null;

  return (
    <ReactFlow
      colorMode={theme as "dark" | "light" | "system"}
      fitView={true}
      panOnScroll={true}
      selectionOnDrag={true}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={2} />
      <Controls />
    </ReactFlow>
  );
}
