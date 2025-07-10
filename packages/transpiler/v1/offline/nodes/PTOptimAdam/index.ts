// src/nodes/PTOptimAdam.ts

import INode, { NodeType } from "../../../core/interfaces/INode";

export default class PTOptimAdam implements INode<PTOptimAdam["settings"]> {
  name: string = "PyTorch Optimizer Adam";

  translationTemplate: string = `{optimizer_variable} = torch.optim.Adam({params}{parameters})`;

  inputLines: number = 0;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.OPTIMIZER;

  settings: {
    optimizerVariable: string; // Variable name for the optimizer instance
    params: string; // Parameters to optimize (e.g., model.parameters())
    parameters: { [key: string]: any }; // Additional optimizer parameters
  } = {
    optimizerVariable: "optimizer",
    params: "model.parameters()",
    parameters: {},
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Prepare parameters string
    const parametersList: string[] = [];

    // Ensure 'params' is provided
    if (!settings.params) {
      throw new Error("Optimizer 'params' must be provided in settings.");
    }

    // Convert parameters to string representations
    for (const [key, value] of Object.entries(settings.parameters)) {
      const valueStr = this.stringifyParameter(value);
      parametersList.push(`${key}=${valueStr}`);
    }

    // Join parameters with commas, prefixing with a comma if parameters exist
    const parametersStr =
      parametersList.length > 0 ? `, ${parametersList.join(", ")}` : "";

    return this.translationTemplate
      .replace("{optimizer_variable}", settings.optimizerVariable)
      .replace("{params}", settings.params)
      .replace("{parameters}", parametersStr);
  }

  private stringifyParameter(value: any): string {
    if (typeof value === "string") {
      // Check if it's a variable or a string literal
      if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
        // It's a variable name
        return value;
      } else {
        // It's a string literal
        return `"${value}"`;
      }
    } else if (typeof value === "boolean") {
      return value ? "True" : "False";
    } else if (typeof value === "number") {
      return value.toString();
    } else if (value === null || value === undefined) {
      return "None";
    } else if (Array.isArray(value)) {
      // Convert array to Python tuple
      const items = value.map((item) => this.stringifyParameter(item));
      return `(${items.join(", ")})`;
    } else if (typeof value === "object") {
      // Convert object to dictionary representation
      const entries = Object.entries(value).map(
        ([k, v]) => `${k}: ${this.stringifyParameter(v)}`
      );
      return `{${entries.join(", ")}}`;
    } else {
      throw new Error(`Unsupported parameter type: ${typeof value}`);
    }
  }
}
