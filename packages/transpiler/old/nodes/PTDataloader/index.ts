// src/nodes/PTDataloader.ts

import INode, { NodeType } from "@/interfaces/INode";

export default class PTDataloader implements INode<PTDataloader["settings"]> {
  name: string = "PyTorch DataLoader";

  translationTemplate: string = `{dataloader_variable} = DataLoader({dataset_variable}{parameters})`;

  inputLines: number = 0;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.DATALOADER;

  settings: {
    dataloaderVariable: string; // Variable name for the DataLoader instance
    datasetVariable: string; // Variable name of the dataset to load
    parameters: { [key: string]: any }; // Additional DataLoader parameters
  } = {
    dataloaderVariable: "data_loader",
    datasetVariable: "dataset",
    parameters: {},
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Prepare parameters string
    const parametersList: string[] = [];

    // Ensure 'datasetVariable' is provided
    if (!settings.datasetVariable) {
      throw new Error("Dataset variable name must be provided in settings.");
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
      .replace("{dataloader_variable}", settings.dataloaderVariable)
      .replace("{dataset_variable}", settings.datasetVariable)
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
      // Convert array to Python list
      const items = value.map((item) => this.stringifyParameter(item));
      return `[${items.join(", ")}]`;
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
