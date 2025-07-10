import { BaseNode } from "./BaseNode";
import { NodeType } from "../interfaces/INode";
import { LayerSettings, CodeGenerationContext, Children } from "../types";

/**
 * Interface for model layer settings
 */
export interface ModelLayerSettings extends LayerSettings {
  /** Input features/channels/dimensions */
  inFeatures?: number;
  /** Output features/channels/dimensions */
  outFeatures?: number;
  /** Whether to include bias */
  bias?: boolean;
}

/**
 * Base class for model layer nodes (Linear, Conv2d, ReLU, etc.)
 * Provides common functionality for neural network layers
 */
export abstract class ModelLayerNode<
  TSettings extends ModelLayerSettings = ModelLayerSettings
> extends BaseNode<TSettings> {
  /** All model layers have 1 input line by default */
  public readonly inputLines: number = 1;

  /** All model layers have 1 output line by default */
  public readonly outputLinesCount: number = 1;

  /** Model layers typically don't have secondary inputs */
  public readonly secondaryInputLinesCount: number = 0;

  /** Node type is always MODEL_LAYER */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /**
   * Get PyTorch imports commonly needed for model layers
   */
  public getImports(context?: CodeGenerationContext): string[] {
    const framework = context?.framework || "pytorch";

    switch (framework) {
      case "pytorch":
        return ["import torch", "import torch.nn as nn"];
      case "tensorflow":
        return ["import tensorflow as tf"];
      default:
        return [];
    }
  }

  /**
   * Build PyTorch layer constructor call
   * @param layerName - Name of the PyTorch layer (e.g., 'nn.Linear', 'nn.Conv2d')
   * @param requiredParams - Required parameters as key-value pairs
   * @param optionalParams - Optional parameters with their default values
   * @param settings - Current settings
   * @returns Complete layer constructor string
   */
  protected buildLayerConstructor(
    layerName: string,
    requiredParams: Record<string, any>,
    optionalParams: Record<string, any>,
    settings: TSettings
  ): string {
    // Add required parameters first
    const params: string[] = [];

    Object.entries(requiredParams).forEach(([key, value]) => {
      params.push(this.stringifyParameter(value));
    });

    // Add optional parameters that differ from defaults
    Object.entries(optionalParams).forEach(([key, defaultValue]) => {
      const currentValue = settings[key];
      if (currentValue !== undefined && currentValue !== defaultValue) {
        params.push(`${key}=${this.stringifyParameter(currentValue)}`);
      }
    });

    return `${layerName}(${params.join(", ")})`;
  }

  /**
   * Validate common model layer settings
   */
  public validateSettings(settings: TSettings): boolean {
    super.validateSettings(settings);

    // Check for negative values in size-related parameters
    const sizeParams = ["inFeatures", "outFeatures", "inputSize", "outputSize"];
    sizeParams.forEach((param) => {
      const value = settings[param];
      if (value !== undefined && typeof value === "number" && value <= 0) {
        throw new Error(`${param} must be a positive number, got: ${value}`);
      }
    });

    return true;
  }
}
