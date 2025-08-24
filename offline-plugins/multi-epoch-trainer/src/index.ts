import {
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  HandleViewType,
  HandlePosition,
  EdgeType,
  NodeViewContainerType,
  IconType,
  SettingsUIType,
  SettingsDataType,
  PrevNodeAsInput,
  NextNodeAsOutput,
} from "@tensorify.io/sdk";

/**
 * Multi-Epoch Trainer Plugin
 *
 * A training orchestrator plugin that manages the training loop across multiple epochs,
 * calling the training function and handling additional processing between epochs.
 */
export default class MultiEpochTrainerPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 320,
          height: 240,
        },
        padding: {
          inner: 16,
          outer: 8,
          extraPadding: false,
        },
        styling: {
          borderRadius: 8,
          borderWidth: 2,
          shadowLevel: 1,
          theme: "auto",
        },
        icons: {
          primary: {
            type: IconType.LUCIDE,
            value: "repeat",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "Multi-Epoch Trainer",
          dynamicLabelTemplate: "{number_of_epochs} epochs",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration
      inputHandles: [
        PrevNodeAsInput,
        {
          id: "additional_code_input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: false,
          label: "Additional Code",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.CUSTOM,
          description: "Code provider for additional processing between epochs",
        },
      ],

      outputHandles: [NextNodeAsOutput],

      // Settings Configuration
      settingsFields: [
        {
          key: "number_of_epochs",
          label: "Number of Epochs",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 10,
          required: true,
          description: "Number of training epochs",
          validation: {
            min: 1,
            max: 1000,
          },
        },
        {
          key: "model_variable",
          label: "Model Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "model",
          required: true,
          description: "Variable name for the model",
        },
        {
          key: "optimizer_variable",
          label: "Optimizer Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "optimizer",
          required: true,
          description: "Variable name for the optimizer",
        },
        {
          key: "dataloader_variable",
          label: "DataLoader Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "train_loader",
          required: true,
          description: "Variable name for the training data loader",
        },
        {
          key: "loss_function_variable",
          label: "Loss Function Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "criterion",
          required: true,
          description: "Variable name for the loss function",
        },
        {
          key: "train_function_name",
          label: "Train Function Name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "train_one_epoch",
          required: true,
          description: "Name of the single epoch training function",
        },
        {
          key: "avg_loss_variable",
          label: "Average Loss Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "avg_loss",
          required: true,
          description: "Variable name for storing average loss per epoch",
        },
        {
          key: "enable_train_mode",
          label: "Enable Train Mode",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description: "Whether to call model.train(True) before each epoch",
        },
        {
          key: "print_epoch_loss",
          label: "Print Epoch Loss",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description: "Whether to print the average loss after each epoch",
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [],
        imports: [],
      },
      nodeType: NodeType.TRAINER,
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: {
        minSdkVersion: "1.0.0",
        dependencies: ["torch"],
        pythonPackages: ["torch"],
      },
    };

    super(definition);
  }

  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(
        `Settings validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Extract settings values
    const numberOfEpochs = settings.number_of_epochs || 10;
    const modelVariable = settings.model_variable || "model";
    const optimizerVariable = settings.optimizer_variable || "optimizer";
    const dataloaderVariable = settings.dataloader_variable || "train_loader";
    const lossFunctionVariable = settings.loss_function_variable || "criterion";
    const trainFunctionName = settings.train_function_name || "train_one_epoch";
    const avgLossVariable = settings.avg_loss_variable || "avg_loss";
    const enableTrainMode = Boolean(settings.enable_train_mode);
    const printEpochLoss = Boolean(settings.print_epoch_loss);

    // Get injected additional code
    const additionalCode = context ? this.getInput(context, 1) : null; // additional_code_input handle

    // Generate training mode line
    const trainModeLine = enableTrainMode
      ? `    ${modelVariable}.train(True)`
      : "";

    // Generate print statement
    const printStatement = printEpochLoss
      ? `    print(f"Epoch {epoch_index + 1}/${numberOfEpochs}, Average Loss: {${avgLossVariable}:.4f}")`
      : "";

    // Generate additional code block
    let additionalCodeBlock = "";
    if (additionalCode?.code) {
      const indentedAdditionalCode = additionalCode.code
        .split("\n")
        .map((line: string) => (line.trim() ? `    ${line}` : line))
        .join("\n");
      additionalCodeBlock = indentedAdditionalCode;
    }

    // Generate the complete training loop
    const code = `# Multi-epoch training loop
for epoch_index in range(${numberOfEpochs}):
${trainModeLine ? trainModeLine + "\n" : ""}    ${avgLossVariable} = ${trainFunctionName}(epoch_index, ${optimizerVariable}, ${dataloaderVariable}, ${modelVariable}, ${lossFunctionVariable})
${printStatement ? printStatement + "\n" : ""}${additionalCodeBlock ? additionalCodeBlock + "\n" : ""}`;

    return code.trim();
  }
}
