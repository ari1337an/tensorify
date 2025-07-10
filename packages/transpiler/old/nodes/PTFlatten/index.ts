// nodes/PTFlatten.ts
import INode, { NodeType } from "@/interfaces/INode";

export default class PTFlatten implements INode<PTFlatten["settings"]> {
  /** Name of the node */
  name: string = "Flatten Layer";

  /** Template used for translation */
  translationTemplate: string = `torch.nn.Flatten({optional_params})`;

  /** Number of input lines */
  inputLines: number = 1;

  /** Number of output lines */
  outputLinesCount: number = 1;

  /** Number of secondary input lines */
  secondaryInputLinesCount: number = 0;

  /** Type of the node */
  nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Settings specific to PTFlatten */
  settings: {
    startDim?: number;
    endDim?: number;
  } = {
    startDim: 1,
    endDim: -1,
  };

  constructor() {
    // Initialize settings with default values if needed
  }

  /** Function to get the translation code */
  getTranslationCode(settings: typeof this.settings): string {
    // Prepare optional parameters
    let optionalParams = "";

    if (settings.startDim !== undefined && settings.startDim !== 1) {
      optionalParams += `start_dim=${settings.startDim}`;
    }
    if (settings.endDim !== undefined && settings.endDim !== -1) {
      if (optionalParams !== "") {
        optionalParams += `, `;
      }
      optionalParams += `end_dim=${settings.endDim}`;
    }

    // Generate the translation code
    return this.translationTemplate.replace("{optional_params}", optionalParams.trim());
  }
}
