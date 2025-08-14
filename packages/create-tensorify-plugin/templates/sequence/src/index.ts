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
          key: "itemsCount",
          label: "Items Count (display only)",
          type: SettingsUIType.INPUT_NUMBER,
          dataType: SettingsDataType.NUMBER,
          defaultValue: 0,
          required: false,
          description: "Shown in dynamic label; updated by UI.",
        },
      ],

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
    const variableName = settings.variableName || "seq";
    const parts = (children || []).map((c) => (c.code || "").trim()).filter(Boolean);
    const inner = parts.join(",\n");
    return `${variableName} = torch.nn.Sequential(\n${inner}\n)`;
  }
}


