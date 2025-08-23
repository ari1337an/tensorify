/**
 * Server-side tensor shape validation logic
 *
 * This is a simplified version of the shape intellisense system
 * specifically designed for API endpoints.
 */

interface TensorShape {
  type: "static" | "dynamic" | "passthrough" | "conditional";
  dimensions: (string | number)[];
  passthroughSource?: string;
  description?: string;
}

interface CalculatedTensorShape {
  dimensions: number[];
  description: string;
  source: string;
}

interface ShapeValidationResult {
  isValid: boolean;
  message: string;
  outputShape?: CalculatedTensorShape;
  expectedShape?: CalculatedTensorShape;
}

interface NodeShapeInfo {
  nodeId: string;
  outputShapes: Record<string, CalculatedTensorShape>;
  expectedInputShapes: Record<string, CalculatedTensorShape>;
  shapeErrors: string[];
}

export class ServerShapeValidator {
  private nodeShapeCache = new Map<string, NodeShapeInfo>();

  /**
   * Calculate shapes for all nodes in the workflow
   */
  calculateAllNodeShapes(
    nodes: any[],
    edges: any[],
    pluginManifests: any[]
  ): Map<string, NodeShapeInfo> {
    this.nodeShapeCache.clear();

    // Process nodes in dependency order
    const processed = new Set<string>();
    const processing = new Set<string>();

    const processNode = (nodeId: string): void => {
      if (processed.has(nodeId) || processing.has(nodeId)) {
        return;
      }

      processing.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        processing.delete(nodeId);
        return;
      }

      // Process input dependencies first
      const inputEdges = edges.filter((e) => e.target === nodeId);
      for (const edge of inputEdges) {
        if (!processed.has(edge.source)) {
          processNode(edge.source);
        }
      }

      // Calculate this node's shapes
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
   * Calculate shapes for a single node
   */
  private calculateNodeShapes(
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
      const manifest = this.getNodeManifest(node, pluginManifests);
      if (!manifest) {
        shapeInfo.shapeErrors.push(
          `No manifest found for node type: ${node.type}`
        );
        return shapeInfo;
      }

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
   * Validate connection shape compatibility
   */
  validateConnection(
    sourceNodeId: string,
    sourceHandle: string,
    targetNodeId: string,
    targetHandle: string,
    edges: any[]
  ): ShapeValidationResult {
    const sourceShapeInfo = this.nodeShapeCache.get(sourceNodeId);
    const targetShapeInfo = this.nodeShapeCache.get(targetNodeId);

    if (!sourceShapeInfo || !targetShapeInfo) {
      return {
        isValid: true,
        message: "No shape information available for validation",
      };
    }

    // Get output shape from source
    const outputShape = this.getOutputShapeForHandle(
      sourceShapeInfo,
      sourceHandle
    );

    // Get expected input shape from target
    const expectedShape = targetShapeInfo.expectedInputShapes[targetHandle];

    if (!outputShape || !expectedShape) {
      return {
        isValid: true,
        message: "Shapes not available for comparison",
      };
    }

    // Validate shape compatibility
    return this.validateShapeCompatibility(outputShape, expectedShape);
  }

  /**
   * Validate that two shapes are compatible
   */
  private validateShapeCompatibility(
    outputShape: CalculatedTensorShape,
    expectedInputShape: CalculatedTensorShape
  ): ShapeValidationResult {
    try {
      // Check if dimensions match
      if (
        outputShape.dimensions.length !== expectedInputShape.dimensions.length
      ) {
        return {
          isValid: false,
          message: `Dimension mismatch: Output has ${outputShape.dimensions.length}D shape but input expects ${expectedInputShape.dimensions.length}D shape`,
          outputShape,
          expectedShape: expectedInputShape,
        };
      }

      // Check each dimension
      for (let i = 0; i < outputShape.dimensions.length; i++) {
        const outputDim = outputShape.dimensions[i];
        const expectedDim = expectedInputShape.dimensions[i];

        // -1 means "any size" (like batch dimension) - always compatible
        if (outputDim === -1 || expectedDim === -1) {
          continue;
        }

        // Exact match required for feature dimensions
        if (outputDim !== expectedDim) {
          return {
            isValid: false,
            message: `Shape mismatch at dimension ${i}: Output has size ${outputDim} but input expects ${expectedDim}`,
            outputShape,
            expectedShape: expectedInputShape,
          };
        }
      }

      return {
        isValid: true,
        message: `✅ Shape compatible: ${this.formatShape(outputShape)} → ${this.formatShape(expectedInputShape)}`,
        outputShape,
        expectedShape: expectedInputShape,
      };
    } catch (error) {
      return {
        isValid: false,
        message: `Shape validation error: ${error instanceof Error ? error.message : String(error)}`,
        outputShape,
        expectedShape: expectedInputShape,
      };
    }
  }

  /**
   * Get output shape for a specific handle
   */
  private getOutputShapeForHandle(
    shapeInfo: NodeShapeInfo,
    handleId: string
  ): CalculatedTensorShape | undefined {
    // Try direct variable mapping first
    if (shapeInfo.outputShapes[handleId]) {
      return shapeInfo.outputShapes[handleId];
    }

    // Convention-based mapping for common handle names
    const conventionMappings: Record<string, string[]> = {
      next: ["linear_layer", "relu", "conv2d", "model_output"],
      output: ["linear_layer", "relu", "conv2d"],
      dataloader_out: ["dataloader"],
      dataset_out: ["cifar10_dataset", "dataset"],
    };

    const possibleVariables = conventionMappings[handleId] || [];
    for (const varName of possibleVariables) {
      if (shapeInfo.outputShapes[varName]) {
        return shapeInfo.outputShapes[varName];
      }
    }

    return undefined;
  }

  /**
   * Calculate expected input shapes
   */
  private calculateExpectedInputShapes(
    manifest: any,
    context: any,
    shapeInfo: NodeShapeInfo
  ): void {
    const inputHandles = manifest.manifest?.inputHandles || [];

    for (const handle of inputHandles) {
      if (handle.expectedShape) {
        try {
          const calculatedShape = this.calculateShape(
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
    context: any,
    shapeInfo: NodeShapeInfo
  ): void {
    const variables = manifest.manifest?.emits?.variables || [];

    for (const variable of variables) {
      if (variable.shape) {
        try {
          const calculatedShape = this.calculateShape(variable.shape, context);
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
   * Calculate tensor shape based on definition and context
   */
  private calculateShape(
    shapeDefinition: TensorShape,
    context: any
  ): CalculatedTensorShape {
    try {
      switch (shapeDefinition.type) {
        case "static":
          return this.calculateStaticShape(shapeDefinition);
        case "dynamic":
          return this.calculateDynamicShape(shapeDefinition, context);
        case "passthrough":
          return this.calculatePassthroughShape(shapeDefinition, context);
        case "conditional":
          return this.calculateConditionalShape(shapeDefinition, context);
        default:
          throw new Error(`Unknown shape type: ${shapeDefinition.type}`);
      }
    } catch (error) {
      return {
        dimensions: [-1],
        description: "Unknown shape (calculation failed)",
        source: "error",
      };
    }
  }

  /**
   * Calculate static shape
   */
  private calculateStaticShape(
    shapeDefinition: TensorShape
  ): CalculatedTensorShape {
    const dimensions: number[] = [];

    for (const dimension of shapeDefinition.dimensions) {
      if (typeof dimension === "number") {
        dimensions.push(dimension);
      } else if (typeof dimension === "string") {
        if (dimension === "N" || dimension === "B") {
          dimensions.push(-1); // Batch size placeholder
        } else {
          const parsed = parseInt(dimension);
          dimensions.push(isNaN(parsed) ? -1 : parsed);
        }
      }
    }

    return {
      dimensions,
      description: shapeDefinition.description || "Static tensor shape",
      source: "static",
    };
  }

  /**
   * Calculate dynamic shape
   */
  private calculateDynamicShape(
    shapeDefinition: TensorShape,
    context: any
  ): CalculatedTensorShape {
    const dimensions: number[] = [];

    for (const dimension of shapeDefinition.dimensions) {
      if (typeof dimension === "number") {
        dimensions.push(dimension);
      } else if (typeof dimension === "string") {
        const calculatedValue = this.evaluateTemplateString(dimension, context);
        dimensions.push(calculatedValue);
      } else {
        dimensions.push(-1);
      }
    }

    return {
      dimensions,
      description: shapeDefinition.description || "Dynamic tensor shape",
      source: "dynamic",
    };
  }

  /**
   * Calculate passthrough shape
   */
  private calculatePassthroughShape(
    shapeDefinition: TensorShape,
    context: any
  ): CalculatedTensorShape {
    const sourceHandle = shapeDefinition.passthroughSource;
    if (!sourceHandle) {
      throw new Error("Passthrough shape missing source handle");
    }

    const inputShape = context.inputs[sourceHandle];
    if (!inputShape) {
      return {
        dimensions: [-1],
        description: `Passthrough from ${sourceHandle} (input not connected)`,
        source: "passthrough-missing",
      };
    }

    return {
      dimensions: [...inputShape.dimensions],
      description: shapeDefinition.description || `Same as ${sourceHandle}`,
      source: `passthrough-${sourceHandle}`,
    };
  }

  /**
   * Calculate conditional shape (simplified)
   */
  private calculateConditionalShape(
    shapeDefinition: TensorShape,
    context: any
  ): CalculatedTensorShape {
    // Simplified conditional logic - just return first dimension
    return {
      dimensions: [-1],
      description: shapeDefinition.description || "Conditional shape",
      source: "conditional",
    };
  }

  /**
   * Evaluate template strings like {settings.outFeatures}
   */
  private evaluateTemplateString(template: string, context: any): number {
    if (template === "N" || template === "B") {
      return -1;
    }

    // Settings reference: {settings.outFeatures}
    const settingsMatch = template.match(/^\{settings\.([^}]+)\}$/);
    if (settingsMatch) {
      const settingKey = settingsMatch[1];
      const value = context.settings?.[settingKey];
      return this.parseNumericValue(value);
    }

    // Input shape reference: {input.input_tensor.shape[0]}
    const inputShapeMatch = template.match(
      /^\{input\.([^.]+)\.shape\[(\d+)\]\}$/
    );
    if (inputShapeMatch) {
      const handleId = inputShapeMatch[1];
      const dimIndex = parseInt(inputShapeMatch[2]);
      const inputShape = context.inputs[handleId];
      return inputShape?.dimensions?.[dimIndex] ?? -1;
    }

    // Try to parse as literal number
    const literalValue = this.parseNumericValue(template);
    return literalValue !== -1 ? literalValue : -1;
  }

  /**
   * Parse numeric value safely
   */
  private parseNumericValue(value: any): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? -1 : parsed;
    }

    return -1;
  }

  /**
   * Create shape calculation context for a node
   */
  private createShapeContext(node: any, edges: any[]): any {
    const context: any = {
      settings: node.data?.pluginSettings || {},
      inputs: {} as Record<string, any>,
      nodeType: node.type || "unknown",
    };

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
   * Get node manifest
   */
  private getNodeManifest(node: any, pluginManifests: any[]): any {
    const pluginId = node.data?.pluginId || node.type;
    return pluginManifests.find(
      (p) => p.slug === pluginId || p.id === pluginId || p.name === pluginId
    );
  }

  /**
   * Format shape for display
   */
  private formatShape(shape: CalculatedTensorShape): string {
    const dimStr = shape.dimensions
      .map((d) => (d === -1 ? "N" : d.toString()))
      .join(", ");
    return `(${dimStr})`;
  }
}
