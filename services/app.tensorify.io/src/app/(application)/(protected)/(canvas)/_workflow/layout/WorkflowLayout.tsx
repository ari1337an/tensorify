"use client";

import { Workflow } from "@/app/_store/store";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  useReactFlow,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "@workflow/style/flow.css";
import { useTheme } from "next-themes";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

// Components
import CustomControl from "@workflow/controls/CustomControl";
import useMiniMapFade from "@workflow/hooks/useMiniMapFade";
import NodeSearch from "@workflow/components/NodeSearch";
import DevTools from "@workflow/components/DevTools";

// Store and Context
import useWorkflowStore from "@workflow/store/workflowStore";
import {
  DragDropProvider,
  useDragDrop,
} from "@workflow/context/DragDropContext";

// Node Types
import CustomStandaloneNode from "@workflow/components/nodes/CustomStandaloneNode";
import CustomNestedNode from "@workflow/components/nodes/CustomNestedNode";

// ID generator for nodes
let nodeId = 0;
const getId = () => `node_${nodeId++}`;

const selector = (state: ReturnType<typeof useWorkflowStore.getState>) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  onNodesDelete: state.onNodesDelete,
  addNode: state.addNode,
  currentRoute: state.currentRoute,
});

function WorkflowCanvas() {
  const { theme } = useTheme();
  const { showMiniMap, onMoveStart, onMoveEnd } = useMiniMapFade();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    addNode,
    currentRoute,
  } = useWorkflowStore(useShallow(selector));

  const { screenToFlowPosition } = useReactFlow();
  const { draggedNodeType, draggedVersion, setDraggedNodeType, setIsDragging } =
    useDragDrop();

  // Node types registry
  const nodeTypes = useMemo(
    () => ({
      "@tensorify/core/CustomStandaloneNode": CustomStandaloneNode,
      "@tensorify/core/CustomNestedNode": CustomNestedNode,
    }),
    []
  );

  // Default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      animated: false,
      style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
    }),
    []
  );

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop - create new node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!draggedNodeType) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type: draggedNodeType,
        position,
        route: currentRoute,
        version: draggedVersion || "1.0.0",
        data: {
          label: `${draggedNodeType.split("/").pop()} Node`,
        },
        selected: false,
        dragging: false,
      };

      addNode(newNode);

      // Clean up drag state
      setDraggedNodeType(null);
      setIsDragging(false);
    },
    [
      screenToFlowPosition,
      draggedNodeType,
      draggedVersion,
      addNode,
      currentRoute,
      setDraggedNodeType,
      setIsDragging,
    ]
  );

  return (
    <div className="workflow-canvas h-full w-full">
      <div ref={reactFlowWrapper} className="h-full w-full">
        <ReactFlow
          colorMode={theme as "dark" | "light" | "system"}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          fitView={false}
          panOnScroll={true}
          selectionOnDrag={true}
          selectionMode={SelectionMode.Partial}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={4}
        >
          {/* Background */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={2}
            className="bg-background"
          />

          {/* Controls */}
          <CustomControl />

          {/* Node Search Panel */}
          <NodeSearch />

          {/* Development Tools */}
          <DevTools />

          {/* Minimap */}
          <div
            style={{
              position: "absolute",
              bottom: "50px",
              left: "5px",
              opacity: showMiniMap ? 1 : 0,
              transition: "opacity 0.5s ease",
              pointerEvents: showMiniMap ? "auto" : "none",
            }}
          >
            <MiniMap
              position="bottom-left"
              zoomable
              pannable
              className="border border-border/50 rounded-lg overflow-hidden"
              style={{
                backgroundColor: "hsl(var(--card))",
              }}
              nodeColor={(node) => {
                if (node.selected) return "hsl(var(--primary))";
                return "hsl(var(--muted-foreground))";
              }}
            />
          </div>
        </ReactFlow>
      </div>
    </div>
  );
}

export function WorkflowLayout({ workflow }: { workflow: Workflow }) {
  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-muted-foreground">No workflow selected</p>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <DragDropProvider>
        <WorkflowCanvas />
      </DragDropProvider>
    </ReactFlowProvider>
  );
}
