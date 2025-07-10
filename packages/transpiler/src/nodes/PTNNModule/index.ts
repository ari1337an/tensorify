// nodes/PTNNModule.ts
import {
  ModelLayerNode,
  ModelLayerSettings,
  NodeType,
} from "@tensorify.io/sdk";

interface NNModuleSettings extends ModelLayerSettings {
  className: string;
  constructorParams: string[]; // Parameters for __init__
  layers: Array<{
    type: string;
    settings: any;
    child?: any;
  }>; // Layers to be defined in __init__
  forwardParams: string[]; // Parameters for forward
  dataFlow: string; // Code inside forward method
}

export default class PTNNModule extends ModelLayerNode<NNModuleSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch NN Module";

  /** Template used for translation */
  public readonly translationTemplate: string = `
class {class_name}(nn.Module):
    def __init__({constructor_params}):
        super().__init__()
{init_body}
    def forward({forward_params}):
{forward_body}
`;

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.MODEL;

  /** Default settings for PTNNModule */
  public readonly settings: NNModuleSettings = {
    className: "NeuralNetwork",
    constructorParams: [],
    layers: [],
    forwardParams: ["x"],
    dataFlow: "",
  };

  // Keep track of layer variable names
  private layerVariableNames: Set<string> = new Set();

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: NNModuleSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, ["className"]);

    const initLines: string[] = [];
    const forwardLines: string[] = [];

    // Clear previous layer variable names
    this.layerVariableNames.clear();

    // Generate unique variable names for layers
    settings.layers.forEach((layer, index) => {
      const varName = `layer_${index}`;
      this.layerVariableNames.add(varName);

      // Generate layer code using simplified approach
      const layerCode = this.processLayer(layer);

      // Add to __init__ body
      initLines.push(`self.${varName} = ${layerCode}`);
    });

    // Split dataFlow string into lines
    const dataFlowLines = settings.dataFlow.split("\n");

    // Process dataFlow lines
    dataFlowLines.forEach((line, lineNumber) => {
      // Keep the original line for context
      const originalLine = line;
      // Trim whitespace from the line
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) {
        // Preserve empty lines
        forwardLines.push("");
        return;
      }

      // Apply variable name resolution to the line
      const resolvedLine = this.resolveVariableNameInExpression(
        trimmedLine,
        lineNumber,
        originalLine
      );
      forwardLines.push(resolvedLine);
    });

    const constructorParams = ["self", ...settings.constructorParams].join(
      ", "
    );
    const forwardParams = ["self", ...settings.forwardParams].join(", ");

    const initBody = this.indentCode(initLines.join("\n"), 2);
    const forwardBody = this.indentCode(forwardLines.join("\n"), 2);

    return this.translationTemplate
      .replace("{class_name}", settings.className)
      .replace("{constructor_params}", constructorParams)
      .replace("{init_body}", initBody)
      .replace("{forward_params}", forwardParams)
      .replace("{forward_body}", forwardBody);
  }

  /**
   * Process a layer definition to generate PyTorch code
   */
  private processLayer(layer: any): string {
    const { type, settings } = layer;

    // Handle common layer types with simplified settings
    switch (type) {
      case "PTLinear":
        return `torch.nn.Linear(${settings.inFeatures}, ${settings.outFeatures})`;
      case "PTReLU":
        return `torch.nn.ReLU()`;
      case "PTConv2d":
        return `torch.nn.Conv2d(${settings.inChannels}, ${settings.outChannels}, ${settings.kernelSize})`;
      case "PTFlatten":
        return `torch.nn.Flatten()`;
      case "PTMaxPool2d":
        return `torch.nn.MaxPool2d(${settings.kernelSize})`;
      default:
        // Fallback: try to generate generic code
        const className = type.replace("PT", "torch.nn.");
        return `${className}()`;
    }
  }

  /**
   * Resolve variable names in forward method expressions
   */
  private resolveVariableNameInExpression(
    expr: string,
    lineNumber: number,
    originalLine: string
  ): string {
    // Regex to match variable names (alphanumeric and underscore)
    const variableRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;

    // Keep track of positions where replacements occur
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let result = "";

    while ((match = variableRegex.exec(expr)) !== null) {
      const token = match[0];
      const startIndex = match.index;

      // Append text before the match
      result += expr.slice(lastIndex, startIndex);

      // Determine if the token is a layer variable matching 'layer_x'
      if (/^layer_\d+$/.test(token)) {
        const isDefinedLayer = this.layerVariableNames.has(token);

        // Check if token is used with 'self.'
        const prefix = expr.slice(0, startIndex).trimEnd();
        const prefixMatch = /self\.$/.test(prefix);

        if (isDefinedLayer) {
          // Layer is defined
          if (prefixMatch) {
            // Used with 'self.', leave as is
            result += token;
          } else {
            // Used without 'self.', replace with 'self.layer_x'
            result += `self.${token}`;
          }
        } else {
          // Layer is not defined
          if (prefixMatch) {
            // Used with 'self.', throw error
            throw new Error(
              `Undefined layer variable '${token}' used in dataFlow at line ${
                lineNumber + 1
              }.`
            );
          } else {
            // Used without 'self.', leave as is
            result += token;
          }
        }
      } else {
        // Not a layer_x variable, leave as is
        result += token;
      }

      lastIndex = variableRegex.lastIndex;
    }

    // Append any remaining text after the last match
    result += expr.slice(lastIndex);

    return result;
  }
}
