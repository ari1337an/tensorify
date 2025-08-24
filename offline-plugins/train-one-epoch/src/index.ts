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
 * Train One Epoch Plugin
 *
 * A comprehensive training function plugin that generates a single epoch training function
 * with customizable data loading, prediction, loss computation, and reporting.
 */
export default class TrainOneEpochPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 350,
          height: 280,
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
            value: "play-circle",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "Train One Epoch",
          dynamicLabelTemplate: "fn: {function_name}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration
      inputHandles: [
        PrevNodeAsInput,
        {
          id: "predict_code_input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: false,
          label: "Predict Code",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.CUSTOM,
          description: "Code provider for prediction logic",
        },
        {
          id: "loss_code_input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: false,
          label: "Loss Code",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.CUSTOM,
          description: "Code provider for loss computation logic",
        },
        {
          id: "report_code_input",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: false,
          label: "Report Code",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.CUSTOM,
          description: "Code provider for reporting logic",
        },
      ],

      outputHandles: [NextNodeAsOutput],

      // Settings Configuration
      settingsFields: [
        {
          key: "function_name",
          label: "Function Name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "train_one_epoch",
          required: true,
          description: "Name of the training function",
        },
        {
          key: "destructure_variables",
          label: "Destructure Variables",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "images, labels",
          required: true,
          description:
            "Comma-separated variables to destructure from dataloader (e.g., 'images, labels' or 'X, y')",
        },
        {
          key: "device_variable",
          label: "Device Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "",
          required: false,
          description:
            "Device variable for tensor movement (e.g., 'device'). Leave empty to skip device movement",
        },
        {
          key: "report_condition",
          label: "Report Condition",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "batch_no % 100 == 99",
          required: false,
          description:
            "Condition for when to report progress (e.g., 'batch_no % 100 == 99')",
        },
        {
          key: "enable_reporting",
          label: "Enable Reporting",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description:
            "Whether to include progress reporting in the training loop",
        },
        {
          key: "return_variable",
          label: "Return Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "last_loss",
          required: true,
          description: "Variable to return from the function",
        },
        {
          key: "predict_output_var",
          label: "Prediction Output Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "outputs",
          required: true,
          description: "Variable name for model prediction output",
        },
        {
          key: "loss_output_var",
          label: "Loss Output Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "loss",
          required: true,
          description: "Variable name for loss computation output",
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [],
        imports: [],
      },
      nodeType: NodeType.FUNCTION,
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
    const functionName = settings.function_name || "train_one_epoch";
    const destructureVars = settings.destructure_variables || "images, labels";
    const deviceVariable = settings.device_variable?.trim() || "";
    const reportCondition = settings.report_condition || "batch_no % 100 == 99";
    const enableReporting = Boolean(settings.enable_reporting);
    const returnVariable = settings.return_variable || "last_loss";
    const predictOutputVar = settings.predict_output_var || "outputs";
    const lossOutputVar = settings.loss_output_var || "loss";

    // Get injected code from inputs
    const predictCode = context ? this.getInput(context, 1) : null; // predict_code_input handle
    const lossCode = context ? this.getInput(context, 2) : null; // loss_code_input handle
    const reportCode = context ? this.getInput(context, 3) : null; // report_code_input handle

    // Default code blocks
    const defaultPredictCode = `${predictOutputVar} = model(${destructureVars.split(",")[0].trim()})`;
    const defaultLossCode = `${lossOutputVar} = loss_fn(${predictOutputVar}, ${destructureVars.split(",")[1]?.trim() || "labels"})`;
    const defaultReportCode = `print(f"Batch {batch_no + 1}, Loss: {${lossOutputVar}.item():.4f}")`;

    // Use injected code or defaults
    const finalPredictCode = predictCode?.code || defaultPredictCode;
    const finalLossCode = lossCode?.code || defaultLossCode;
    const finalReportCode = reportCode?.code || defaultReportCode;

    // Generate destructuring code
    const destructureVarList = destructureVars
      .split(",")
      .map((v: string) => v.trim());
    let destructureCode = "";
    if (deviceVariable) {
      const deviceMovement = destructureVarList
        .map((v: string) => `${v} = ${v}.to(${deviceVariable})`)
        .join("\n        ");
      destructureCode = `        ${deviceMovement}`;
    }

    // Generate report block
    let reportBlock = "";
    if (enableReporting) {
      const indentedReportCode = finalReportCode
        .split("\n")
        .map((line: string) => (line.trim() ? `            ${line}` : line))
        .join("\n");

      reportBlock = `        if ${reportCondition}:
${indentedReportCode}
            ${returnVariable} = running_loss / (batch_no + 1)`;
    }

    // Indent predict and loss code
    const indentedPredictCode = finalPredictCode
      .split("\n")
      .map((line: string) => (line.trim() ? `        ${line}` : line))
      .join("\n");

    const indentedLossCode = finalLossCode
      .split("\n")
      .map((line: string) => (line.trim() ? `        ${line}` : line))
      .join("\n");

    // Generate the complete function
    const code = `def ${functionName}(epoch_index, optimizer, dataloader, model, loss_fn):
    running_loss = 0.
    ${returnVariable} = 0.

    for batch_no, data in enumerate(dataloader):
        ${destructureVars} = data
${destructureCode ? destructureCode + "\n" : ""}        optimizer.zero_grad()
${indentedPredictCode}
${indentedLossCode}
        ${lossOutputVar}.backward()
        optimizer.step()
        running_loss += ${lossOutputVar}.item()
${reportBlock}
    
    return ${returnVariable}`;

    return code;
  }
}
