import { useEffect, useCallback, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { useDebounce } from "./useDebounce";
import { Workflow } from "@/app/_store/store";
import useWorkflowStore from "../store/workflowStore";
import useAppStore from "@/app/_store/store";
import { useShallow } from "zustand/react/shallow";

interface UseWorkflowPersistenceProps {
  workflow: Workflow;
  debounceDelay?: number;
}

export function useWorkflowPersistence({
  workflow,
  debounceDelay = 1000,
}: UseWorkflowPersistenceProps) {
  const { getNodes, getEdges, setViewport } = useReactFlow();
  const isLoadingState = useRef(false);
  const lastWorkflowId = useRef<string | null>(null);

  // Get workflow store methods and state
  const {
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    nodes: storeNodes,
    edges: storeEdges,
    isSaving,
    lastSavedAt,
    setSaving,
    setLastSavedAt,
  } = useWorkflowStore(
    useShallow((state) => ({
      setNodes: state.setNodes,
      setEdges: state.setEdges,
      nodes: state.nodes,
      edges: state.edges,
      isSaving: state.isSaving,
      lastSavedAt: state.lastSavedAt,
      setSaving: state.setSaving,
      setLastSavedAt: state.setLastSavedAt,
    }))
  );

  // Removed setCurrentWorkflow to prevent re-render loops

  // Create a debounced save function
  const saveWorkflowState = useCallback(async () => {
    if (!workflow.version?.id || isLoadingState.current) {
      return;
    }

    setSaving(true);

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
        // console.error("Failed to save workflow state:", await response.text());
      } else {
        // console.log("Workflow state saved successfully");
        setLastSavedAt(new Date());
      }
    } catch (error) {
      console.error("Error saving workflow state:", error);
    } finally {
      setSaving(false);
    }
  }, [
    workflow.id,
    workflow.version?.id,
    getNodes,
    getEdges,
    setSaving,
    setLastSavedAt,
  ]);

  // Debounce the save function
  const debouncedSave = useDebounce(saveWorkflowState, debounceDelay);

  // Load workflow state when workflow changes
  useEffect(() => {
    // Check if this is a new workflow
    if (workflow.id !== lastWorkflowId.current) {
      isLoadingState.current = true;
      lastWorkflowId.current = workflow.id;

      // Clear the current state first
      setStoreNodes([]);
      setStoreEdges([]);

      // Load new workflow state if available
      if (workflow.version?.code) {
        const code = workflow.version.code as {
          nodes?: any[];
          edges?: any[];
          viewport?: { x: number; y: number; zoom: number };
        };

        if (code.nodes && Array.isArray(code.nodes)) {
          setStoreNodes(code.nodes);
        }

        if (code.edges && Array.isArray(code.edges)) {
          setStoreEdges(code.edges);
        }

        if (code.viewport) {
          setViewport(code.viewport);
        }
      }

      // Mark as loaded after a short delay to prevent immediate save
      setTimeout(() => {
        isLoadingState.current = false;
      }, 100);
    }
  }, [
    workflow.id,
    workflow.version?.code,
    setViewport,
    setStoreNodes,
    setStoreEdges,
  ]);

  // Save on changes (after initial load)
  useEffect(() => {
    if (lastWorkflowId.current === workflow.id && !isLoadingState.current) {
      debouncedSave();
    }
  }, [storeNodes, storeEdges, debouncedSave, workflow.id]);

  return {
    // Hook no longer returns state - it's managed in the store
  };
}
