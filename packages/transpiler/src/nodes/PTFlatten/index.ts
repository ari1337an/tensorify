// nodes/PTFlatten.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface FlattenSettings extends ModelLayerSettings {
  startDim?: number;
  endDim?: number;
}

export default class PTFlatten extends ModelLayerNode<FlattenSettings> {
  /** Name of the node */
  public readonly name: string = "Flatten Layer";

  /** Template used for translation */
  public readonly translationTemplate: string = `torch.nn.Flatten({optional_params})`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings for PTFlatten */
  public readonly settings: FlattenSettings = {
    startDim: 1,
    endDim: -1,
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: FlattenSettings): string {
    const requiredParams = {};

    const optionalParams = {
      start_dim: settings.startDim,
      end_dim: settings.endDim,
    };

    const defaultValues = {
      start_dim: 1,
      end_dim: -1,
    };

    // Use SDK utility to build the layer constructor
    return this.buildLayerConstructor(
      "torch.nn.Flatten",
      requiredParams,
      defaultValues,
      settings
    );
  }
}
