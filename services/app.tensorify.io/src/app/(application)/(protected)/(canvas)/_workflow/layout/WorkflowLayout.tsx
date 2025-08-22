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
  OnNodeDrag,
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
import { UIEngineProvider, useUIEngine, getEdgeStyle } from "@workflow/engine";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/app/_components/ui/tooltip";
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
import CustomCodeNode from "@workflow/components/nodes/CustomCodeNode";
import ClassNode from "@workflow/components/nodes/ClassNode";
import CustomPluginNode from "@workflow/components/nodes/CustomPluginNode";
import GlobalNodeSettingsDialog from "@workflow/components/GlobalNodeSettingsDialog";
import CustomEdge from "@workflow/components/CustomEdge";

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
  setReactFlowInstance: state.setReactFlowInstance,
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
    setReactFlowInstance,
  } = useWorkflowStore(useShallow(selector));

  // Get plugin manifests from store
  const pluginManifests = useAppStore((state) => state.pluginManifests);

  const { screenToFlowPosition, getNode } = useReactFlow();
  const engine = useUIEngine();
  const {
    draggedNodeType,
    draggedVersion,
    setDraggedNodeType,
    setIsDragging,
    onDropSuccess,
  } = useDragDrop();

  // Get drag state management from store
  const setCurrentlyDraggedNodeId = useWorkflowStore(
    (state) => state.setCurrentlyDraggedNodeId
  );

  // Handle when node dragging starts
  const handleNodeDragStart: OnNodeDrag = useCallback((event, node) => {
    setCurrentlyDraggedNodeId(node.id);
    console.log(`🎯 Started dragging node: ${node.id}`);
  }, []);

  // Handle when a node is dropped (drag ends) - check if it overlaps with sequence nodes
  const handleNodeDragStop: OnNodeDrag = useCallback(
    (event, draggedNode) => {
      // Clean up drag state first
      setCurrentlyDraggedNodeId(null);
      console.log(
        `🎯 ReactFlow onNodeDragStop triggered for node: ${draggedNode.id}`
      );
      console.log(
        `🎯 Node type: ${draggedNode.type}, position:`,
        draggedNode.position
      );

      // Get all nodes first
      const allNodes = useWorkflowStore.getState().nodes;
      console.log(`🎯 Total nodes in store: ${allNodes.length}`);
      console.log(
        `🎯 All node IDs:`,
        allNodes.map((n) => n.id)
      );

      // Only handle canvas-to-sequence drops here (existing nodes being moved)
      // NodeSearch-to-sequence drops are handled by CustomPluginNode's handleDropIntoSequence
      const isExistingCanvasNode = allNodes.some(
        (n) => n.id === draggedNode.id
      );
      console.log(`🎯 Is existing canvas node: ${isExistingCanvasNode}`);

      // Also check if this is a temporary ReactFlow node from NodeSearch by checking if it has a valid route
      const hasValidRoute = (draggedNode as WorkflowNode).route !== undefined;
      console.log(
        `🎯 Has valid route: ${hasValidRoute}, route: ${(draggedNode as WorkflowNode).route}`
      );

      if (!isExistingCanvasNode || !hasValidRoute) {
        console.log(
          `🎯 SKIPPING - node ${draggedNode.id} is either not in canvas nodes or is a temporary NodeSearch node, this should be handled by CustomPluginNode`
        );
        return;
      }
      const sequenceNodes = allNodes.filter((n) => {
        // Check if this is a sequence node by looking at the manifest
        const pluginId = (n.data as any)?.pluginId || n.type;
        const manifest = pluginManifests.find((m) => m.slug === pluginId);

        if (!manifest) {
          console.log(
            `🎯 No manifest found for node ${n.id} with pluginId: ${pluginId}`
          );
          return false;
        }

        const nodeType =
          (manifest?.manifest as any)?.pluginType ||
          (manifest?.manifest as any)?.frontendConfigs?.nodeType;

        console.log(
          `🎯 Node ${n.id} has nodeType: ${nodeType}, pluginId: ${pluginId}`
        );
        return nodeType === "sequence";
      });

      console.log(`🎯 Found ${sequenceNodes.length} sequence nodes to check`);

      // Calculate dragged node bounds (use actual position, not mouse position)
      const draggedNodeBounds = {
        left: draggedNode.position.x,
        top: draggedNode.position.y,
        right: draggedNode.position.x + (draggedNode.measured?.width || 200),
        bottom: draggedNode.position.y + (draggedNode.measured?.height || 120),
      };

      console.log(`🎯 Dragged node bounds:`, draggedNodeBounds);

      // Check overlap with each sequence node
      for (const sequenceNode of sequenceNodes) {
        // Prevent a node from being dropped into itself
        if (sequenceNode.id === draggedNode.id) {
          console.log(
            `🎯 Skipping sequence node ${sequenceNode.id} - cannot drop into itself`
          );
          continue;
        }

        if (!sequenceNode.position || !sequenceNode.measured) {
          console.log(
            `🎯 Skipping sequence node ${sequenceNode.id} - missing position/size data`
          );
          continue;
        }

        // Calculate sequence node bounds
        const sequenceBounds = {
          left: sequenceNode.position.x,
          top: sequenceNode.position.y,
          right:
            sequenceNode.position.x + (sequenceNode.measured?.width || 300),
          bottom:
            sequenceNode.position.y + (sequenceNode.measured?.height || 200),
        };

        console.log(
          `🎯 Checking overlap with sequence ${sequenceNode.id}:`,
          sequenceBounds
        );

        // Check for bounding box overlap (more generous than exact center point)
        const overlapX =
          draggedNodeBounds.left < sequenceBounds.right &&
          draggedNodeBounds.right > sequenceBounds.left;
        const overlapY =
          draggedNodeBounds.top < sequenceBounds.bottom &&
          draggedNodeBounds.bottom > sequenceBounds.top;
        const hasOverlap = overlapX && overlapY;

        // For better UX, also check if dragged node center is within sequence bounds
        const draggedCenter = {
          x:
            draggedNodeBounds.left +
            (draggedNodeBounds.right - draggedNodeBounds.left) / 2,
          y:
            draggedNodeBounds.top +
            (draggedNodeBounds.bottom - draggedNodeBounds.top) / 2,
        };

        const centerInSequence =
          draggedCenter.x >= sequenceBounds.left &&
          draggedCenter.x <= sequenceBounds.right &&
          draggedCenter.y >= sequenceBounds.top &&
          draggedCenter.y <= sequenceBounds.bottom;

        console.log(
          `🎯 Overlap: ${hasOverlap}, Center in sequence: ${centerInSequence}`
        );

        if (hasOverlap || centerInSequence) {
          console.log(
            `🎯 Moving node ${draggedNode.id} into sequence ${sequenceNode.id}`
          );

          // Get current sequence items
          const currentSequenceItems =
            (sequenceNode.data as any)?.sequenceItems || [];

          console.log(`🎯 Current sequence items:`, currentSequenceItems);

          // Create sequence item from dragged node
          const sequenceItem = {
            slug: draggedNode.type || "@tensorify/core/CustomNode",
            name:
              draggedNode.data?.label ||
              draggedNode.type?.split("/").pop() ||
              "item",
            version: (draggedNode as any).version || "1.0.0",
            pluginSettings: draggedNode.data?.pluginSettings || {},
            nodeId: draggedNode.id, // Keep reference to original node ID
          };

          console.log(`🎯 Created sequence item:`, sequenceItem);

          // Add to sequence
          const newSequenceItems = [...currentSequenceItems, sequenceItem];

          console.log(`🎯 New sequence items:`, newSequenceItems);

          // Update both sequence node and dragged node in a single operation
          const { setNodes } = useWorkflowStore.getState();

          console.log(
            `🎯 Updating sequence node ${sequenceNode.id} with new items`
          );

          // Change the dragged node's route to be inside the sequence (don't delete it!)
          const workflowNode = draggedNode as WorkflowNode;
          const currentRoute =
            workflowNode.route === "/" ? "" : workflowNode.route;
          const newRoute = `${currentRoute}/sequence-${sequenceNode.id}`;
          console.log(
            `🎯 Changing dragged node route from "${workflowNode.route}" to "${newRoute}"`
          );

          // Update both nodes in a single setNodes call
          const updatedNodes = allNodes.map((n) => {
            if (n.id === draggedNode.id) {
              // Update dragged node: change route and hide it
              return { ...n, route: newRoute, hidden: true };
            } else if (n.id === sequenceNode.id) {
              // Update sequence node: add new item to sequence
              return {
                ...n,
                data: {
                  ...n.data,
                  sequenceItems: newSequenceItems,
                  pluginSettings: {
                    ...((n.data as any)?.pluginSettings || {}),
                    itemsCount: newSequenceItems.length,
                  },
                },
              };
            }
            return n;
          });
          setNodes(updatedNodes);

          console.log(
            `✅ Successfully moved node ${draggedNode.id} into sequence ${sequenceNode.id}. New route: ${newRoute}`
          );
          console.log(
            `🎯 Sequence node updated with ${newSequenceItems.length} items:`,
            newSequenceItems
          );
          return; // Stop after first successful drop
        }
      }

      console.log(`🎯 No sequence overlap found for node ${draggedNode.id}`);
    },
    [pluginManifests]
  );

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

      // Special case: custom code nodes
      nodeMap["@tensorify/core/CustomCodeNode"] = CustomCodeNode;

      // Special case: class nodes
      nodeMap["@tensorify/core/ClassNode"] = ClassNode;

      // Removed Multiplexer/Demultiplexer node types

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

  // Edge types for custom edge components with hover tooltips
  const edgeTypes = useMemo(
    () => ({
      smoothstep: CustomEdge,
    }),
    []
  );

  // Default edge options (base); actual color may be overridden by UIEngine
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

  // Handle drop - create new node or move existing node
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      console.log(`🎯 Canvas drop handler triggered`);
      console.log(
        "Canvas drop - Available drag data types:",
        Array.from(event.dataTransfer.types)
      );

      event.preventDefault();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check for existing canvas node being moved
      const draggedCanvasNodeId = event.dataTransfer.getData(
        "application/canvas-node"
      );
      console.log(`🎯 Canvas drop - Canvas node ID: "${draggedCanvasNodeId}"`);
      if (draggedCanvasNodeId) {
        const nodeToMove = nodes.find((n) => n.id === draggedCanvasNodeId);
        if (nodeToMove) {
          // Update node position and route to current route
          const setNodesState = useWorkflowStore.getState().setNodes;
          setNodesState(
            nodes.map((node) =>
              node.id === draggedCanvasNodeId
                ? { ...node, position, route: currentRoute, hidden: false }
                : node
            )
          );
        }
        return;
      }

      // Handle new nodes from search panel
      const nodeTypeFromTensorify = event.dataTransfer.getData(
        "application/tensorify-node"
      );
      const nodeTypeFromReactFlow = event.dataTransfer.getData(
        "application/reactflow"
      );
      const nodeTypeToUse =
        draggedNodeType || nodeTypeFromTensorify || nodeTypeFromReactFlow;

      if (!nodeTypeToUse) {
        return;
      }

      // Check if this is a plugin node
      const isPluginNode = pluginManifests.some(
        (m: any) => m.slug === nodeTypeToUse
      );
      const manifest = pluginManifests.find(
        (m: any) => m.slug === nodeTypeToUse
      );

      // Extract label from manifest or use default
      let nodeLabel = `${nodeTypeToUse.split("/").pop()}`;
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
        type: nodeTypeToUse,
        position,
        route: currentRoute,
        version: draggedVersion || "1.0.0",
        data: {
          label: nodeLabel,
          pluginId: isPluginNode ? nodeTypeToUse : undefined,
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
          edges={edges.map((e) => {
            const override = engine ? getEdgeStyle(e.id, engine) : undefined;
            return override
              ? {
                  ...e,
                  style: { ...(e.style || {}), ...override },
                  data: { ...(e.data || {}), __uiIssue: true },
                }
              : e;
          })}
          onNodesChange={onNodesChange as any}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          onInit={setReactFlowInstance}
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
      {/* Global dialog to open settings for nodes not currently rendered/visible */}
      <GlobalNodeSettingsDialog />
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
        <UIEngineProvider>
          <WorkflowCanvas workflow={workflow} />
        </UIEngineProvider>
      </DragDropProvider>
    </ReactFlowProvider>
  );
}
