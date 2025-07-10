// nodes/PTSequential.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
  Children,
} from "@tensorify.io/sdk";

interface SequentialSettings extends ModelLayerSettings {
  // PTSequential doesn't need specific settings, it works with children
}

export default class PTSequential extends ModelLayerNode<SequentialSettings> {
  /** Name of the node */
  public readonly name: string = "Sequential Model";

  /** Template used for translation */
  public readonly translationTemplate: string = `torch.nn.Sequential({layers})`;

  /** Number of input lines */
  public readonly inputLines: number = 1;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL_LAYER;

  /** Default settings for PTSequential */
  public readonly settings: SequentialSettings = {};

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(
    settings: SequentialSettings,
    children?: Children
  ): string {
    if (!children) {
      throw new Error("PTSequential requires children layers to be provided.");
    }

    const layerCodes: string[] = [];

    // Handle different children formats
    if (Array.isArray(children)) {
      children.forEach((layer) => {
        if (layer && typeof layer === "object" && "type" in layer) {
          const layerCode = this.processChildLayer(layer);
          layerCodes.push(layerCode);
        }
      });
    } else if (typeof children === "object" && children !== null) {
      // Single child or object with children
      if ("type" in children) {
        const layerCode = this.processChildLayer(children);
        layerCodes.push(layerCode);
      } else {
        // Children is an object with multiple layers
        Object.values(children).forEach((layer) => {
          if (layer && typeof layer === "object" && "type" in layer) {
            const layerCode = this.processChildLayer(layer);
            layerCodes.push(layerCode);
          }
        });
      }
    }

    if (layerCodes.length === 0) {
      throw new Error("PTSequential requires at least one child layer.");
    }

    const layersCode = layerCodes.join(", ");
    return this.translationTemplate.replace("{layers}", layersCode);
  }

  /**
   * Process a child layer to generate its code
   * This is a simplified implementation that handles basic layer types
   * In a full implementation, this would create instances dynamically
   */
  private processChildLayer(layer: any): string {
    // This is a placeholder implementation
    // In a real scenario, you'd need to create instances of the appropriate node classes
    // based on the layer.type and call their getTranslationCode methods

    const { type, settings } = layer;

    // Handle common layer types
    switch (type) {
      case "PTLinear":
        return `torch.nn.Linear(${settings.inFeatures}, ${settings.outFeatures})`;
      case "PTReLU":
        return `torch.nn.ReLU()`;
      case "PTConv2d":
        return `torch.nn.Conv2d(${settings.inChannels}, ${settings.outChannels}, ${settings.kernelSize})`;
      case "PTFlatten":
        return `torch.nn.Flatten()`;
      default:
        throw new Error(`Unsupported layer type in PTSequential: ${type}`);
    }
  }
}
