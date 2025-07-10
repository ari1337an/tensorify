// nodes/PTReLU.ts
import INode, { NodeType } from "@/interfaces/INode";

export default class PTReLU implements INode<PTReLU["settings"]> {
  /** Name of the node */
  name: string = "ReLU Layer";

  /** Template used for translation */
  translationTemplate: string = `torch.nn.ReLU({optional_params})`;

  /** Number of input lines */
  inputLines: number = 1;

  /** Number of output lines */
  outputLinesCount: number = 1;

  /** Number of secondary input lines */
  secondaryInputLinesCount: number = 0;

  /** Type of the node */
  nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Settings specific to PTReLU */
  settings: {
    inplace?: boolean;
  } = {
    inplace: false,
  };

  constructor() {
    // Initialize settings with default values if needed
  }

  /** Function to get the translation code */
  getTranslationCode(settings: typeof this.settings): string {
    // Prepare optional parameters
    let optionalParams = "";

    if (settings.inplace !== undefined && settings.inplace !== false) {
      optionalParams += `inplace=${settings.inplace}`;
    }

    // Generate the translation code
    return this.translationTemplate.replace("{optional_params}", optionalParams.trim());
  }
}
