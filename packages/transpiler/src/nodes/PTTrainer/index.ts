// src/nodes/PTTrainer.ts

import INode, { NodeType } from "../../../core/interfaces/INode";

export default class PTTrainer implements INode<PTTrainer["settings"]> {
  name: string = "PyTorch Trainer Pipeline";

  translationTemplate: string = `
for epoch_index in range({number_of_epochs}):
    {model_variable}.train(True)
    {avg_loss_variable} = {train_function_name}(epoch_index, {optimizer_variable}, {dataloader_variable}, {model_variable}, {loss_function_variable})
{additional_code}
`;

  inputLines: number = 0;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.TRAINER;

  settings: {
    numEpochs: number; // The number of epochs to run
    trainFunctionName: string; // Name of the training function (e.g., "train_one_epoch")
    optimizerVariable: string; // Name of the optimizer variable (e.g., "optimizer")
    dataloaderVariable: string; // Name of the dataloader variable (e.g., "dataloader")
    modelVariable: string; // Name of the model variable (e.g., "model")
    lossFunctionVariable: string; // Name of the loss function variable (e.g., "loss_fn")
    avgLossVariable: string; // Name of the variable to store the average loss (e.g., "avg_loss")
    additionalCode?: string; // Any additional code to include inside the loop
  } = {
    numEpochs: 1,
    trainFunctionName: "train_one_epoch",
    optimizerVariable: "optimizer",
    dataloaderVariable: "dataloader",
    modelVariable: "model",
    lossFunctionVariable: "loss_fn",
    avgLossVariable: "avg_loss",
    additionalCode: "",
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Validate required settings
    if (!settings.trainFunctionName) {
      throw new Error("Train function name must be provided in settings.");
    }
    if (
      !settings.optimizerVariable ||
      !settings.dataloaderVariable ||
      !settings.modelVariable ||
      !settings.lossFunctionVariable
    ) {
      throw new Error(
        "Optimizer, dataloader, model, and loss function variable names must be provided in settings."
      );
    }

    // Indent additional code if provided
    let additionalCode = "";
    if (settings.additionalCode && settings.additionalCode.trim()) {
      additionalCode = this.indentCode(settings.additionalCode.trim(), 1);
    }

    // Generate the code
    let code = this.translationTemplate
      .replace("{number_of_epochs}", settings.numEpochs + "")
      .replace("{train_function_name}", settings.trainFunctionName)
      .replace(/{optimizer_variable}/g, settings.optimizerVariable)
      .replace(/{dataloader_variable}/g, settings.dataloaderVariable)
      .replace(/{model_variable}/g, settings.modelVariable)
      .replace(/{loss_function_variable}/g, settings.lossFunctionVariable)
      .replace("{avg_loss_variable}", settings.avgLossVariable)
      .replace("{additional_code}", additionalCode);

    return code.trim();
  }

  // Helper method to indent code by a given number of indent levels
  private indentCode(code: string, indentLevels: number): string {
    const indent = "    ".repeat(indentLevels); // 4 spaces per indent level
    if (!code) {
      return "";
    }
    return code
      .split("\n")
      .map((line) => (line.trim().length > 0 ? indent + line : line))
      .join("\n");
  }
}
