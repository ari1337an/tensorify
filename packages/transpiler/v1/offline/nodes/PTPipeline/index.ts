// src/nodes/PTPipeline.ts

import INode, { NodeType } from "../../../core/interfaces/INode";
import PTNNDataset from "../PTNNDataset";
import PTDataloader from "../PTDataloader";
import PTNNModule from "../PTNNModule";
import PTOptimAdam from "../PTOptimAdam";
import PTTrainOneEpoch from "../PTTrainOneEpoch";
import PTTrainer from "../PTTrainer";

export default class PTPipeline implements INode<PTPipeline["settings"]> {
  name: string = "PyTorch Pipeline";

  translationTemplate: string = `
{imports}

{dataset_code}

{dataloader_code}

{model_code}

{optimizer_code}

{loss_function_code}

{train_one_epoch_code}

{trainer_code}
  `;

  inputLines: number = 7;
  outputLinesCount: number = 0;
  secondaryInputLinesCount: number = 0;
  nodeType: NodeType = NodeType.PIPELINE;

  settings: {
    datasetSettings: PTNNDataset["settings"];
    dataloaderSettings: PTDataloader["settings"];
    modelSettings: PTNNModule["settings"];
    optimizerSettings: PTOptimAdam["settings"];
    lossFunctionSettings: PTNNModule["settings"];
    trainOneEpochSettings: PTTrainOneEpoch["settings"];
    trainerSettings: PTTrainer["settings"];
  } = {
    datasetSettings: new PTNNDataset().settings,
    dataloaderSettings: new PTDataloader().settings,
    modelSettings: new PTNNModule().settings,
    optimizerSettings: new PTOptimAdam().settings,
    lossFunctionSettings: new PTNNModule().settings,
    trainOneEpochSettings: new PTTrainOneEpoch().settings,
    trainerSettings: new PTTrainer().settings,
  };

  constructor() {
    // Initialize settings if needed
  }

  getTranslationCode(settings: typeof this.settings): string {
    // Instantiate components
    const datasetNode = new PTNNDataset();
    datasetNode.settings = settings.datasetSettings;

    const dataloaderNode = new PTDataloader();
    dataloaderNode.settings = settings.dataloaderSettings;

    const modelNode = new PTNNModule();
    modelNode.settings = settings.modelSettings;

    const optimizerNode = new PTOptimAdam();
    optimizerNode.settings = settings.optimizerSettings;

    const lossNode = new PTNNModule();
    lossNode.settings = settings.lossFunctionSettings;

    const trainOneEpochNode = new PTTrainOneEpoch();
    trainOneEpochNode.settings = settings.trainOneEpochSettings;

    const trainerNode = new PTTrainer();
    trainerNode.settings = settings.trainerSettings;

    // Generate code for each component
    const datasetCode = datasetNode.getTranslationCode(datasetNode.settings);
    const dataloaderCode = dataloaderNode.getTranslationCode(
      dataloaderNode.settings
    );
    const modelCode = modelNode.getTranslationCode(modelNode.settings);
    const optimizerCode = optimizerNode.getTranslationCode(
      optimizerNode.settings
    );
    const lossCode = lossNode.getTranslationCode(lossNode.settings);
    const trainOneEpochCode = trainOneEpochNode.getTranslationCode(
      trainOneEpochNode.settings
    );
    const trainerCode = trainerNode.getTranslationCode(trainerNode.settings);

    // Loss function code is provided directly
    const lossFunctionCode = lossNode.getTranslationCode(lossNode.settings);

    // Prepare imports
    const imports = `
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset
`.trim();

    // Combine all code using the translation template
    const fullCode = this.translationTemplate
      .replace("{imports}", imports)
      .replace("{dataset_code}", datasetCode)
      .replace("{dataloader_code}", dataloaderCode)
      .replace("{model_code}", modelCode)
      .replace("{optimizer_code}", optimizerCode)
      .replace("{loss_function_code}", lossFunctionCode)
      .replace("{train_one_epoch_code}", trainOneEpochCode)
      .replace("{trainer_code}", trainerCode);

    return fullCode.trim();
  }
}
