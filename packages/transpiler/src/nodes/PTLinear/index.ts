// nodes/PTLinear.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface LinearSettings extends ModelLayerSettings {
  inFeatures: number;
  outFeatures: number;
  bias?: boolean;
}

export default class PTLinear extends ModelLayerNode<LinearSettings> {
  /** Name of the node */
  public readonly name: string = "Linear Layer";

  /** Template used for translation */
  public readonly translationTemplate: string = `torch.nn.Linear({in_features}, {out_features}{optional_params})`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings for PTLinear */
  public readonly settings: LinearSettings = {
    inFeatures: 784,
    outFeatures: 128,
    bias: true,
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: LinearSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, ["inFeatures", "outFeatures"]);

    // Validate input values
    if (settings.inFeatures <= 0 || settings.outFeatures <= 0) {
      throw new Error(
        "Invalid settings: 'inFeatures' and 'outFeatures' must be positive numbers."
      );
    }

    const requiredParams = {
      in_features: settings.inFeatures,
      out_features: settings.outFeatures,
    };

    const optionalParams = {
      bias: settings.bias ?? true,
    };

    // Use SDK utility to build the layer constructor
    return this.buildLayerConstructor(
      "nn.Linear",
      requiredParams,
      { bias: true }, // defaults to exclude
      settings
    );
  }

  /** Get required dependencies */
  public getDependencies(): string[] {
    return ["torch", "torch.nn"];
  }

  /** Get required imports */
  public getImports(): string[] {
    return ["import torch", "import torch.nn"];
  }
}
