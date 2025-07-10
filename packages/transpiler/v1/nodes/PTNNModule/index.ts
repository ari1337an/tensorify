// src/nodes/PTNNModule.ts

import INode, { NodeType } from "@/interfaces/INode";
import { Layer } from "@/types/global";
import createNodeInstance from "@/instances/index";

export default class PTNNModule implements INode<PTNNModule["settings"]> {
  name: string = "PyTorch NN Module";

  translationTemplate: string = `
class {class_name}(nn.Module):
    def __init__({constructor_params}):
        super().__init__()
{init_body}
    def forward({forward_params}):
{forward_body}
`;

  inputLines: number = 0;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.MODEL;

  settings: {
    className: string;
    constructorParams: string[]; // Parameters for __init__
    layers: Layer[]; // Layers to be defined in __init__
    forwardParams: string[]; // Parameters for forward
    dataFlow: string; // Code inside forward method
  } = {
    className: "NeuralNetwork",
    constructorParams: [],
    layers: [],
    forwardParams: ["x"],
    dataFlow: "",
  };

  // Keep track of layer variable names
  private layerVariableNames: Set<string> = new Set();

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    const initLines: string[] = [];
    const forwardLines: string[] = [];

    // Generate unique variable names for layers
    settings.layers.forEach((layer, index) => {
      const varName = `layer_${index}`;
      this.layerVariableNames.add(varName);

      // Create node instance and get code
      const nodeInstance = createNodeInstance(layer.type);
      const layerCode = nodeInstance.getTranslationCode(
        layer.settings,
        layer.child ?? null
      );

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

  // Helper method to indent code by a given number of indent levels
  private indentCode(code: string, indentLevels: number): string {
    const indent = "    ".repeat(indentLevels); // 4 spaces per indent level
    return code
      .split("\n")
      .map((line) => (line.length > 0 ? indent + line : line))
      .join("\n");
  }
}
