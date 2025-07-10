// src/nodes/PTNNDataset.ts

import INode, { NodeType } from "@/interfaces/INode";

export default class PTNNDataset implements INode<PTNNDataset["settings"]> {
  name: string = "PyTorch NN Dataset";

  translationTemplate: string = `
class {class_name}(Dataset):
    def __init__({constructor_params}):
{init_body}
    def __len__({len_params}):
{len_body}
    def __getitem__({getitem_params}):
{getitem_body}
`;

  inputLines: number = 0;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.MODEL;

  settings: {
    className: string;
    constructorParams: string[]; // Parameters for __init__
    initCode: string; // Code inside __init__
    lenParams: string[]; // Parameters for __len__, typically just 'self'
    lenCode: string; // Code inside __len__
    getitemParams: string[]; // Parameters for __getitem__, typically 'self, idx'
    getitemCode: string; // Code inside __getitem__
  } = {
    className: "CustomDataset",
    constructorParams: ["self"],
    initCode: "",
    lenParams: ["self"],
    lenCode: "",
    getitemParams: ["self", "idx"],
    getitemCode: "",
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Prepare parameters
    const constructorParams = settings.constructorParams.join(", ");
    const lenParams = settings.lenParams.join(", ");
    const getitemParams = settings.getitemParams.join(", ");

    // Process code blocks
    const initBody = this.indentCode(settings.initCode, 2);
    const lenBody = this.indentCode(settings.lenCode, 2);
    const getitemBody = this.indentCode(settings.getitemCode, 2);

    return this.translationTemplate
      .replace("{class_name}", settings.className)
      .replace("{constructor_params}", constructorParams)
      .replace("{init_body}", initBody)
      .replace("{len_params}", lenParams)
      .replace("{len_body}", lenBody)
      .replace("{getitem_params}", getitemParams)
      .replace("{getitem_body}", getitemBody)
      .trim();
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
