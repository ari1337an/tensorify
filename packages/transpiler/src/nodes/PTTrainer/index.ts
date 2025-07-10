// nodes/PTTrainer.ts
import { TrainerNode, TrainerSettings, NodeType } from "@tensorify.io/sdk";

interface PTTrainerSettings extends TrainerSettings {
  numEpochs: number; // The number of epochs to run
  trainFunctionName: string; // Name of the training function (e.g., "train_one_epoch")
  optimizerVariable: string; // Name of the optimizer variable (e.g., "optimizer")
  dataloaderVariable: string; // Name of the dataloader variable (e.g., "dataloader")
  modelVariable: string; // Name of the model variable (e.g., "model")
  lossFunctionVariable: string; // Name of the loss function variable (e.g., "loss_fn")
  avgLossVariable: string; // Name of the variable to store the average loss (e.g., "avg_loss")
  additionalCode?: string; // Any additional code to include inside the loop
}

export default class PTTrainer extends TrainerNode<PTTrainerSettings> {
  /** Name of the node */
  public readonly name: string = "PyTorch Trainer Pipeline";

  /** Template used for translation */
  public readonly translationTemplate: string = `
for epoch_index in range({number_of_epochs}):
    {model_variable}.train(True)
    {avg_loss_variable} = {train_function_name}(epoch_index, {optimizer_variable}, {dataloader_variable}, {model_variable}, {loss_function_variable})
{additional_code}
`;

  /** Number of input lines */
  public readonly inputLines: number = 0;

  /** Number of output lines */
  public readonly outputLinesCount: number = 1;

  /** Number of secondary input lines */
  public readonly secondaryInputLinesCount: number = 0;

  /** Type of the node */
  public readonly nodeType: NodeType = NodeType.TRAINER;

  /** Default settings for PTTrainer */
  public readonly settings: PTTrainerSettings = {
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
    super();
  }

  /** Function to get the translation code */
  public getTranslationCode(settings: PTTrainerSettings): string {
    // Validate required settings using SDK method
    this.validateRequiredParams(settings, [
      "trainFunctionName",
      "optimizerVariable",
      "dataloaderVariable",
      "modelVariable",
      "lossFunctionVariable",
    ]);

    // Use SDK utility to build training loop structure
    const epochLoop = `${settings.modelVariable}.train(True)`;
    const batchLoop = `${settings.avgLossVariable} = ${settings.trainFunctionName}(epoch_index, ${settings.optimizerVariable}, ${settings.dataloaderVariable}, ${settings.modelVariable}, ${settings.lossFunctionVariable})`;

    // Add additional code if provided
    let finalBatchLoop = batchLoop;
    if (settings.additionalCode && settings.additionalCode.trim()) {
      finalBatchLoop += "\n" + settings.additionalCode.trim();
    }

    // Override the epochs setting for the SDK utility
    const trainerSettings = { ...settings, epochs: settings.numEpochs };

    return this.buildTrainingLoop(epochLoop, finalBatchLoop, trainerSettings);
  }
}
