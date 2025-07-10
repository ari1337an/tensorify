// nodes/PTConv2d.ts
import INode, { NodeType } from "../../../core/interfaces/INode";

export default class PTConv2d implements INode<PTConv2d["settings"]> {
  /** Name of the node */
  name: string = "Conv2d Layer";

  /** Template used for translation */
  translationTemplate: string = `torch.nn.Conv2d({in_channels}, {out_channels}, {kernel_size}{optional_params})`;

  /** Number of input lines */
  inputLines: number = 1;

  /** Number of output lines */
  outputLinesCount: number = 1;

  /** Number of secondary input lines */
  secondaryInputLinesCount: number = 0;

  /** Type of the node */
  nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Settings specific to PTConv2d */
  settings: {
    inChannels: number;
    outChannels: number;
    kernelSize: number | [number, number];
    stride?: number | [number, number];
    padding?: number | [number, number];
    dilation?: number | [number, number];
    groups?: number;
    bias?: boolean;
    paddingMode?: string;
  } = {
    inChannels: -1,
    outChannels: -1,
    kernelSize: -1,
    stride: 1,
    padding: 0,
    dilation: 1,
    groups: 1,
    bias: true,
    paddingMode: "zeros",
  };

  constructor() {
    // Initialize settings with default values if needed
  }

  /** Function to get the translation code */
  getTranslationCode(settings: typeof this.settings): string {
    // Validate required settings
    if (
      settings.inChannels === undefined ||
      settings.outChannels === undefined ||
      settings.kernelSize === undefined ||
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

    // Prepare optional parameters
    let optionalParams = "";

    if (settings.stride !== undefined && settings.stride !== 1) {
      optionalParams += `, stride=${JSON.stringify(settings.stride)}`;
    }
    if (settings.padding !== undefined && settings.padding !== 0) {
      optionalParams += `, padding=${JSON.stringify(settings.padding)}`;
    }
    if (settings.dilation !== undefined && settings.dilation !== 1) {
      optionalParams += `, dilation=${JSON.stringify(settings.dilation)}`;
    }
    if (settings.groups !== undefined && settings.groups !== 1) {
      optionalParams += `, groups=${settings.groups}`;
    }
    if (settings.bias !== undefined && settings.bias !== true) {
      optionalParams += `, bias=${settings.bias}`;
    }
    if (
      settings.paddingMode !== undefined &&
      settings.paddingMode !== "zeros"
    ) {
      optionalParams += `, padding_mode='${settings.paddingMode}'`;
    }

    // Generate the translation code
    return this.translationTemplate
      .replace("{in_channels}", settings.inChannels.toString())
      .replace("{out_channels}", settings.outChannels.toString())
      .replace("{kernel_size}", JSON.stringify(settings.kernelSize))
      .replace("{optional_params}", optionalParams);
  }
}
