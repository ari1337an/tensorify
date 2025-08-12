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
import { toast } from "sonner";

// Components
import CustomControl from "@workflow/controls/CustomControl";
import useMiniMapFade from "@workflow/hooks/useMiniMapFade";
import NodeSearch from "@workflow/components/NodeSearch";
import DevTools from "@workflow/components/DevTools";
import ValidationAlert from "@workflow/components/ValidationAlert";
import { useWorkflowPersistence } from "@workflow/hooks/useWorkflowPersistence";
import { useNodeValidation } from "@workflow/hooks/useNodeValidation";

// Store and Context
import useWorkflowStore, {
  type WorkflowNode,
} from "@workflow/store/workflowStore";
import {
  DragDropProvider,
  useDragDrop,
} from "@workflow/context/DragDropContext";
import useAppStore from "@/app/_store/store";

// Node Types
import StartNode from "@workflow/components/nodes/StartNode";
import EndNode from "@workflow/components/nodes/EndNode";
import NestedNode from "@workflow/components/nodes/NestedNode";
import BranchNode from "@workflow/components/nodes/BranchNode";
import MultiplexerNode from "@workflow/components/nodes/MultiplexerNode";
import DemultiplexerNode from "@workflow/components/nodes/DemultiplexerNode";
import CustomPluginNode from "@workflow/components/nodes/CustomPluginNode";

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

function WorkflowCanvas({ workflow }: { workflow: Workflow }) {
  const { theme } = useTheme();
  const { showMiniMap, onMoveStart, onMoveEnd } = useMiniMapFade();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Use workflow persistence hook
  useWorkflowPersistence({ workflow });

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

  // Get plugin manifests from store
  const pluginManifests = useAppStore((state) => state.pluginManifests);

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
    // Create a default mapping function
    const createNodeTypeMap = () => {
      const nodeMap: Record<
        string,
        React.ComponentType<NodeProps<WorkflowNode>>
      > = {};

      // Special case: nested nodes
      nodeMap["@tensorify/core/NestedNode"] = NestedNode;

      // Special case: end nodes
      nodeMap["@tensorify/core/EndNode"] = EndNode;

      // Special case: branch nodes
      nodeMap["@tensorify/core/BranchNode"] = BranchNode;

      // Special case: multiplexer nodes
      nodeMap["@tensorify/core/MultiplexerNode"] = MultiplexerNode;

      // Special case: demultiplexer nodes
      nodeMap["@tensorify/core/DemultiplexerNode"] = DemultiplexerNode;

      // Check if any plugin slugs should use CustomPluginNode
      pluginManifests.forEach((manifest) => {
        if (manifest.slug) {
          nodeMap[manifest.slug] = CustomPluginNode;
        }
      });

      // All other nodes use StartNode as default
      // This is a fallback - ReactFlow will use this for any unregistered types
      return new Proxy(nodeMap, {
        get: (target, prop) => {
          if (typeof prop === "string" && prop in target) {
            return target[prop];
          }
          // Default to StartNode for any other node type
          return StartNode;
        },
      });
    };

    return createNodeTypeMap();
  }, [pluginManifests]);

  // Default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: "smoothstep",
      animated: false,
      style: {
        strokeWidth: 5,
        stroke: "var(--xy-edge-stroke-default, hsl(var(--border)))",
      },
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

      // Check if this is a plugin node
      const isPluginNode = pluginManifests.some(
        (m: any) => m.slug === draggedNodeType
      );
      const manifest = pluginManifests.find(
        (m: any) => m.slug === draggedNodeType
      );

      // Extract label from manifest or use default
      let nodeLabel = `${draggedNodeType.split("/").pop()}`;
      // Support new contracts shape (frontendConfigs) and legacy
      const fc = (manifest?.manifest as any)?.frontendConfigs;
      if (fc?.visual || (manifest?.manifest as any)?.visual) {
        const visual = (fc?.visual ||
          (manifest?.manifest as any)?.visual) as any;
        nodeLabel =
          visual?.labels?.title ||
          (manifest?.manifest as any)?.name ||
          nodeLabel;
      }

      // Generate default settings if it's a plugin node
      const defaultSettings: Record<string, any> = {};
      const settingsFields = (fc?.settingsFields ||
        (manifest?.manifest as any)?.settingsFields) as any[] | undefined;
      if (isPluginNode && settingsFields) {
        settingsFields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            defaultSettings[field.key] = field.defaultValue;
          }
        });
      }

      // Check if we're trying to add a start node
      if (draggedNodeType === "@tensorify/core/StartNode") {
        // Check if a start node already exists in the current route
        const existingStartNode = nodes.find(
          (node) =>
            node.type === "@tensorify/core/StartNode" &&
            node.route === currentRoute
        );

        if (existingStartNode) {
          // Show error toast
          toast.error(
            `A start node already exists in route "${currentRoute}". Only one start node is allowed per route.`
          );
          // Clean up drag state and exit early
          setDraggedNodeType(null);
          setIsDragging(false);
          return;
        }
      }

      const newNode: WorkflowNode = {
        id: getId(),
        type: draggedNodeType,
        position,
        route: currentRoute,
        version: draggedVersion || "1.0.0",
        data: {
          label: nodeLabel,
          pluginId: isPluginNode ? draggedNodeType : undefined,
          pluginSettings: isPluginNode ? defaultSettings : undefined,
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
      pluginManifests,
      nodes,
    ]
  );

  // DO NOT REMOVE THE "reactflow-wrapper" class as its neessary for dragging and dropping nodes.
  return (
    <div className="workflow-canvas h-full w-full">
      <div ref={reactFlowWrapper} className="h-full w-full reactflow-wrapper">
        <ReactFlow
          colorMode={theme as "dark" | "light" | "system"}
          nodesFocusable={true}
          edgesFocusable={true}
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

          {/* Validation Alerts */}
          <ValidationAlert />

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
        <WorkflowCanvas workflow={workflow} />
      </DragDropProvider>
    </ReactFlowProvider>
  );
}
