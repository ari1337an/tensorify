/**
 * Shape Calculator for Tensor Shape Intellisense
 *
 * This utility provides safe calculation and validation of tensor shapes
 * based on plugin manifests and node settings, without using eval().
 */

import { TensorShape, ShapeDimension, ShapeCondition } from "@tensorify.io/sdk";

/**
 * Context for shape calculations
 */
export interface ShapeCalculationContext {
  /** Current node settings */
  settings: Record<string, any>;
  /** Input shapes from connected nodes */
  inputs: Record<string, CalculatedTensorShape>;
  /** Node type for context-specific calculations */
  nodeType: string;
}

/**
 * Calculated tensor shape with numeric dimensions
 */
export interface CalculatedTensorShape {
  /** Array of dimension sizes (-1 means "any size" like batch dimension) */
  dimensions: number[];
  /** Human-readable description */
  description?: string;
  /** Source information for debugging */
  source?: string;
}

/**
 * Validation result for shape compatibility
 */
export interface ShapeValidationResult {
  isValid: boolean;
  message: string;
  outputShape?: CalculatedTensorShape;
  expectedShape?: CalculatedTensorShape;
}

/**
 * Shape Calculator class for tensor shape operations
 */
export class ShapeCalculator {
  /**
   * Calculate tensor shape based on definition and context
   */
  static calculateShape(
    shapeDefinition: TensorShape,
    context: ShapeCalculationContext
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
      console.warn(`Shape calculation failed:`, error);
      // Return a fallback shape
      return {
        dimensions: [-1], // Unknown shape
        description: "Unknown shape (calculation failed)",
        source: "error",
      };
    }
  }

  /**
   * Calculate static shape (fixed dimensions)
   */
  private static calculateStaticShape(
    shapeDefinition: TensorShape
  ): CalculatedTensorShape {
    const dimensions: number[] = [];

    for (const dimension of shapeDefinition.dimensions) {
      if (typeof dimension === "number") {
        dimensions.push(dimension);
      } else if (typeof dimension === "string") {
        // Handle special static values
        if (dimension === "N" || dimension === "B") {
          dimensions.push(-1); // Batch size placeholder
        } else {
          // Try to parse as number
          const parsed = parseInt(dimension);
          dimensions.push(isNaN(parsed) ? -1 : parsed);
        }
      } else {
        dimensions.push(-1); // Complex expressions default to unknown
      }
    }

    return {
      dimensions,
      description: shapeDefinition.description || "Static tensor shape",
      source: "static",
    };
  }

  /**
   * Calculate dynamic shape based on settings and inputs
   */
  private static calculateDynamicShape(
    shapeDefinition: TensorShape,
    context: ShapeCalculationContext
  ): CalculatedTensorShape {
    const dimensions: number[] = [];

    for (const dimension of shapeDefinition.dimensions) {
      if (typeof dimension === "number") {
        dimensions.push(dimension);
      } else if (typeof dimension === "string") {
        const calculatedValue = this.evaluateTemplateString(dimension, context);
        dimensions.push(calculatedValue);
      } else if (typeof dimension === "object" && dimension.conditions) {
        const calculatedValue = this.evaluateConditionalExpression(
          dimension,
          context
        );
        dimensions.push(calculatedValue);
      } else {
        dimensions.push(-1); // Unknown
      }
    }

    return {
      dimensions,
      description: shapeDefinition.description || "Dynamic tensor shape",
      source: "dynamic",
    };
  }

  /**
   * Calculate passthrough shape (copy from input)
   */
  private static calculatePassthroughShape(
    shapeDefinition: TensorShape,
    context: ShapeCalculationContext
  ): CalculatedTensorShape {
    const sourceHandle = shapeDefinition.passthroughSource;
    if (!sourceHandle) {
      throw new Error("Passthrough shape missing source handle");
    }

    const inputShape = context.inputs[sourceHandle];
    if (!inputShape) {
      // Return unknown shape if input not available
      return {
        dimensions: [-1],
        description: `Passthrough from ${sourceHandle} (input not connected)`,
        source: "passthrough-missing",
      };
    }

    return {
      dimensions: [...inputShape.dimensions], // Copy dimensions
      description: shapeDefinition.description || `Same as ${sourceHandle}`,
      source: `passthrough-${sourceHandle}`,
    };
  }

  /**
   * Calculate conditional shape
   */
  private static calculateConditionalShape(
    shapeDefinition: TensorShape,
    context: ShapeCalculationContext
  ): CalculatedTensorShape {
    // For conditional shapes, evaluate each dimension independently
    return this.calculateDynamicShape(shapeDefinition, context);
  }

  /**
   * Evaluate template strings like "{settings.outFeatures}"
   */
  private static evaluateTemplateString(
    template: string,
    context: ShapeCalculationContext
  ): number {
    // Handle batch size placeholder
    if (template === "N" || template === "B") {
      return -1; // Special marker for "any batch size"
    }

    // Settings reference: {settings.outFeatures}
    const settingsMatch = template.match(/^\{settings\.([^}]+)\}$/);
    if (settingsMatch) {
      const settingKey = settingsMatch[1];
      const value = this.getNestedValue(context.settings, settingKey);
      const numericValue = this.parseNumericValue(value);

      // Debug: Uncomment for troubleshooting template resolution
      // console.log(`🔧 Settings template "${template}":`, {
      //   settingKey,
      //   rawValue: value,
      //   numericValue,
      //   allSettings: context.settings,
      // });

      return numericValue;
    }

    // Input shape reference: {input.input_tensor.shape[0]}
    const inputShapeMatch = template.match(
      /^\{input\.([^.]+)\.shape\[(\d+)\]\}$/
    );
    if (inputShapeMatch) {
      const handleId = inputShapeMatch[1];
      const dimIndex = parseInt(inputShapeMatch[2]);
      const inputShape = context.inputs[handleId];
      if (inputShape && inputShape.dimensions[dimIndex] !== undefined) {
        return inputShape.dimensions[dimIndex];
      }
      return -1; // Unknown input dimension
    }

    // Mathematical expression with templates
    if (
      template.includes("+") ||
      template.includes("-") ||
      template.includes("*") ||
      template.includes("/")
    ) {
      return this.evaluateMathExpression(template, context);
    }

    // Try to parse as literal number
    const literalValue = this.parseNumericValue(template);
    return literalValue;
  }

  /**
   * Safe mathematical expression evaluator (replaces eval)
   */
  private static evaluateMathExpression(
    expression: string,
    context: ShapeCalculationContext
  ): number {
    try {
      // First, replace all template placeholders
      let processedExpr = expression;

      // Replace settings references
      processedExpr = processedExpr.replace(
        /\{settings\.([^}]+)\}/g,
        (match, settingKey) => {
          const value = this.getNestedValue(context.settings, settingKey);
          return String(this.parseNumericValue(value));
        }
      );

      // Replace input shape references
      processedExpr = processedExpr.replace(
        /\{input\.([^.]+)\.shape\[(\d+)\]\}/g,
        (match, handleId, dimIndex) => {
          const inputShape = context.inputs[handleId];
          const dimValue = inputShape?.dimensions?.[parseInt(dimIndex)] ?? -1;
          return String(dimValue);
        }
      );

      // Now safely evaluate the mathematical expression
      return this.safeMathEval(processedExpr);
    } catch (error) {
      console.warn(
        `Math expression evaluation failed for: ${expression}`,
        error
      );
      return -1; // Return unknown on error
    }
  }

  /**
   * Evaluate conditional expressions
   */
  private static evaluateConditionalExpression(
    expression: { conditions: ShapeCondition[] },
    context: ShapeCalculationContext
  ): number {
    for (const condition of expression.conditions) {
      if (this.evaluateCondition(condition.if, context)) {
        if (typeof condition.then === "number") {
          return condition.then;
        } else if (typeof condition.then === "string") {
          return this.evaluateTemplateString(condition.then, context);
        }
      } else if (condition.else !== undefined) {
        if (typeof condition.else === "number") {
          return condition.else;
        } else if (typeof condition.else === "string") {
          return this.evaluateTemplateString(condition.else, context);
        }
      }
    }

    return -1; // No conditions matched
  }

  /**
   * Evaluate boolean conditions for conditional expressions
   */
  private static evaluateCondition(
    conditionExpr: string,
    context: ShapeCalculationContext
  ): boolean {
    try {
      // Simple boolean settings check: {settings.adaptive_pooling}
      const booleanMatch = conditionExpr.match(/^\{settings\.([^}]+)\}$/);
      if (booleanMatch) {
        const settingKey = booleanMatch[1];
        const value = this.getNestedValue(context.settings, settingKey);
        return Boolean(value);
      }

      // Comparison operations can be added here if needed
      // For now, just return false for unknown conditions
      return false;
    } catch (error) {
      console.warn(`Condition evaluation failed for: ${conditionExpr}`, error);
      return false;
    }
  }

  /**
   * Safe math evaluation without eval() - supports basic arithmetic
   */
  private static safeMathEval(expression: string): number {
    try {
      // Remove whitespace
      const clean = expression.replace(/\s/g, "");

      // Handle floor() function
      const floorMatch = clean.match(/^floor\((.+)\)$/);
      if (floorMatch) {
        return Math.floor(this.safeMathEval(floorMatch[1]));
      }

      // Handle ceil() function
      const ceilMatch = clean.match(/^ceil\((.+)\)$/);
      if (ceilMatch) {
        return Math.ceil(this.safeMathEval(ceilMatch[1]));
      }

      // Handle parentheses (simple case)
      const parenMatch = clean.match(/^\((.+)\)$/);
      if (parenMatch) {
        return this.safeMathEval(parenMatch[1]);
      }

      // Handle basic arithmetic (left-to-right evaluation)
      if (clean.includes("+")) {
        const parts = clean.split("+");
        return parts.reduce((sum, part) => sum + this.safeMathEval(part), 0);
      }

      if (clean.includes("-")) {
        const parts = clean.split("-");
        const first = this.safeMathEval(parts[0]);
        return parts
          .slice(1)
          .reduce((diff, part) => diff - this.safeMathEval(part), first);
      }

      if (clean.includes("*")) {
        const parts = clean.split("*");
        return parts.reduce((prod, part) => prod * this.safeMathEval(part), 1);
      }

      if (clean.includes("/")) {
        const parts = clean.split("/");
        const first = this.safeMathEval(parts[0]);
        return parts.slice(1).reduce((quot, part) => {
          const divisor = this.safeMathEval(part);
          return divisor !== 0 ? quot / divisor : quot;
        }, first);
      }

      // Handle simple numbers
      const num = parseFloat(clean);
      if (!isNaN(num)) {
        return num;
      }

      throw new Error(`Cannot evaluate: ${clean}`);
    } catch (error) {
      console.warn(`Math evaluation failed for: ${expression}`, error);
      return -1; // Return unknown on error
    }
  }

  /**
   * Get nested object value by dot notation path
   */
  private static getNestedValue(obj: any, path: string): any {
    try {
      return path.split(".").reduce((current, key) => current?.[key], obj);
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Parse a value as a number, handling arrays/tuples
   */
  private static parseNumericValue(value: any): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? -1 : parsed;
    }

    if (Array.isArray(value) && value.length > 0) {
      // For arrays/tuples, take the first element
      return this.parseNumericValue(value[0]);
    }

    return -1; // Unknown/invalid value
  }

  /**
   * Validate connection between two shapes
   */
  static validateShapeCompatibility(
    outputShape: CalculatedTensorShape,
    expectedInputShape: CalculatedTensorShape
  ): ShapeValidationResult {
    console.log('🔍 SHAPE COMPATIBILITY CHECK:', {
      outputShape,
      expectedInputShape,
      outputDimensions: outputShape?.dimensions,
      expectedDimensions: expectedInputShape?.dimensions
    });
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
   * Format shape array for display
   */
  static formatShape(shape: CalculatedTensorShape): string {
    const dimStr = shape.dimensions
      .map((d) => (d === -1 ? "N" : d.toString()))
      .join(", ");
    return `(${dimStr})`;
  }

  /**
   * Get readable shape description
   */
  static getShapeDescription(shape: CalculatedTensorShape): string {
    return shape.description || `${this.formatShape(shape)} tensor`;
  }
}
