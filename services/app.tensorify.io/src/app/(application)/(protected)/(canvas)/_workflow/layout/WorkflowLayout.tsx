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
  type NodeProps,
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
import useWorkflowStore, {
  type WorkflowNode,
} from "@workflow/store/workflowStore";
import {
  DragDropProvider,
  useDragDrop,
} from "@workflow/context/DragDropContext";

// Node Types
import CustomStandaloneNode from "@workflow/components/nodes/CustomStandaloneNode";
import CustomNestedNode from "@workflow/components/nodes/CustomNestedNode";

// ID generator for nodes using crypto.randomUUID for better uniqueness
const getId = () => crypto.randomUUID();

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
  // Always fire this to verify dev environment
  console.log("🚀 WorkflowCanvas component is running - Console working!");

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
  const {
    draggedNodeType,
    draggedVersion,
    setDraggedNodeType,
    setIsDragging,
    onDropSuccess,
  } = useDragDrop();

  // Node types registry - general approach: nested vs all others
  const nodeTypes = useMemo(() => {
    console.log("🟢 Node types registry created");

    // Create a default mapping function
    const createNodeTypeMap = () => {
      const nodeMap: Record<
        string,
        React.ComponentType<NodeProps<WorkflowNode>>
      > = {};

      // Special case: nested nodes
      nodeMap["@tensorify/core/CustomNestedNode"] = CustomNestedNode;

      // All other nodes use CustomStandaloneNode as default
      // This is a fallback - ReactFlow will use this for any unregistered types
      return new Proxy(nodeMap, {
        get: (target, prop) => {
          if (typeof prop === "string" && prop in target) {
            return target[prop];
          }
          // Default to CustomStandaloneNode for any other node type
          return CustomStandaloneNode;
        },
      });
    };

    return createNodeTypeMap();
  }, []);

  // Debug nodes
  console.log(
    "🟢 WorkflowLayout render - nodes:",
    nodes.map((n) => ({ id: n.id, type: n.type, selected: n.selected }))
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

      // Notify that drop was successful
      onDropSuccess();
    },
    [
      screenToFlowPosition,
      draggedNodeType,
      draggedVersion,
      addNode,
      currentRoute,
      setDraggedNodeType,
      setIsDragging,
      onDropSuccess,
    ]
  );

  // DO NOT REMOVE THE "reactflow-wrapper" class as its neessary for dragging and dropping nodes.
  return (
    <div className="workflow-canvas h-full w-full">
      <div ref={reactFlowWrapper} className="h-full w-full reactflow-wrapper">
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
          zoomOnDoubleClick={false}
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
