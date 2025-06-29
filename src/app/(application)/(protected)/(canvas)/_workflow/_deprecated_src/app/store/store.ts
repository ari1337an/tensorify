import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

import { initialNodes } from "../nodes/nodes";
import { initialEdges } from "../edges/edges";
import { AppNode, type AppState } from "../types/types";
import { getRouteLevels, isDirectMatchRoute, normalizeRoute } from "@/lib/routeHelper";

const useStore = create<AppState>((set, get) => ({
  route: "/",
  nodes: initialNodes as AppNode[],
  edges: initialEdges,
  setRoute: (newRoute: string) => {
    set({ route: normalizeRoute(newRoute) });

    // Update nodes visibility based on the new route
    set({
      nodes: get().nodes.map((node) => ({
        ...node,
        hidden: !isDirectMatchRoute(node.route, newRoute),
      })),
    });
  },
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(
        changes,
        get().nodes.map((node) => ({
          ...node,
          hidden: !isDirectMatchRoute(node.route, get().route),
        }))
      ),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  onNodesDelete: (nodes) => {
    // get the node id of the nodes to be deleted
    const nodeIds = nodes.map((node) => node.id);

    // get all the nodes that have minimum one of the route level that match the nodeIds
    const childNodesToDelete = get().nodes.filter((node) => {
      const nodeRouteLevels = getRouteLevels(node.route);
      return nodeRouteLevels.some((level) => nodeIds.includes(level));
    });

    // delete the nodes with the nodeIds and the childNodesToDelete
    set({
      nodes: get().nodes.filter((node) => !nodeIds.includes(node.id) && !childNodesToDelete.includes(node)),
    });

    console.log("nodes", get().nodes);
  },
  setNodes: (nodes: AppNode[]) => {
    set({
      nodes: nodes.map((node) => ({
        ...node,
        hidden: !isDirectMatchRoute(node.route, get().route),
      })),
    });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  updateNodeData: (nodeId: string, data: Partial<AppNode["data"]>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  addNewNode: (node: AppNode) => {
    set({
      nodes: [
        ...get().nodes,
        {
          ...node,
          hidden: !isDirectMatchRoute(node.route, get().route),
        },
      ],
    });
  },
}));

export default useStore;
