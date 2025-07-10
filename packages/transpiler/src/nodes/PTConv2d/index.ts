// nodes/PTConv2d.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface Conv2dSettings extends ModelLayerSettings {
  inChannels: number;
  outChannels: number;
  kernelSize: number | [number, number];
  stride?: number | [number, number];
  padding?: number | [number, number];
  dilation?: number | [number, number];
  groups?: number;
  bias?: boolean;
  paddingMode?: string;
}

export default class PTConv2d extends ModelLayerNode<Conv2dSettings> {
  /** Name of the node */
  public readonly name: string = "Conv2d Layer";

  /** Template used for translation */
  public readonly translationTemplate: string = `torch.nn.Conv2d({in_channels}, {out_channels}, {kernel_size}{optional_params})`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings for PTConv2d */
  public readonly settings: Conv2dSettings = {
    inChannels: 1,
    outChannels: 32,
    kernelSize: 3,
    stride: 1,
    padding: 0,
    dilation: 1,
    groups: 1,
    bias: true,
    paddingMode: "zeros",
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: Conv2dSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, [
      "inChannels",
      "outChannels",
      "kernelSize",
    ]);

    // Validate input values
    if (
      settings.inChannels <= 0 ||
      settings.outChannels <= 0 ||
      (typeof settings.kernelSize === "number" && settings.kernelSize <= 0) ||
      (Array.isArray(settings.kernelSize) &&
        settings.kernelSize.some((k) => k <= 0))
    ) {
      throw new Error(
        "Invalid settings: 'inChannels', 'outChannels', and 'kernelSize' must be positive numbers."
      );
    }

    const requiredParams = {
      in_channels: settings.inChannels,
      out_channels: settings.outChannels,
      kernel_size: settings.kernelSize,
    };

    const optionalParams = {
      stride: settings.stride,
      padding: settings.padding,
      dilation: settings.dilation,
      groups: settings.groups,
      bias: settings.bias,
      padding_mode: settings.paddingMode,
    };

    const defaultValues = {
      stride: 1,
      padding: 0,
      dilation: 1,
      groups: 1,
      bias: true,
      padding_mode: "zeros",
    };

    // Use SDK utility to build the layer constructor
    return this.buildLayerConstructor(
      "torch.nn.Conv2d",
      requiredParams,
      defaultValues,
      settings
    );
  }
}
