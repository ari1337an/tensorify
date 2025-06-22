"use client";

import { Workflow } from "@/app/_store/store";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTheme } from "next-themes";

export function WorkflowLayout({ workflow }: { workflow: Workflow }) {
  const { theme } = useTheme();
  if (!workflow) return null;

  return (
    <ReactFlow colorMode={theme as "dark" | "light" | "system" || "system"}>
      <Background />
      <Controls />
    </ReactFlow>
  );
}
