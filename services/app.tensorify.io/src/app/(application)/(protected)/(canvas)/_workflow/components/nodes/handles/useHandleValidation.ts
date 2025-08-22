/**
 * React hook for managing handle validation and connection states
 */

import { useCallback, useMemo } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  validateConnection,
  validateHandleInput,
  ValidationResult,
  ConnectionValidationParams,
  validateVariableProviderConnection,
} from "./HandleValidation";
import {
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";
import { useUIEngine } from "../../../engine/ui-engine";
import useAppStore from "@/app/_store/store";

export interface HandleConnectionState {
  isConnected: boolean;
  connectedTo: string[];
  validationState: ValidationResult;
}

export interface UseHandleValidationReturn {
  validateHandleConnection: (params: ConnectionValidationParams) => boolean;
  getHandleValidationState: (
    nodeId: string,
    handleId: string
  ) => HandleConnectionState;
  validateNodeInputs: (
    nodeId: string,
    inputHandles: InputHandle[],
    nodeData: any
  ) => Record<string, ValidationResult>;
  isConnectionValid: (connection: any) => boolean;
}

/**
 * Hook for managing handle validation across the workflow
 */
export function useHandleValidation(): UseHandleValidationReturn {
  const { getNodes, getEdges } = useReactFlow();
  const uiEngine = useUIEngine();
  const pluginManifests = useAppStore((state) => state.pluginManifests);

  /**
   * Validates a potential connection between two handles
   */
  const validateHandleConnection = useCallback(
    (params: ConnectionValidationParams): boolean => {
      const nodes = getNodes();

      // Find source and target nodes
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (!sourceNode || !targetNode) {
        return false;
      }

      // Use the new variable provider validation with local variables
      const validationResult = validateVariableProviderConnection(
        params,
        sourceNode,
        targetNode,
        (uiEngine as any).localVariableDetailsByNodeId ||
          uiEngine.availableVariableDetailsByNodeId,
        pluginManifests
      );

      return validationResult.isValid;
    },
    [
      getNodes,
      uiEngine.availableVariableDetailsByNodeId,
      (uiEngine as any).localVariableDetailsByNodeId,
      pluginManifests,
    ]
  );

  /**
   * Gets the current connection and validation state for a handle
   */
  const getHandleValidationState = useCallback(
    (nodeId: string, handleId: string): HandleConnectionState => {
      const edges = getEdges();
      const nodes = getNodes();

      // Find connected edges
      const connectedEdges = edges.filter(
        (edge) =>
          (edge.source === nodeId && edge.sourceHandle === handleId) ||
          (edge.target === nodeId && edge.targetHandle === handleId)
      );

      const connectedTo = connectedEdges.map((edge) =>
        edge.source === nodeId ? edge.target : edge.source
      );

      // Basic validation state (can be enhanced with real-time validation)
      const validationState: ValidationResult = {
        isValid: true,
        errors: [],
      };

      return {
        isConnected: connectedEdges.length > 0,
        connectedTo,
        validationState,
      };
    },
    [getNodes, getEdges]
  );

  /**
   * Validates all input handles for a node against current data
   */
  const validateNodeInputs = useCallback(
    (
      nodeId: string,
      inputHandles: InputHandle[],
      nodeData: any
    ): Record<string, ValidationResult> => {
      const results: Record<string, ValidationResult> = {};

      inputHandles.forEach((handle) => {
        const value = nodeData?.[handle.id];
        results[handle.id] = validateHandleInput(value, handle);
      });

      return results;
    },
    []
  );

  /**
   * Validates if a connection is valid (for ReactFlow's isValidConnection)
   */
  const isConnectionValid = useCallback(
    (connection: any): boolean => {
      const params: ConnectionValidationParams = {
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        target: connection.target,
        targetHandle: connection.targetHandle,
      };

      return validateHandleConnection(params);
    },
    [validateHandleConnection]
  );

  return {
    validateHandleConnection,
    getHandleValidationState,
    validateNodeInputs,
    isConnectionValid,
  };
}

/**
 * Hook for getting handle-specific validation feedback
 */
export function useHandleState(nodeId: string, handleId: string) {
  const { getHandleValidationState } = useHandleValidation();

  const handleState = useMemo(
    () => getHandleValidationState(nodeId, handleId),
    [getHandleValidationState, nodeId, handleId]
  );

  return handleState;
}
