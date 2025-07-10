// nodes/PTSequential.ts
import INode, { NodeType } from "../../../core/interfaces/INode";
import createNodeInstance from "../../instances/index";
import { Children, Layer } from "../../../core/types/global";

export default class PTSequential implements INode<PTSequential["settings"]> {
  /** Name of the node */
  name: string = "Sequential Model";

  /** Template used for translation */
  translationTemplate: string = `torch.nn.Sequential({layers})`;

  /** Number of input lines */
  inputLines: number = 1;

  /** Number of output lines */
  outputLinesCount: number = 1;

  /** Number of secondary input lines */
  secondaryInputLinesCount: number = 0;

  /** Type of the node */
  nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Settings specific to PTSequential */
  settings = null;

  constructor() {
    // Initialize settings with default values if needed
  }

  /** Function to get the translation code */
  getTranslationCode(settings: PTSequential["settings"], children: Children): string {
    const layerCodes: string[] = [];

    if (typeof children === "object" && Array.isArray(children)) {
      for (const _layer in children) {
        if (Object.prototype.hasOwnProperty.call(children, _layer)) {
          const layer = children[_layer];
          const { type, settings: layerSettings } = layer as Layer;
          const nodeInstance = createNodeInstance(type);
          const code = nodeInstance.getTranslationCode(layerSettings, null);
          layerCodes.push(code);
        }
      }
    } else if (typeof children === "object" && !Array.isArray(children)) {
      const { type, settings: layerSettings } = children as Layer;
      const nodeInstance = createNodeInstance(type);
      const code = nodeInstance.getTranslationCode(layerSettings, null);
      layerCodes.push(code);
    } else {
      throw new Error("Wrong Children provided at PTSequential!");
    }

    const layersCode = layerCodes.join(",");

    return this.translationTemplate.replace("{layers}", layersCode);
  }
}
