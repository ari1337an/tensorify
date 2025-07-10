// nodes/PTReLU.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface ReLUSettings extends ModelLayerSettings {
  inplace?: boolean;
}

export default class PTReLU extends ModelLayerNode<ReLUSettings> {
  /** Name of the node */
  public readonly name: string = "ReLU Layer";

  /** Template used for translation */
  public readonly translationTemplate: string = `torch.nn.ReLU({optional_params})`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings for PTReLU */
  public readonly settings: ReLUSettings = {
    inplace: false,
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: ReLUSettings): string {
    const requiredParams = {};

    const optionalParams = {
      inplace: settings.inplace,
    };

    const defaultValues = {
      inplace: false,
    };

    // Use SDK utility to build the layer constructor
    return this.buildLayerConstructor(
      "torch.nn.ReLU",
      requiredParams,
      defaultValues,
      settings
    );
  }
}
