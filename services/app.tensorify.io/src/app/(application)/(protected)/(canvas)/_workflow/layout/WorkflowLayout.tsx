"use client";

import { Workflow } from "@/app/_store/store";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@workflow/style/flow.css";
import { useTheme } from "next-themes";
import CustomControl from "@workflow/controls/CustomControl";
import useMiniMapFade from "@workflow/hooks/useMiniMapFade";
import NodeSearch from "@workflow/components/NodeSearch";

export function WorkflowLayout({ workflow }: { workflow: Workflow }) {
  const { theme } = useTheme();
  const { showMiniMap, onMoveStart, onMoveEnd } = useMiniMapFade();
  if (!workflow) return null;

  return (
    <ReactFlow
      colorMode={theme as "dark" | "light" | "system"}
      fitView={true}
      panOnScroll={true}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      selectionOnDrag={true}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={2} />
      <CustomControl />
      <NodeSearch />
      <div
        style={{
          position: "absolute",
          bottom: "50px",
          opacity: showMiniMap ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <MiniMap position="bottom-left" zoomable pannable />
      </div>
    </ReactFlow>
  );
}
