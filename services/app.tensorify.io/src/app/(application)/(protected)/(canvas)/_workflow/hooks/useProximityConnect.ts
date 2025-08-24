"use client";

import { useCallback, useMemo, useState } from "react";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import useWorkflowStore, {
  type WorkflowNode,
} from "@workflow/store/workflowStore";
import { useShallow } from "zustand/react/shallow";

// Proximity threshold in pixels - adjust for better UX
const MIN_DISTANCE = 120;

export interface ProximityConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export function useProximityConnect() {
  const store = useStoreApi();
  const { getInternalNode } = useReactFlow();

  const { edges, setEdges } = useWorkflowStore(
    useShallow((state) => ({
      edges: state.edges,
      setEdges: state.setEdges,
    }))
  );

  // State for visual feedback
  const [proximityState, setProximityState] = useState<{
    draggedNode: WorkflowNode | null;
    targetNode: WorkflowNode | null;
    isActive: boolean;
  }>({
    draggedNode: null,
    targetNode: null,
    isActive: false,
  });

  // Calculate distance between two points
  const calculateDistance = useCallback(
    (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    []
  );

  // Find the closest node within proximity threshold
  const getClosestNode = useCallback(
    (draggedNode: WorkflowNode): WorkflowNode | null => {
      console.log("🔍 getClosestNode called for:", draggedNode.id);

      // Get the dragged node's internal representation
      const draggedInternalNode = getInternalNode(draggedNode.id);
      if (!draggedInternalNode?.internals?.positionAbsolute) {
        console.log("🔍 No internal node or position found for dragged node");
        return null;
      }

      const draggedPosition = draggedInternalNode.internals.positionAbsolute;
      console.log("🔍 draggedPosition:", draggedPosition);

      // Get all workflow nodes from our store instead of React Flow's internal store
      const allWorkflowNodes = useWorkflowStore.getState().nodes;
      console.log("🔍 allWorkflowNodes count:", allWorkflowNodes.length);

      // Find closest node within MIN_DISTANCE
      let closestNode: WorkflowNode | null = null;
      let minDistance = Number.MAX_VALUE;

      for (const node of allWorkflowNodes) {
        // Skip the dragged node itself
        if (node.id === draggedNode.id) {
          continue;
        }

        // Skip hidden nodes and nodes from different routes
        if (node.hidden || node.route !== draggedNode.route) {
          continue;
        }

        // Get the internal node for position information
        const nodeInternal = getInternalNode(node.id);
        if (!nodeInternal?.internals?.positionAbsolute) {
          continue;
        }

        const distance = calculateDistance(
          draggedPosition,
          nodeInternal.internals.positionAbsolute
        );

        console.log(`🔍 Distance to ${node.id}:`, distance);

        // Only consider nodes within the proximity threshold
        if (distance < minDistance && distance < MIN_DISTANCE) {
          minDistance = distance;
          closestNode = node;
        }
      }

      console.log(
        "🔍 Closest node found:",
        closestNode?.id,
        "at distance:",
        minDistance
      );
      return closestNode;
    },
    [getInternalNode, calculateDistance]
  );

  // Create a proximity connection object
  const createProximityConnection = useCallback(
    (
      draggedNode: WorkflowNode,
      targetNode: WorkflowNode
    ): ProximityConnection | null => {
      if (!draggedNode || !targetNode) {
        return null;
      }

      const draggedInternalNode = getInternalNode(draggedNode.id);
      const targetInternalNode = getInternalNode(targetNode.id);

      if (
        !draggedInternalNode?.internals?.positionAbsolute ||
        !targetInternalNode?.internals?.positionAbsolute
      ) {
        return null;
      }

      // Determine connection direction based on relative positions
      const draggedPos = draggedInternalNode.internals.positionAbsolute;
      const targetPos = targetInternalNode.internals.positionAbsolute;

      // If dragged node is to the left of target, it should be the source
      const draggedIsSource = draggedPos.x < targetPos.x;

      const connection: ProximityConnection = {
        id: draggedIsSource
          ? `proximity-${draggedNode.id}-${targetNode.id}`
          : `proximity-${targetNode.id}-${draggedNode.id}`,
        source: draggedIsSource ? draggedNode.id : targetNode.id,
        target: draggedIsSource ? targetNode.id : draggedNode.id,
      };

      return connection;
    },
    [getInternalNode]
  );

  // Check if connection already exists
  const connectionExists = useCallback(
    (connection: ProximityConnection) => {
      return edges.some(
        (edge) =>
          (edge.source === connection.source &&
            edge.target === connection.target) ||
          (edge.source === connection.target &&
            edge.target === connection.source)
      );
    },
    [edges]
  );

  // Update proximity state for visual feedback
  const updateProximityState = useCallback(
    (
      draggedNode: WorkflowNode | null,
      targetNode: WorkflowNode | null,
      isActive: boolean
    ) => {
      setProximityState({
        draggedNode,
        targetNode,
        isActive,
      });
    },
    []
  );

  // Clear proximity state
  const clearProximityState = useCallback(() => {
    setProximityState({
      draggedNode: null,
      targetNode: null,
      isActive: false,
    });
  }, []);

  // Add temporary edge during dragging
  const addTemporaryEdge = useCallback(
    (
      connection: ProximityConnection,
      draggedNode: WorkflowNode,
      targetNode: WorkflowNode
    ) => {
      // Remove any existing temporary edges
      const nonTempEdges = edges.filter(
        (edge) => edge.className !== "proximity-temp"
      );

      // Add the new temporary edge
      const tempEdge = {
        ...connection,
        className: "proximity-temp",
        animated: true,
        style: {
          strokeDasharray: "5,5",
          strokeWidth: 3,
          stroke: "hsl(var(--primary))",
          opacity: 0.6,
        },
        data: {
          isTemporary: true,
        },
      };

      setEdges([...nonTempEdges, tempEdge]);

      // Update proximity state for visual feedback
      updateProximityState(draggedNode, targetNode, true);
    },
    [edges, setEdges, updateProximityState]
  );

  // Remove temporary edges
  const removeTemporaryEdges = useCallback(() => {
    setEdges(edges.filter((edge) => edge.className !== "proximity-temp"));
    clearProximityState();
  }, [edges, setEdges, clearProximityState]);

  // Finalize connection (make it permanent)
  const finalizeConnection = useCallback(
    (connection: ProximityConnection) => {
      // Remove temporary edges
      const nonTempEdges = edges.filter(
        (edge) => edge.className !== "proximity-temp"
      );

      // Add permanent edge if it doesn't already exist
      if (!connectionExists(connection)) {
        const permanentEdge = {
          ...connection,
          className: undefined,
          animated: false,
          style: {
            strokeWidth: 3,
            stroke: "hsl(var(--primary))",
          },
          data: {
            isProximityGenerated: true,
          },
        };

        setEdges([...nonTempEdges, permanentEdge]);
        return true; // Connection was created
      } else {
        setEdges(nonTempEdges);
        return false; // Connection already existed
      }
    },
    [edges, setEdges, connectionExists]
  );

  return {
    getClosestNode,
    createProximityConnection,
    addTemporaryEdge,
    removeTemporaryEdges,
    finalizeConnection,
    connectionExists,
    updateProximityState,
    clearProximityState,
    proximityState,
    MIN_DISTANCE,
  };
}
