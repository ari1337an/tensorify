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
} from "@tensorify.io/sdk";

/**
 * CIFAR10 Dataset Plugin
 *
 * A dataset plugin for loading the CIFAR-10 dataset using torchvision.
 * Acts as a variable provider that can emit dataset variables.
 */
export default class Cifar10datasetPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Visual Configuration
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 260,
          height: 160,
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
            value: "folder-open",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "CIFAR-10 Dataset",
          dynamicLabelTemplate:
            "{train ? 'Train' : 'Test'} • {download ? 'Download' : 'Local'}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration - Variable provider doesn't need input handles
      inputHandles: [],

      outputHandles: [
        {
          id: "dataset_out",
          position: HandlePosition.RIGHT,
          viewType: HandleViewType.DEFAULT,
          label: "Dataset",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.DATASET,
          description: "CIFAR-10 dataset output",
        },
      ],

      // Settings Configuration
      settingsFields: [
        {
          key: "datasetVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "cifar10_dataset",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitDatasetVar",
          label: "Emit variable name",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Controls emission of the dataset variable",
        },
        {
          key: "root",
          label: "Root Directory",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "./data",
          required: true,
          description:
            "Root directory where dataset will be stored/loaded from",
        },
        {
          key: "train",
          label: "Training Set",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description:
            "If True, creates dataset from training set, otherwise from test set",
        },
        {
          key: "download",
          label: "Download",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: false,
          description:
            "If True, downloads the dataset from internet if not already present",
        },
        {
          key: "transform_input",
          label: "Transform Input Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "transform",
          required: false,
          description:
            "Variable name for transform (e.g., 'transform'). Leave empty for None",
        },
        {
          key: "target_transform_input",
          label: "Target Transform Input Variable",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "",
          required: false,
          description:
            "Variable name for target transform. Leave empty for None",
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [
          {
            value: "cifar10_dataset",
            switchKey: "settingsFields.emitDatasetVar",
            isOnByDefault: true,
            type: NodeType.DATASET,
          },
        ],
        imports: [{ path: "torchvision" }],
      },
      nodeType: NodeType.DATASET,
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: {
        minSdkVersion: "1.0.0",
        dependencies: ["torch", "torchvision"],
        pythonPackages: ["torch", "torchvision"],
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
      settings.datasetVarName || settings.variableName || "cifar10_dataset";
    const shouldEmit = Boolean(settings.emitDatasetVar);
    const root = settings.root || "./data";
    const train = Boolean(settings.train);
    const download = Boolean(settings.download);
    const transformInput = settings.transform_input?.trim() || "";
    const targetTransformInput = settings.target_transform_input?.trim() || "";

    // Build CIFAR10 parameters
    const params: string[] = [
      `root='${root}'`,
      `train=${train ? "True" : "False"}`,
    ];

    if (download) {
      params.push("download=True");
    }

    if (transformInput) {
      params.push(`transform=${transformInput}`);
    } else {
      params.push("transform=None");
    }

    if (targetTransformInput) {
      params.push(`target_transform=${targetTransformInput}`);
    } else {
      params.push("target_transform=None");
    }

    const paramsStr = params.join(", ");
    const ctor = `torchvision.datasets.CIFAR10(${paramsStr})`;

    return shouldEmit ? `${variableName} = ${ctor}` : ctor;
  }
}
