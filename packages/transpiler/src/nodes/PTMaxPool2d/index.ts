// nodes/PTMaxPool2d.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface MaxPool2dSettings extends ModelLayerSettings {
  kernelSize: number;
  stride?: number;
  padding?: number;
}

export default class PTMaxPool2d extends ModelLayerNode<MaxPool2dSettings> {
  /** Name of the node */
  public readonly name: string = "MaxPool2d";

  /** Template used for translation */
  public readonly translationTemplate: string = `torch.nn.MaxPool2d({parameters})`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings for PTMaxPool2d */
  public readonly settings: MaxPool2dSettings = {
    kernelSize: 2,
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: MaxPool2dSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, ["kernelSize"]);

    // Validate input values
    if (settings.kernelSize <= 0) {
      throw new Error(
        "Invalid settings: 'kernelSize' must be a positive number."
      );
    }

    const requiredParams = {
      kernel_size: settings.kernelSize,
    };

    const optionalParams = {
      stride: settings.stride,
      padding: settings.padding,
    };

    const defaultValues = {
      // MaxPool2d defaults stride to kernel_size if not specified
      // padding defaults to 0
      padding: 0,
    };

    // Use SDK utility to build the layer constructor
    return this.buildLayerConstructor(
      "torch.nn.MaxPool2d",
      requiredParams,
      defaultValues,
      settings
    );
  }
}
