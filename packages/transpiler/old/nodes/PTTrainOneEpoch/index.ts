// src/nodes/PTTrainOneEpoch.ts

import INode, { NodeType } from "@/interfaces/INode";
import PTReportLoss from "@/nodes/PTReportLoss"; // Import the PTReportLoss class

export default class PTTrainOneEpoch implements INode<PTTrainOneEpoch["settings"]> {
  name: string = "PyTorch Train One Epoch";

  translationTemplate: string = `
def {function_name}(epoch_index, optimizer, dataloader, model, loss_fn):
    running_loss = 0.
    last_loss = 0.

    for batch_no, data in enumerate(dataloader):
{destructure_code}
        optimizer.zero_grad()
{predict_code}
{loss_code}
        loss.backward()
        optimizer.step()
        running_loss += loss.item()
{report_code}
    
    return last_loss

`;

  inputLines: number = 0;
  outputLinesCount: number = 1;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.FUNCTION;

  settings: {
    functionName: string;
    destructureDataVariables: string[];
    modelInputOrder: string[];
    modelOutputVariables: string[];
    lossFunctionInputs: string[];
    reportLossSettings: PTReportLoss["settings"];
  } = {
    functionName: "train_one_epoch",
    destructureDataVariables: [],
    modelInputOrder: [],
    modelOutputVariables: [],
    lossFunctionInputs: [],
    reportLossSettings: {
      reportCondition: "",
      reportStatements: "",
      resetRunningLoss: false,
    }
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Generate destructure code
    const destructureVariables = settings.destructureDataVariables.join(", ");
    const destructureCode = `${destructureVariables} = data`;

    // Generate predict code
    const modelInputs = settings.modelInputOrder.join(", ");
    const modelOutputs = settings.modelOutputVariables.join(", ");
    const predictCode = `${modelOutputs} = model(${modelInputs})`;

    // Generate loss code
    const lossFunctionInputs = settings.lossFunctionInputs.join(", ");
    const lossCode = `loss = loss_fn(${lossFunctionInputs})`;

    // Generate report code using PTReportLoss
    const reportLossNode = new PTReportLoss();
    reportLossNode.settings = settings.reportLossSettings;
    const reportCode = this.indentCode(
      reportLossNode.getTranslationCode(reportLossNode.settings).trim(),
      2
    );

    // Generate the final code
    return this.translationTemplate
      .replace("{function_name}", settings.functionName)
      .replace("{destructure_code}", this.indentCode(destructureCode, 2))
      .replace("{predict_code}", this.indentCode(predictCode, 2))
      .replace("{loss_code}", this.indentCode(lossCode, 2))
      .replace("{report_code}", reportCode);
  }

  // Helper method to indent code by a given number of indent levels
  private indentCode(code: string, indentLevels: number): string {
    const indent = "    ".repeat(indentLevels); // 4 spaces per indent level
    return code
      .split("\n")
      .map((line) => (line.trim().length > 0 ? indent + line : line))
      .join("\n");
  }
}
