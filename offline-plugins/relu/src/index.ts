import {
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  PluginCapability,
  NodeViewContainerType,
  IconType,
  SettingsUIType,
  SettingsDataType,
  PrevNodeAsInput,
  NextNodeAsOutput,
} from "@tensorify.io/sdk";

export default class ReluPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: { width: 200, height: 120 },
        padding: { inner: 16, outer: 8, extraPadding: false },
        styling: {
          borderRadius: 8,
          borderWidth: 2,
          shadowLevel: 1,
          theme: "auto",
        },
        icons: {
          primary: { type: IconType.LUCIDE, value: "activity" },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "ReLU",
          titleDescription: "Activation",
          showLabels: true,
          labelPosition: "top",
        },
      },
      inputHandles: [PrevNodeAsInput],
      outputHandles: [NextNodeAsOutput],
      settingsFields: [
        {
          key: "reluVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "relu",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitReluVar",
          label: "Emit variable name",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Controls emission of the ReLU variable",
        },
        {
          key: "inplace",
          label: "In-place",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description: "Perform the operation in-place",
        },
      ],
      capabilities: [PluginCapability.CODE_GENERATION],
      emits: {
        variables: [
          {
            value: "relu",
            switchKey: "settingsFields.emitReluVar",
            isOnByDefault: true,
          },
        ],
        imports: [{ path: "torch.nn", items: ["ReLU"], as: { "ReLU": "myrelu" } }],
      },
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
    _children?: any,
    _context?: PluginCodeGenerationContext
  ): string {
    const variableName =
      (settings as any).reluVarName || settings.variableName || "relu";
    const shouldEmit = Boolean((settings as any).emitReluVar);
    const inplace = Boolean(settings.inplace);
    const ctor = `torch.nn.ReLU(inplace=${inplace ? "True" : "False"})`;
    return shouldEmit ? `${variableName} = ${ctor}` : ctor;
  }
}
