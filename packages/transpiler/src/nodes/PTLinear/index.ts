// nodes/PTLinear.ts
import INode, { NodeType } from "../../../core/interfaces/INode";

export default class PTLinear implements INode<PTLinear["settings"]> {
  /** Name of the node */
  name: string = "Linear Layer";

  /** Template used for translation */
  translationTemplate: string = `torch.nn.Linear({in_features}, {out_features}{optional_params})`;

  /** Number of input lines */
  inputLines: number = 1;

  /** Number of output lines */
  outputLinesCount: number = 1;

  /** Number of secondary input lines */
  secondaryInputLinesCount: number = 0;

  /** Type of the node */
  nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Settings specific to PTLinear */
  settings: {
    inFeatures: number;
    outFeatures: number;
    bias?: boolean;
  } = {
    inFeatures: -1,
    outFeatures: -1,
    bias: true,
  };

  constructor() {
    // Initialize settings with default values if needed
  }

  /** Function to get the translation code */
  getTranslationCode(settings: typeof this.settings): string {
    // Validate required settings
    if (
      settings.inFeatures === undefined ||
      settings.outFeatures === undefined ||
      settings.inFeatures <= 0 ||
      settings.outFeatures <= 0
    ) {
      throw new Error(
        "Invalid settings: 'inFeatures' and 'outFeatures' must be positive numbers."
      );
    }

    // Prepare optional parameters
    let optionalParams = "";

    if (settings.bias !== undefined && settings.bias !== true) {
      optionalParams += `, bias=${settings.bias}`;
    }

    // Generate the translation code
    return this.translationTemplate
      .replace("{in_features}", settings.inFeatures.toString())
      .replace("{out_features}", settings.outFeatures.toString())
      .replace("{optional_params}", optionalParams);
  }
}
