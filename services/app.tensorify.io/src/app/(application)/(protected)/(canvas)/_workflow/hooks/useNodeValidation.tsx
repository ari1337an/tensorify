import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useWorkflowStore, { type WorkflowNode } from "../store/workflowStore";
import { toast } from "sonner";

interface RouteNodeCount {
  route: string;
  startNodes: number;
  endNodes: number;
}

export function useNodeValidation() {
  const { nodes, currentRoute } = useWorkflowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      currentRoute: state.currentRoute,
    }))
  );

  // Calculate node counts per route
  const routeNodeCounts = useMemo(() => {
    const counts: Record<string, RouteNodeCount> = {};

    nodes.forEach((node) => {
      if (!counts[node.route]) {
        counts[node.route] = {
          route: node.route,
          startNodes: 0,
          endNodes: 0,
        };
      }

      if (node.type === "@tensorify/core/StartNode") {
        counts[node.route].startNodes++;
      } else if (node.type === "@tensorify/core/EndNode") {
        counts[node.route].endNodes++;
      }
    });

    return counts;
  }, [nodes]);

  // Get validation status for current route
  const currentRouteValidation = useMemo(() => {
    const currentCounts = routeNodeCounts[currentRoute] || {
      route: currentRoute,
      startNodes: 0,
      endNodes: 0,
    };

    return {
      hasStartNode: currentCounts.startNodes > 0,
      hasMultipleStartNodes: currentCounts.startNodes > 1,
      hasEndNode: currentCounts.endNodes > 0,
      startNodeCount: currentCounts.startNodes,
      endNodeCount: currentCounts.endNodes,
    };
  }, [routeNodeCounts, currentRoute]);

  // Show warnings for validation issues
  useEffect(() => {
    if (currentRouteValidation.hasMultipleStartNodes) {
      toast.error(
        `Route "${currentRoute}" has ${currentRouteValidation.startNodeCount} start nodes. Only one start node is allowed per route.`
      );
    }
  }, [currentRouteValidation, currentRoute]);

  return {
    routeNodeCounts,
    currentRouteValidation,
    isValid:
      currentRouteValidation.hasStartNode &&
      !currentRouteValidation.hasMultipleStartNodes &&
      currentRouteValidation.hasEndNode,
  };
}
