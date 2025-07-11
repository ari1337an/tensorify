import {
  INode,
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

/**
 * Settings interface for the Linear Layer
 */
export interface LinearLayerSettings extends ModelLayerSettings {
  /** Number of input features */
  inFeatures: number;
  /** Number of output features */
  outFeatures: number;
  /** Whether to include bias term */
  bias?: boolean;
}

/**
 * {{projectName}} - A simple Linear/Dense layer implementation
 * {{description}}
 */
export default class TensorifyLinearLayer
  extends ModelLayerNode<LinearLayerSettings>
  implements INode<LinearLayerSettings>
{
  /** Name of the node */
  public readonly name: string = "{{projectName}} Linear Layer";

  /** Template used for translation */
  public readonly translationTemplate: string =
    "{{variableProjectName}}_linear_layer";

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Node type */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings */
  public readonly settings: LinearLayerSettings = {
    inFeatures: 784,
    outFeatures: 128,
    bias: true,
  };

  /**
   * Generate PyTorch Linear layer code
   */
  public getTranslationCode(
    settings: LinearLayerSettings,
    children?: any,
    context?: any
  ): string {
    // Validate required parameters
    const { inFeatures, outFeatures, bias = true } = settings;

    // Validate settings
    this.validateSettings(settings);

    // Generate the linear layer code
    const layerCode = `nn.Linear(${inFeatures}, ${outFeatures}, bias=${bias})`;

    return `
# {{projectName}} Linear Layer: ${inFeatures} -> ${outFeatures} features
${this.translationTemplate} = ${layerCode}
`.trim();
  }

  /**
   * Validate Linear layer settings
   */
  public validateSettings(settings: LinearLayerSettings): boolean {
    // Validate input features
    if (!settings.inFeatures || settings.inFeatures <= 0) {
      throw new Error("inFeatures must be a positive number");
    }

    // Validate output features
    if (!settings.outFeatures || settings.outFeatures <= 0) {
      throw new Error("outFeatures must be a positive number");
    }

    return true;
  }

  /**
   * Get required dependencies
   */
  public getDependencies(): string[] {
    return ["torch"];
  }

  /**
   * Get required imports
   */
  public getImports(context?: any): string[] {
    return [
      "import torch",
      "import torch.nn as nn",
      "# {{projectName}} - {{description}}",
    ];
  }
}
