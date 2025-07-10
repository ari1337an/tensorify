// nodes/PTTrainOneEpoch.ts
import { TrainerNode, TrainerSettings, NodeType } from "@tensorify.io/sdk";

interface TrainOneEpochSettings extends TrainerSettings {
  functionName: string;
  destructureDataVariables: string[];
  modelInputOrder: string[];
  modelOutputVariables: string[];
  lossFunctionInputs: string[];
  reportLossSettings: {
    reportCondition: string;
    reportStatements: string;
    resetRunningLoss: boolean;
  };
}

export default class PTTrainOneEpoch extends TrainerNode<TrainOneEpochSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch Train One Epoch";

  /** Template used for translation */
  public readonly translationTemplate: string = `
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

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.TRAINER;

  /** Default settings for PTTrainOneEpoch */
  public readonly settings: TrainOneEpochSettings = {
    functionName: "train_one_epoch",
    destructureDataVariables: [],
    modelInputOrder: [],
    modelOutputVariables: [],
    lossFunctionInputs: [],
    reportLossSettings: {
      reportCondition: "",
      reportStatements: "",
      resetRunningLoss: false,
    },
  };

  constructor() {
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: TrainOneEpochSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, ["functionName"]);

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

    // Generate report code (simplified - no PTReportLoss dependency for now)
    let reportCode = "";
    if (
      settings.reportLossSettings.reportCondition &&
      settings.reportLossSettings.reportStatements
    ) {
      const condition = settings.reportLossSettings.reportCondition;
      const statements = settings.reportLossSettings.reportStatements;
      const resetCode = settings.reportLossSettings.resetRunningLoss
        ? "\n        running_loss = 0."
        : "";

      reportCode = `if ${condition}:\n${this.indentCode(
        statements,
        3
      )}${resetCode}`;
    }

    // Use SDK utility to build the training function
    const functionBody = `
running_loss = 0.
last_loss = 0.

for batch_no, data in enumerate(dataloader):
${this.indentCode(destructureCode, 1)}
    optimizer.zero_grad()
${this.indentCode(predictCode, 1)}
${this.indentCode(lossCode, 1)}
    loss.backward()
    optimizer.step()
    running_loss += loss.item()
${this.indentCode(reportCode, 1)}

return last_loss`.trim();

    return this.buildTrainingFunction(
      settings.functionName,
      ["epoch_index", "optimizer", "dataloader", "model", "loss_fn"],
      functionBody
    );
  }
}
