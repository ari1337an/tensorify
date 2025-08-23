/**
 * Shape IntelliSense System for Workflow UI Engine
 *
 * This module enhances the UI engine with tensor shape calculation,
 * validation, and intellisense features for workflow nodes.
 */

import {
  ShapeCalculator,
  ShapeCalculationContext,
  CalculatedTensorShape,
  ShapeValidationResult,
} from "./ShapeCalculator";
import { TensorShape } from "@tensorify.io/sdk";

/**
 * Node shape information
 */
export interface NodeShapeInfo {
  nodeId: string;
  /** Calculated output shapes by variable name */
  outputShapes: Record<string, CalculatedTensorShape>;
  /** Expected input shapes by handle ID */
  expectedInputShapes: Record<string, CalculatedTensorShape>;
  /** Shape validation errors */
  shapeErrors: string[];
}

/**
 * Connection validation result with shape information
 */
export interface ConnectionShapeValidation {
  isValid: boolean;
  message: string;
  outputShape?: CalculatedTensorShape;
  expectedShape?: CalculatedTensorShape;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
}

/**
 * Handle hover information for intellisense
 */
export interface HandleHoverInfo {
  handleId: string;
  nodeId: string;
  isInput: boolean;
  shape?: CalculatedTensorShape;
  validationResult?: ShapeValidationResult;
  connections: ConnectionInfo[];
}

/**
 * Connection information
 */
export interface ConnectionInfo {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
  isValid: boolean;
  validationMessage: string;
}

/**
 * Shape IntelliSense Manager
 */
export class ShapeIntelliSenseManager {
  private nodeShapeCache = new Map<string, NodeShapeInfo>();
  private connectionValidationCache = new Map<
    string,
    ConnectionShapeValidation
  >();

  /**
   * Calculate shapes for all nodes in the workflow
   */
  calculateAllNodeShapes(
    nodes: any[],
    edges: any[],
    pluginManifests: any[]
  ): Map<string, NodeShapeInfo> {
    this.nodeShapeCache.clear();

    // Create dependency graph to process nodes in correct order
    const processed = new Set<string>();
    const processing = new Set<string>();

    const processNode = (nodeId: string): void => {
      if (processed.has(nodeId) || processing.has(nodeId)) {
        return; // Already processed or currently processing (circular dependency)
      }

      processing.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        processing.delete(nodeId);
        return;
      }

      // First process all input dependencies
      const inputEdges = edges.filter((e) => e.target === nodeId);
      for (const edge of inputEdges) {
        if (!processed.has(edge.source)) {
          processNode(edge.source);
        }
      }

      // Now calculate this node's shapes
      const shapeInfo = this.calculateNodeShapes(node, edges, pluginManifests);
      this.nodeShapeCache.set(nodeId, shapeInfo);

      processing.delete(nodeId);
      processed.add(nodeId);
    };

    // Process all nodes
    for (const node of nodes) {
      processNode(node.id);
    }

    return this.nodeShapeCache;
  }

  /**
   * Calculate shapes for a specific node
   */
  calculateNodeShapes(
    node: any,
    edges: any[],
    pluginManifests: any[]
  ): NodeShapeInfo {
    const shapeInfo: NodeShapeInfo = {
      nodeId: node.id,
      outputShapes: {},
      expectedInputShapes: {},
      shapeErrors: [],
    };

    try {
      // Get plugin manifest for this node
      const manifest = this.getNodeManifest(node, pluginManifests);
      if (!manifest) {
        shapeInfo.shapeErrors.push(
          `No manifest found for node type: ${node.type}`
        );
        return shapeInfo;
      }

      // Create shape calculation context
      const context = this.createShapeContext(node, edges);

      // Calculate expected input shapes
      this.calculateExpectedInputShapes(manifest, context, shapeInfo);

      // Calculate output shapes from emitted variables
      this.calculateOutputShapes(manifest, context, shapeInfo);
    } catch (error) {
      shapeInfo.shapeErrors.push(
        `Shape calculation error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return shapeInfo;
  }

  /**
   * Validate connection between two handles
   */
  validateConnection(
    sourceNodeId: string,
    sourceHandle: string,
    targetNodeId: string,
    targetHandle: string,
    edges: any[]
  ): ConnectionShapeValidation {
    const cacheKey = `${sourceNodeId}:${sourceHandle}->${targetNodeId}:${targetHandle}`;

    // Check cache first
    if (this.connectionValidationCache.has(cacheKey)) {
      return this.connectionValidationCache.get(cacheKey)!;
    }

    const sourceShapeInfo = this.nodeShapeCache.get(sourceNodeId);
    const targetShapeInfo = this.nodeShapeCache.get(targetNodeId);

    const validation: ConnectionShapeValidation = {
      isValid: true,
      message: "No shape validation (shape info not available)",
      sourceNodeId,
      targetNodeId,
      sourceHandle,
      targetHandle,
    };

    if (!sourceShapeInfo || !targetShapeInfo) {
      validation.message = "Shape information not available for validation";
      this.connectionValidationCache.set(cacheKey, validation);
      return validation;
    }

    // Get output shape from source
    const outputShape = this.getOutputShapeForHandle(
      sourceShapeInfo,
      sourceHandle
    );

    // Get expected input shape from target
    const expectedShape = targetShapeInfo.expectedInputShapes[targetHandle];

    if (!outputShape || !expectedShape) {
      validation.message = "Shape information incomplete";
      this.connectionValidationCache.set(cacheKey, validation);
      return validation;
    }

    // Validate shape compatibility
    const result = ShapeCalculator.validateShapeCompatibility(
      outputShape,
      expectedShape
    );

    validation.isValid = result.isValid;
    validation.message = result.message;
    validation.outputShape = outputShape;
    validation.expectedShape = expectedShape;

    this.connectionValidationCache.set(cacheKey, validation);
    return validation;
  }

  /**
   * Get hover information for a handle
   */
  getHandleHoverInfo(
    nodeId: string,
    handleId: string,
    isInput: boolean,
    edges: any[]
  ): HandleHoverInfo {
    const shapeInfo = this.nodeShapeCache.get(nodeId);
    const connections: ConnectionInfo[] = [];

    // Find connected edges
    const connectedEdges = edges.filter((edge) =>
      isInput
        ? edge.target === nodeId && edge.targetHandle === handleId
        : edge.source === nodeId && edge.sourceHandle === handleId
    );

    // Build connection information
    for (const edge of connectedEdges) {
      const validation = this.validateConnection(
        edge.source,
        edge.sourceHandle,
        edge.target,
        edge.targetHandle,
        edges
      );

      connections.push({
        edgeId: edge.id,
        sourceNodeId: edge.source,
        targetNodeId: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        isValid: validation.isValid,
        validationMessage: validation.message,
      });
    }

    // Get shape information
    let shape: CalculatedTensorShape | undefined;
    if (shapeInfo) {
      if (isInput) {
        shape = shapeInfo.expectedInputShapes[handleId];
      } else {
        shape = this.getOutputShapeForHandle(shapeInfo, handleId);
      }
    }

    return {
      handleId,
      nodeId,
      isInput,
      shape,
      connections,
    };
  }

  /**
   * Get output shape for a handle (maps handle to emitted variable)
   */
  public getOutputShapeForHandle(
    shapeInfo: NodeShapeInfo,
    handleId: string
  ): CalculatedTensorShape | undefined {
    // Direct mapping first
    if (shapeInfo.outputShapes[handleId]) {
      return shapeInfo.outputShapes[handleId];
    }

    // Convention-based mapping
    const conventionMappings: Record<string, string[]> = {
      linear_output: ["linear_layer", "linear"],
      conv_output: ["conv2d", "conv_layer"],
      relu_output: ["relu"],
      model_output: ["model"],
    };

    const possibleNames = conventionMappings[handleId] || [handleId];
    for (const name of possibleNames) {
      if (shapeInfo.outputShapes[name]) {
        return shapeInfo.outputShapes[name];
      }
    }

    // Take the first available output shape as fallback
    const outputShapes = Object.values(shapeInfo.outputShapes);
    return outputShapes.length > 0 ? outputShapes[0] : undefined;
  }

  /**
   * Create shape calculation context for a node
   */
  private createShapeContext(node: any, edges: any[]): ShapeCalculationContext {
    // Plugin nodes store settings in pluginSettings, native nodes in settings
    const nodeSettings = node.data?.pluginSettings || node.data?.settings || {};

    const context: ShapeCalculationContext = {
      settings: nodeSettings,
      inputs: {},
      nodeType: node.type || "unknown",
    };

    // Debug: Uncomment for troubleshooting shape calculation issues
    // console.log(`🔍 Shape context for node ${node.id}:`, {
    //   nodeType: node.type,
    //   settings: nodeSettings,
    //   hasPluginSettings: !!node.data?.pluginSettings,
    //   hasRegularSettings: !!node.data?.settings,
    // });

    // Collect input shapes from connected edges
    const inputEdges = edges.filter((e) => e.target === node.id);
    for (const edge of inputEdges) {
      const sourceShapeInfo = this.nodeShapeCache.get(edge.source);
      if (sourceShapeInfo) {
        const outputShape = this.getOutputShapeForHandle(
          sourceShapeInfo,
          edge.sourceHandle
        );
        if (outputShape) {
          context.inputs[edge.targetHandle] = outputShape;
        }
      }
    }

    return context;
  }

  /**
   * Get plugin manifest for a node
   */
  private getNodeManifest(node: any, pluginManifests: any[]): any {
    const pluginId = node.data?.pluginId || node.type;
    return pluginManifests.find(
      (p) => p.slug === pluginId || p.id === pluginId || p.name === pluginId
    );
  }

  /**
   * Calculate expected input shapes for a node
   */
  private calculateExpectedInputShapes(
    manifest: any,
    context: ShapeCalculationContext,
    shapeInfo: NodeShapeInfo
  ): void {
    const inputHandles =
      manifest.manifest?.frontendConfigs?.inputHandles ||
      manifest.manifest?.inputHandles ||
      [];

    for (const handle of inputHandles) {
      if (handle.expectedShape) {
        try {
          const calculatedShape = ShapeCalculator.calculateShape(
            handle.expectedShape,
            context
          );
          shapeInfo.expectedInputShapes[handle.id] = calculatedShape;
        } catch (error) {
          shapeInfo.shapeErrors.push(
            `Input shape calculation failed for handle ${handle.id}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  /**
   * Calculate output shapes from emitted variables
   */
  private calculateOutputShapes(
    manifest: any,
    context: ShapeCalculationContext,
    shapeInfo: NodeShapeInfo
  ): void {
    // Try multiple paths for emitted variables based on the InstalledPluginRecord structure
    let emittedVariables: any[] = [];

    // For InstalledPluginRecord structure: manifest.manifest.emits.variables
    if (manifest?.manifest?.emits?.variables) {
      emittedVariables = manifest.manifest.emits.variables;
    }
    // Fallback: direct manifest access (for processed manifests)
    else if (manifest?.emits?.variables) {
      emittedVariables = manifest.emits.variables;
    }
    // Alternative structure checks
    else if (manifest?.visual?.emits?.variables) {
      emittedVariables = manifest.visual.emits.variables;
    } else if (manifest?.manifest?.visual?.emits?.variables) {
      emittedVariables = manifest.manifest.visual.emits.variables;
    }

    for (const variable of emittedVariables) {
      if (variable.shape) {
        try {
          const calculatedShape = ShapeCalculator.calculateShape(
            variable.shape,
            context
          );
          shapeInfo.outputShapes[variable.value] = calculatedShape;
        } catch (error) {
          shapeInfo.shapeErrors.push(
            `Output shape calculation failed for variable ${variable.value}: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.nodeShapeCache.clear();
    this.connectionValidationCache.clear();
  }

  /**
   * Get all shape information for debugging
   */
  getDebugInfo(): {
    nodeShapes: Record<string, NodeShapeInfo>;
    connectionValidations: Record<string, ConnectionShapeValidation>;
  } {
    return {
      nodeShapes: Object.fromEntries(this.nodeShapeCache),
      connectionValidations: Object.fromEntries(this.connectionValidationCache),
    };
  }
}
