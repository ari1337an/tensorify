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
  type ReactFlowInstance,
} from "@xyflow/react";

// Visual configuration interfaces
export interface VisualSize {
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: "flexible" | "fixed";
}

export interface VisualPadding {
  inner?: number;
  outer?: number;
  extraPadding?: boolean;
}

export interface VisualStyling {
  borderRadius?: number;
  borderWidth?: number;
  shadowLevel?: number;
  theme?: "auto" | "light" | "dark";
  borderColor?: string;
  backgroundColor?: string;
}

export interface VisualIcons {
  primaryType?: "lucide" | "fontawesome" | "svg";
  primaryValue?: string;
  iconSize?: "small" | "medium" | "large";
  showIconBackground?: boolean;
}

export interface VisualLabels {
  title?: string;
  titleDescription?: string;
  dynamicLabelTemplate?: string;
  showLabels?: boolean;
  labelPosition?: "top" | "bottom" | "overlay";
}

export interface VisualConfig {
  containerType?: "default" | "box" | "circle" | "left-round";
  size?: VisualSize;
  padding?: VisualPadding;
  styling?: VisualStyling;
  icons?: VisualIcons;
  labels?: VisualLabels;
}

// Custom node data interface
export interface WorkflowNodeData {
  label: string;
  visualConfig?: VisualConfig;
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

  // Persistence state
  isSaving: boolean;
  lastSavedAt: Date | null;

  // Node settings dialog state (per-node open flags)
  nodeSettingsOpenById: Record<string, boolean>;
  // Track which nodes are actually rendered on the canvas (by id)
  renderedNodeIds: Record<string, boolean>;
  // Global dialog for nodes that are not currently rendered/visible
  globalNodeSettingsNodeId: string | null;

  // Transient error highlight state: nodeId -> expiresAt (ms since epoch)
  transientErrorUntilByNodeId: Record<string, number>;

  // Last export errors by node id (message to show on hover)
  lastExportErrorsByNodeId: Record<string, string>;

  // Artifact errors from last export: artifactId -> { nodeId -> error message }
  lastExportArtifactErrors: Record<string, Record<string, string>>;

  // ReactFlow instance for programmatic actions (focus, center, etc.)
  reactFlowInstance: ReactFlowInstance | null;

  // Export dialog state
  isExportDialogOpen: boolean;

  // Drag state for visual feedback
  currentlyDraggedNodeId: string | null;

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
  // Dialog control actions
  openNodeSettingsDialog: (nodeId: string) => void;
  closeNodeSettingsDialog: (nodeId: string) => void;
  toggleNodeSettingsDialog: (nodeId: string) => void;
  // Backward-compat alias (kept for existing callers)
  openNodeSettings: (nodeId: string) => void;
  closeGlobalNodeSettingsDialog: () => void;
  // Rendering registry
  registerRenderedNode: (nodeId: string) => void;
  unregisterRenderedNode: (nodeId: string) => void;
  setSaving: (saving: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;

  // Visual feedback actions
  flashNodeErrors: (nodeIds: string[], durationMs?: number) => void;
  setLastExportErrors: (errors: Record<string, string>) => void;
  setLastExportArtifactErrors: (
    artifactErrors: Record<string, Record<string, string>>
  ) => void;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  focusOnNode: (nodeId: string) => void;
  // Export dialog actions
  openExportDialog: () => void;
  closeExportDialog: () => void;

  // Drag state actions
  setCurrentlyDraggedNodeId: (nodeId: string | null) => void;

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
      isSaving: false,
      lastSavedAt: null,
      nodeSettingsOpenById: {},
      renderedNodeIds: {},
      globalNodeSettingsNodeId: null,
      transientErrorUntilByNodeId: {},
      lastExportErrorsByNodeId: {},
      lastExportArtifactErrors: {},
      reactFlowInstance: null,
      isExportDialogOpen: false,
      currentlyDraggedNodeId: null,

      // ReactFlow event handlers
      onNodesChange: (changes) => {
        set((state) => {
          // Apply changes first, then handle visibility
          const updatedNodes = applyNodeChanges(changes, state.nodes);

          // Apply visibility after changes are processed
          return {
            nodes: updatedNodes.map((node) => ({
              ...node,
              hidden: !isDirectMatchRoute(node.route, state.currentRoute),
            })),
          };
        });
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

        // Patterns for nested routes: sequence-<parentId>
        const sequenceSegments = new Set(nodeIds.map((id) => `sequence-${id}`));

        // Get child nodes that should be deleted (nested nodes) by route levels
        const childNodesToDelete = get().nodes.filter((node) => {
          const nodeRouteLevels = getRouteLevels(node.route);
          // Delete if any route level is exactly a parent id (legacy) OR sequence-<parentId>
          return (
            nodeRouteLevels.some((level) => nodeIds.includes(level)) ||
            nodeRouteLevels.some((level) => sequenceSegments.has(level))
          );
        });

        const allIdsToDelete = new Set<string>([
          ...nodeIds,
          ...childNodesToDelete.map((n) => n.id),
        ]);

        set((state) => ({
          nodes: state.nodes.filter((node) => !allIdsToDelete.has(node.id)),
          edges: state.edges.filter(
            (edge) =>
              !allIdsToDelete.has(edge.source as string) &&
              !allIdsToDelete.has(edge.target as string)
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

      // Dialog control via store (preferred, maintainable)
      openNodeSettingsDialog: (nodeId: string) => {
        set((state) => {
          const isRendered = Boolean(state.renderedNodeIds[nodeId]);
          if (isRendered) {
            return {
              nodeSettingsOpenById: {
                ...state.nodeSettingsOpenById,
                [nodeId]: true,
              },
              globalNodeSettingsNodeId:
                state.globalNodeSettingsNodeId === nodeId
                  ? null
                  : state.globalNodeSettingsNodeId,
            } as Partial<WorkflowCanvasState> as any;
          }
          // Fallback to global dialog when node is not rendered/visible
          return {
            globalNodeSettingsNodeId: nodeId,
          } as Partial<WorkflowCanvasState> as any;
        });
      },

      closeNodeSettingsDialog: (nodeId: string) => {
        set((state) => ({
          nodeSettingsOpenById: {
            ...state.nodeSettingsOpenById,
            [nodeId]: false,
          },
        }));
      },

      toggleNodeSettingsDialog: (nodeId: string) => {
        set((state) => ({
          nodeSettingsOpenById: {
            ...state.nodeSettingsOpenById,
            [nodeId]: !state.nodeSettingsOpenById[nodeId],
          },
        }));
      },

      // Backward-compat alias used elsewhere; now delegates to store dialog
      openNodeSettings: (nodeId: string) => {
        get().openNodeSettingsDialog(nodeId);
      },

      closeGlobalNodeSettingsDialog: () => {
        set({ globalNodeSettingsNodeId: null });
      },

      // Rendering registry
      registerRenderedNode: (nodeId: string) => {
        set((state) => ({
          renderedNodeIds: { ...state.renderedNodeIds, [nodeId]: true },
        }));
      },
      unregisterRenderedNode: (nodeId: string) => {
        set((state) => {
          const next = { ...state.renderedNodeIds };
          delete next[nodeId];
          return {
            renderedNodeIds: next,
          } as Partial<WorkflowCanvasState> as any;
        });
      },

      setSaving: (saving: boolean) => {
        set({ isSaving: saving });
      },

      setLastSavedAt: (date: Date | null) => {
        set({ lastSavedAt: date });
      },

      flashNodeErrors: (nodeIds: string[], durationMs: number = 5000) => {
        const now = Date.now();
        const until = now + Math.max(0, durationMs);
        set((state) => {
          const next = {
            ...(state.transientErrorUntilByNodeId || {}),
          } as Record<string, number>;
          for (const nid of nodeIds) next[nid] = until;
          return {
            transientErrorUntilByNodeId: next,
          } as Partial<WorkflowCanvasState> as any;
        });
        // Schedule cleanup after duration to prune expired entries
        setTimeout(() => {
          set((state) => {
            const next = {
              ...(state.transientErrorUntilByNodeId || {}),
            } as Record<string, number>;
            const t = Date.now();
            let changed = false;
            for (const [nid, exp] of Object.entries(next)) {
              if (exp <= t) {
                delete next[nid];
                changed = true;
              }
            }
            return changed
              ? ({
                  transientErrorUntilByNodeId: next,
                } as Partial<WorkflowCanvasState> as any)
              : ({} as any);
          });
        }, durationMs + 25);
      },

      setLastExportErrors: (errors: Record<string, string>) => {
        set({ lastExportErrorsByNodeId: errors || {} });
      },

      setLastExportArtifactErrors: (
        artifactErrors: Record<string, Record<string, string>>
      ) => {
        set({ lastExportArtifactErrors: artifactErrors || {} });
      },

      setReactFlowInstance: (instance: ReactFlowInstance | null) => {
        set({ reactFlowInstance: instance });
      },

      focusOnNode: (nodeId: string) => {
        const { reactFlowInstance, nodes, openNodeSettingsDialog } = get();
        if (!reactFlowInstance || !nodeId) return;

        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Check if this is a sequence child node
        const isSequenceChild = node.route.includes("/sequence-");
        let targetNodeId = nodeId;

        if (isSequenceChild) {
          // Extract parent sequence ID from route
          const parentSequenceId = node.route
            .split("/sequence-")[1]
            ?.split("/")[0];
          if (parentSequenceId) {
            const parentNode = nodes.find((n) => n.id === parentSequenceId);
            if (parentNode) {
              targetNodeId = parentSequenceId;
            }
          }
        }

        // Focus and center on the target node (parent for sequence children)
        reactFlowInstance.fitView({
          nodes: [{ id: targetNodeId }],
          duration: 800,
          maxZoom: 1.2,
          minZoom: 0.3,
          padding: 0.3,
        });

        // Select the target node for visual emphasis
        reactFlowInstance.setNodes((nodes) =>
          nodes.map((n) => ({
            ...n,
            selected: n.id === targetNodeId,
          }))
        );

        // Open the node settings dialog for the original error node (not the parent)
        // This ensures the user sees the error details for the actual problematic node
        setTimeout(() => {
          openNodeSettingsDialog(nodeId);
        }, 900); // Slight delay to let the focus animation complete
      },

      openExportDialog: () => {
        set({ isExportDialogOpen: true });
      },

      closeExportDialog: () => {
        set({ isExportDialogOpen: false });
      },

      // Drag state actions
      setCurrentlyDraggedNodeId: (nodeId: string | null) => {
        set({ currentlyDraggedNodeId: nodeId });
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
