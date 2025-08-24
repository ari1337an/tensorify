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
  NextNodeAsOutput,
  PrevNodeAsInput,
} from "@tensorify.io/sdk";

/**
 * CrossEntropyLoss Plugin
 *
 * A loss function plugin for PyTorch CrossEntropyLoss with customizable parameters.
 * Acts as a variable provider that can emit loss function variables.
 */
export default class CrossentropylossPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Visual Configuration
      nodeType: NodeType.LOSS_FUNCTION,
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 280,
          height: 180,
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
            value: "zap",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "CrossEntropyLoss",
          dynamicLabelTemplate: "reduction={reduction}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration - Variable provider doesn't need input handles
      inputHandles: [PrevNodeAsInput],

      outputHandles: [
        NextNodeAsOutput,
        {
          id: "loss_out",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.DEFAULT,
          label: "Loss Function",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.LOSS_FUNCTION,
          description: "CrossEntropyLoss function output",
        },
        {
          id: "code",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.DEFAULT,
          label: "Code",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.CUSTOM,
          description: "Generated code for loss computation",
        },
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "lossVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "criterion",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitLossVar",
          label: "Emit variable name",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Controls emission of the loss function variable",
        },
        {
          key: "weight_input",
          label: "Weight Input Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "",
          required: false,
          description:
            "Variable name for class weights (e.g., 'class_weights'). Leave empty for None",
        },
        {
          key: "ignore_index",
          label: "Ignore Index",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: -100,
          required: false,
          description:
            "Specifies a target value that is ignored and does not contribute to the input gradient",
        },
        {
          key: "reduction",
          label: "Reduction",
          type: SettingsUIType.DROPDOWN,
          dataType: SettingsDataType.STRING,
          defaultValue: "mean",
          required: false,
          description: "Specifies the reduction to apply to the output",
          options: [
            { value: "none", label: "none" },
            { value: "mean", label: "mean" },
            { value: "sum", label: "sum" },
          ],
        },
        {
          key: "label_smoothing",
          label: "Label Smoothing",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0.0,
          required: false,
          description:
            "A float in [0.0, 1.0]. Specifies the amount of smoothing when computing the loss",
          validation: {
            min: 0.0,
            max: 1.0,
          },
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [
          {
            value: "criterion",
            switchKey: "settingsFields.emitLossVar",
            isOnByDefault: true,
            type: NodeType.LOSS_FUNCTION,
          },
        ],
        imports: [{ path: "torch.nn", items: ["CrossEntropyLoss"] }],
      },
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
    const variableName =
      settings.lossVarName || settings.variableName || "criterion";
    const shouldEmit = Boolean(settings.emitLossVar);
    const weightInput = settings.weight_input?.trim() || "";
    const ignoreIndex = settings.ignore_index ?? -100;
    const reduction = settings.reduction || "mean";
    const labelSmoothing = settings.label_smoothing ?? 0.0;

    // Build CrossEntropyLoss parameters
    const params: string[] = [];

    if (weightInput) {
      params.push(`weight=${weightInput}`);
    }

    if (ignoreIndex !== -100) {
      params.push(`ignore_index=${ignoreIndex}`);
    }

    if (reduction !== "mean") {
      params.push(`reduction='${reduction}'`);
    }

    if (labelSmoothing > 0.0) {
      params.push(`label_smoothing=${labelSmoothing}`);
    }

    const paramsStr = params.length > 0 ? params.join(", ") : "";
    const ctor = `torch.nn.CrossEntropyLoss(${paramsStr})`;

    return shouldEmit ? `${variableName} = ${ctor}` : ctor;
  }
}
