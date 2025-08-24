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
 * SGD Optimizer Plugin
 *
 * A plugin for PyTorch SGD optimizer with customizable parameters.
 * Acts as a variable provider that can emit optimizer variables.
 */
export default class SgdPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 300,
          height: 200,
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
            value: "trending-up",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "SGD Optimizer",
          dynamicLabelTemplate: "lr={lr}, momentum={momentum}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration - Variable provider doesn't need input handles
      inputHandles: [PrevNodeAsInput],

      outputHandles: [
        NextNodeAsOutput
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "optimizerVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "optimizer",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitOptimizerVar",
          label: "Emit variable name",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Controls emission of the optimizer variable",
        },
        {
          key: "model_params_input",
          label: "Model Parameters Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "model.parameters()",
          required: true,
          description: "Variable or expression for model parameters",
        },
        {
          key: "lr",
          label: "Learning Rate",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0.001,
          required: false,
          description: "Learning rate (default: 1e-3)",
          validation: {
            min: 0.0000001,
            max: 10.0,
          },
        },
        {
          key: "momentum",
          label: "Momentum",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description: "Momentum factor (default: 0)",
          validation: {
            min: 0.0,
            max: 1.0,
          },
        },
        {
          key: "dampening",
          label: "Dampening",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description: "Dampening for momentum (default: 0)",
          validation: {
            min: 0.0,
            max: 1.0,
          },
        },
        {
          key: "weight_decay",
          label: "Weight Decay",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description: "Weight decay (L2 penalty) (default: 0)",
          validation: {
            min: 0.0,
            max: 1.0,
          },
        },
        {
          key: "nesterov",
          label: "Nesterov",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description: "Enables Nesterov momentum",
        },
        {
          key: "maximize",
          label: "Maximize",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description:
            "Maximize the objective with respect to the params, instead of minimizing",
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [
          {
            value: "optimizer",
            switchKey: "settingsFields.emitOptimizerVar",
            isOnByDefault: true,
            type: NodeType.OPTIMIZER,
          },
        ],
        imports: [{ path: "torch.optim", items: ["SGD"] }],
      },
      nodeType: NodeType.OPTIMIZER,
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
      settings.optimizerVarName || settings.variableName || "optimizer";
    const shouldEmit = Boolean(settings.emitOptimizerVar);
    const modelParamsInput =
      settings.model_params_input || "model.parameters()";
    const lr = settings.lr ?? 0.001;
    const momentum = settings.momentum ?? 0;
    const dampening = settings.dampening ?? 0;
    const weightDecay = settings.weight_decay ?? 0;
    const nesterov = Boolean(settings.nesterov);
    const maximize = Boolean(settings.maximize);

    // Build SGD parameters
    const params: string[] = [modelParamsInput];

    if (lr !== 0.001) {
      params.push(`lr=${lr}`);
    }

    if (momentum !== 0) {
      params.push(`momentum=${momentum}`);
    }

    if (dampening !== 0) {
      params.push(`dampening=${dampening}`);
    }

    if (weightDecay !== 0) {
      params.push(`weight_decay=${weightDecay}`);
    }

    if (nesterov) {
      params.push(`nesterov=True`);
    }

    if (maximize) {
      params.push(`maximize=True`);
    }

    const paramsStr = params.join(", ");
    const ctor = `torch.optim.SGD(${paramsStr})`;

    return shouldEmit ? `${variableName} = ${ctor}` : ctor;
  }
}
