import { useEffect, useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { useDebounce } from "./useDebounce";
import { Workflow } from "@/app/_store/store";
import useWorkflowStore from "../store/workflowStore";

interface UseWorkflowPersistenceProps {
  workflow: Workflow;
  debounceDelay?: number;
}

export function useWorkflowPersistence({
  workflow,
  debounceDelay = 1000,
}: UseWorkflowPersistenceProps) {
  const { getNodes, getEdges, setNodes, setEdges, setViewport } =
    useReactFlow();
  const isMounted = useRef(false);
  const isLoadingState = useRef(false);

  // Create a debounced save function
  const saveWorkflowState = useCallback(async () => {
    if (!workflow.version?.id || isLoadingState.current) {
      return;
    }

    const currentNodes = getNodes();
    const currentEdges = getEdges();

    const viewport = {
      x: 0,
      y: 0,
      zoom: 1,
    };

    const code = {
      nodes: currentNodes,
      edges: currentEdges,
      viewport,
    };

    try {
      const response = await fetch(
        `/api/v1/workflow/${workflow.id}/version/${workflow.version.id}/code`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      if (!response.ok) {
        console.error("Failed to save workflow state:", await response.text());
      } else {
        console.log("Workflow state saved successfully");
      }
    } catch (error) {
      console.error("Error saving workflow state:", error);
    }
  }, [workflow.id, workflow.version?.id, getNodes, getEdges]);

  // Debounce the save function
  const debouncedSave = useDebounce(saveWorkflowState, debounceDelay);

  // Get nodes and edges from the store to track changes
  const { nodes, edges } = useWorkflowStore();

  // Load workflow state on mount
  useEffect(() => {
    if (!isMounted.current && workflow.version?.code) {
      isLoadingState.current = true;

      const code = workflow.version.code as {
        nodes?: any[];
        edges?: any[];
        viewport?: { x: number; y: number; zoom: number };
      };

      if (code.nodes && Array.isArray(code.nodes)) {
        setNodes(code.nodes);
      }

      if (code.edges && Array.isArray(code.edges)) {
        setEdges(code.edges);
      }

      if (code.viewport) {
        setViewport(code.viewport);
      }

      // Mark as loaded after a short delay to prevent immediate save
      setTimeout(() => {
        isLoadingState.current = false;
        isMounted.current = true;
      }, 100);
    }
  }, [workflow.version?.code, setNodes, setEdges, setViewport]);

  // Save on changes (after initial load)
  useEffect(() => {
    if (isMounted.current && !isLoadingState.current) {
      debouncedSave();
    }
  }, [nodes, edges, debouncedSave]);

  return {
    isSaving: false, // Could be enhanced with loading state
  };
}
