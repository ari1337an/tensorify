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
 * DataLoader Plugin
 *
 * PyTorch DataLoader plugin for loading datasets with configurable batching,
 * shuffling, multiprocessing, and other data loading features.
 */
export default class DataloaderPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Visual Configuration
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
            value: "database",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "DataLoader",
          dynamicLabelTemplate: "batch={batch_size}, workers={num_workers}",
          showLabels: true,
          labelPosition: "top",
        },
      },

      // Handle Configuration
      inputHandles: [
        PrevNodeAsInput,
        {
          id: "dataset",
          position: HandlePosition.LEFT,
          viewType: HandleViewType.DEFAULT,
          required: true,
          label: "Dataset",
          edgeType: EdgeType.DEFAULT,
          dataType: NodeType.DATASET,
          description: "Dataset to load from",
        },
      ],

      outputHandles: [NextNodeAsOutput],

      // Settings Configuration
      settingsFields: [
        {
          key: "dataloaderVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "dataloader",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitDataloaderVar",
          label: "Emit variable name",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Controls emission of the DataLoader variable",
        },
        {
          key: "batch_size",
          label: "Batch Size",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 1,
          required: false,
          description: "How many samples per batch to load",
          validation: {
            min: 1,
            max: 10000,
          },
        },
        {
          key: "shuffle",
          label: "Shuffle",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description: "Set to True to have the data reshuffled at every epoch",
        },
        {
          key: "num_workers",
          label: "Num Workers",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description:
            "How many subprocesses to use for data loading. 0 means main process",
          validation: {
            min: 0,
            max: 32,
          },
        },
        {
          key: "pin_memory",
          label: "Pin Memory",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description:
            "If True, copies Tensors into CUDA pinned memory before returning",
        },
        {
          key: "drop_last",
          label: "Drop Last",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description: "Set to True to drop the last incomplete batch",
        },
        {
          key: "timeout",
          label: "Timeout",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description: "Timeout value for collecting a batch from workers",
          validation: {
            min: 0,
            max: 3600,
          },
        },
        {
          key: "prefetch_factor",
          label: "Prefetch Factor",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 2,
          required: false,
          description: "Number of batches loaded in advance by each worker",
          validation: {
            min: 1,
            max: 100,
          },
        },
        {
          key: "persistent_workers",
          label: "Persistent Workers",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description:
            "If True, workers will not shut down after dataset is consumed",
        },
      ],

      // Plugin Metadata
      emits: {
        variables: [
          {
            value: "dataloader",
            switchKey: "settingsFields.emitDataloaderVar",
            isOnByDefault: true,
            type: NodeType.DATALOADER,
          },
        ],
        imports: [{ path: "torch.utils.data", items: ["DataLoader"] }],
      },
      nodeType: NodeType.DATALOADER,
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
      settings.dataloaderVarName || settings.variableName || "dataloader";
    const shouldEmit = Boolean(settings.emitDataloaderVar);
    const batchSize = settings.batch_size || 1;
    const shuffle = Boolean(settings.shuffle);
    const numWorkers = settings.num_workers || 0;
    const pinMemory = Boolean(settings.pin_memory);
    const dropLast = Boolean(settings.drop_last);
    const timeout = settings.timeout || 0;
    const prefetchFactor = settings.prefetch_factor || 2;
    const persistentWorkers = Boolean(settings.persistent_workers);

    // Get dataset from context (variable provider)
    const datasetInput = context ? this.getInput(context, 1) : null; // dataset handle is at index 1
    const datasetVar = datasetInput?.variableName || "dataset";

    // Build DataLoader parameters
    const params: string[] = [
      `dataset=${datasetVar}`,
      `batch_size=${batchSize}`,
      `shuffle=${shuffle ? "True" : "False"}`,
    ];

    if (numWorkers > 0) {
      params.push(`num_workers=${numWorkers}`);
    }

    if (pinMemory) {
      params.push("pin_memory=True");
    }

    if (dropLast) {
      params.push("drop_last=True");
    }

    if (timeout > 0) {
      params.push(`timeout=${timeout}`);
    }

    if (numWorkers > 0 && prefetchFactor !== 2) {
      params.push(`prefetch_factor=${prefetchFactor}`);
    }

    if (persistentWorkers && numWorkers > 0) {
      params.push("persistent_workers=True");
    }

    const paramsStr = params.join(",\n    ");
    const ctor = `torch.utils.data.DataLoader(
    ${paramsStr}
)`;

    return shouldEmit ? `${variableName} = ${ctor}` : ctor;
  }
}
