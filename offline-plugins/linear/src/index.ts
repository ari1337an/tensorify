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
 * Linear Layer Plugin
 *
 * This plugin demonstrates the complete structure for a PyTorch linear layer.
 * Make sure you have the latest SDK linked: npm link @tensorify.io/sdk
 */
export default class LinearLayerPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Core Metadata (id, name, description, version, nodeType are derived from package.json)
      // nodeType is derived from package.json tensorify.pluginType field

      // Visual Configuration (comprehensive and required)
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 240,
          height: 140,
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
            value: "layers",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "Linear Layer",
          dynamicLabelTemplate: "{inFeatures} → {outFeatures}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration
      inputHandles: [PrevNodeAsInput],

      outputHandles: [NextNodeAsOutput],

      // Settings Configuration (UI components automatically generated)
      settingsFields: [
        {
          key: "linearVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "linear_layer",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitLinearVar",
          label: "Emit variable name",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Controls emission of the linear layer variable",
        },
        {
          key: "inFeatures",
          label: "Input Features",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 784,
          required: true,
          description: "Number of input features",
          validation: {
            min: 1,
            max: 100000,
          },
        },
        {
          key: "outFeatures",
          label: "Output Features",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 10,
          required: true,
          description: "Number of output features",
          validation: {
            min: 1,
            max: 100000,
          },
        },
        {
          key: "bias",
          label: "Use Bias",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description:
            "Whether to include bias parameters in the linear transformation",
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [
          {
            value: "linear_layer",
            switchKey: "settingsFields.emitLinearVar",
            isOnByDefault: true,
          },
        ],
        imports: [{ path: "torch", items: ["nn"] }],
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
    // Validate settings (returns PluginValidationResult with isValid boolean)
    const validation = this.validateSettings(settings);

    if (validation.isValid) {
      throw new Error(
        `Settings validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Extract settings values with defaults from CorePluginSettings
    const variableName =
      (settings as any).linearVarName ||
      settings.variableName ||
      "linear_layer";
    const shouldEmit = Boolean((settings as any).emitLinearVar);
    const inFeatures = settings.inFeatures || 784;
    const outFeatures = settings.outFeatures || 10;
    const bias = settings.bias !== undefined ? settings.bias : true;

    // Additional validation for business logic
    if (typeof inFeatures !== "number" || inFeatures <= 0) {
      throw new Error("Input features must be a positive number");
    }

    if (typeof outFeatures !== "number" || outFeatures <= 0) {
      throw new Error("Output features must be a positive number");
    }

    // Safe context handling - getInput method available in TensorifyPlugin
    const inputData = context ? this.getInput(context, 0) : null;

    // Generate PyTorch Linear layer code
    const ctor = `torch.nn.Linear(\n    in_features=${inFeatures},\n    out_features=${outFeatures},\n    bias=${bias ? "True" : "False"}\n)`;
    const body = shouldEmit ? `${variableName} = ${ctor}` : ctor;
    return `${body}\n`;
  }
}
