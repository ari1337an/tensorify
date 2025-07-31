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
} from "./HandleValidation";
import {
  type InputHandle,
  type OutputHandle,
} from "@packages/sdk/src/types/visual";

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

  /**
   * Validates a potential connection between two handles
   */
  const validateHandleConnection = useCallback(
    (params: ConnectionValidationParams): boolean => {
      const nodes = getNodes();
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return false;

      // Get handle definitions from node data
      const sourceHandles = sourceNode.data?.outputHandles || [];
      const targetHandles = targetNode.data?.inputHandles || [];

      const sourceHandle = sourceHandles.find(
        (h: OutputHandle) => h.id === params.sourceHandle
      );
      const targetHandle = targetHandles.find(
        (h: InputHandle) => h.id === params.targetHandle
      );

      if (!sourceHandle || !targetHandle) return false;

      // Validate the connection
      const validationResult = validateConnection(
        sourceHandle,
        targetHandle,
        params
      );
      return validationResult.isValid;
    },
    [getNodes]
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
