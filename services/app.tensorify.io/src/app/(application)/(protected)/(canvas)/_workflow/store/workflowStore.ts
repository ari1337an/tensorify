import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnNodesDelete,
  type Connection,
} from "@xyflow/react";

// Custom node data interface
export interface WorkflowNodeData {
  label: string;
  [key: string]: unknown;
}

// Extended node type with workflow-specific properties
export interface WorkflowNode extends Node<WorkflowNodeData> {
  route: string;
  version: string;
}

// Workflow canvas state interface
interface WorkflowCanvasState {
  // Core ReactFlow state
  nodes: WorkflowNode[];
  edges: Edge[];

  // Navigation state
  currentRoute: string;

  // ReactFlow event handlers
  onNodesChange: OnNodesChange<WorkflowNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodesDelete: OnNodesDelete;

  // State management actions
  setRoute: (newRoute: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => void;

  // Utility functions
  getVisibleNodes: () => WorkflowNode[];
  getNodesInRoute: (route: string) => WorkflowNode[];
}

// Route helper functions
const normalizeRoute = (route: string): string => {
  const cleaned = route.replace(/\/+/g, "/").replace(/\/+$/, "");
  if (!cleaned || cleaned === "/") return "/";
  return cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
};

const addRouteLevel = (route: string, newLevel: string): string => {
  const trimmedRoute = route.replace(/\/+$/, "");
  if (trimmedRoute === "/" || trimmedRoute === "") return `/${newLevel}`;
  return `${trimmedRoute}/${newLevel}`;
};

const getRouteLevels = (route: string): string[] => {
  return normalizeRoute(route)
    .split("/")
    .filter((level) => level && level !== "/");
};

const isDirectMatchRoute = (
  nodeRoute: string,
  currentRoute: string
): boolean => {
  return normalizeRoute(nodeRoute) === normalizeRoute(currentRoute);
};

// Create the workflow canvas store
const useWorkflowStore = create<WorkflowCanvasState>()(
  devtools(
    (set, get) => ({
      // Initial state
      nodes: [],
      edges: [],
      currentRoute: "/",

      // ReactFlow event handlers
      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(
            changes,
            state.nodes.map((node) => ({
              ...node,
              hidden: !isDirectMatchRoute(node.route, state.currentRoute),
            }))
          ),
        }));
      },

      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        }));
      },

      onConnect: (connection: Connection) => {
        set((state) => ({
          edges: addEdge(connection, state.edges),
        }));
      },

      onNodesDelete: (nodesToDelete) => {
        const nodeIds = nodesToDelete.map((node) => node.id);

        // Get child nodes that should be deleted (nested nodes)
        const childNodesToDelete = get().nodes.filter((node) => {
          const nodeRouteLevels = getRouteLevels(node.route);
          return nodeRouteLevels.some((level) => nodeIds.includes(level));
        });

        set((state) => ({
          nodes: state.nodes.filter(
            (node) =>
              !nodeIds.includes(node.id) &&
              !childNodesToDelete.some((child) => child.id === node.id)
          ),
        }));
      },

      // State management actions
      setRoute: (newRoute: string) => {
        const normalizedRoute = normalizeRoute(newRoute);
        set((state) => ({
          currentRoute: normalizedRoute,
          nodes: state.nodes.map((node) => ({
            ...node,
            hidden: !isDirectMatchRoute(node.route, normalizedRoute),
          })),
        }));
      },

      setNodes: (nodes: WorkflowNode[]) => {
        set((state) => ({
          nodes: nodes.map((node) => ({
            ...node,
            hidden: !isDirectMatchRoute(node.route, state.currentRoute),
          })),
        }));
      },

      setEdges: (edges: Edge[]) => {
        set({ edges });
      },

      addNode: (node: WorkflowNode) => {
        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              ...node,
              hidden: !isDirectMatchRoute(node.route, state.currentRoute),
            },
          ],
        }));
      },

      updateNodeData: (nodeId: string, data: Partial<WorkflowNodeData>) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        }));
      },

      // Utility functions
      getVisibleNodes: () => {
        const state = get();
        return state.nodes.filter((node) =>
          isDirectMatchRoute(node.route, state.currentRoute)
        );
      },

      getNodesInRoute: (route: string) => {
        return get().nodes.filter((node) =>
          isDirectMatchRoute(node.route, route)
        );
      },
    }),
    { name: "WorkflowCanvasStore" }
  )
);

export default useWorkflowStore;
export { addRouteLevel, normalizeRoute, getRouteLevels, isDirectMatchRoute };
export type { WorkflowCanvasState };
