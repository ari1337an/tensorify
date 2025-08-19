import {
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  NodeType,
  PluginCapability,
  NodeViewContainerType,
  IconType,
  SettingsUIType,
  SettingsDataType,
  PrevNodeAsInput,
  NextNodeAsOutput,
} from "@tensorify.io/sdk";

export default class {{classicProjectName}}Plugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: { width: 280, height: 160 },
        padding: { inner: 12, outer: 8, extraPadding: false },
        styling: { borderRadius: 10, borderWidth: 2, shadowLevel: 1, theme: "auto" },
        icons: {
          primary: { type: IconType.LUCIDE, value: "list" },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "Sequence",
          titleDescription: "Compose children in order",
          dynamicLabelTemplate: "{itemsCount} items",
          showLabels: true,
          labelPosition: "top",
        },
      },

      inputHandles: [PrevNodeAsInput],
      outputHandles: [NextNodeAsOutput],

      settingsFields: [
        {
          key: "sequenceVarName",
          label: "Variable name",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "seq",
          required: true,
          description: "Name of the variable to assign when emit is enabled",
        },
        {
          key: "emitSequenceVar",
          label: "Emit Sequence Variable",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: true,
          required: true,
          description: "Whether to emit the sequence variable",
        },
        {
          key: "itemsCount",
          label: "Items Count (display only)",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description: "Shown in dynamic label; updated by UI.",
        },
      ],

      emits: {
        variables: [
          {
            value: "seq",
            switchKey: "settingsFields.emitSequenceVar",
            isOnByDefault: true,
            type: NodeType.SEQUENCE,
          },
        ],
        imports: [{ path: "torch.nn", items: ["Sequential"] }],
      },
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: { minSdkVersion: "1.0.0", dependencies: ["torch"], pythonPackages: ["torch"] },
    };

    super(definition);
  }

  public getTranslationCode(
    settings: PluginSettings,
    children?: Array<{ slug: string; code: string; settings?: any }>,
    _context?: PluginCodeGenerationContext
  ): string {
    const variableName = (settings as any).sequenceVarName || settings.variableName || "seq";
    const shouldEmit = Boolean((settings as any).emitSequenceVar);
    const indent = "  ";
    const indentBlock = (s: string) =>
      s
        .split("\n")
        .map((line) => (line.trim().length ? indent + line : line))
        .join("\n");
    const parts = (children || [])
      .map((c) => (c.code || "").trim())
      .filter(Boolean)
      .map((p) => indentBlock(p));
    const inner = parts.join(",\n");
    const ctor = `torch.nn.Sequential(\n${inner}\n)`;
    return shouldEmit ? `${variableName} = ${ctor}` : ctor;
  }
}


