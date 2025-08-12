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
 * Minimal Plugin
 *
 * This plugin demonstrates the basic structure for a Tensorify plugin.
 * Make sure you have the latest SDK linked: npm link @tensorify.io/sdk
 */
export default class MinimalPlugin extends TensorifyPlugin {
  constructor() {
    const definition: IPluginDefinition = {
      // Core Metadata (id, name, description, version, nodeType are derived from package.json)
      // nodeType is derived from package.json tensorify.pluginType field

      // Visual Configuration (comprehensive and required)
      visual: {
        containerType: NodeViewContainerType.DEFAULT,
        size: {
          width: 200,
          height: 120,
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
            value: "box",
          },
          secondary: [],
          showIconBackground: true,
          iconSize: "medium",
        },
        labels: {
          title: "Minimal Plugin",
          dynamicLabelTemplate: "Message: {message}",
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
          key: "message",
          label: "Message",
          type: SettingsUIType.INPUT_TEXT,
          dataType: SettingsDataType.STRING,
          defaultValue: "Hello World!",
          required: false,
          description: "Message to display in generated code",
          validation: {
            minLength: 1,
            maxLength: 100,
          },
        },
        {
          key: "showTimestamp",
          label: "Show Timestamp",
          type: SettingsUIType.TOGGLE,
          dataType: SettingsDataType.BOOLEAN,
          defaultValue: false,
          required: false,
          description: "Whether to include timestamp in output",
        },
      ],

      // Plugin Metadata
      capabilities: [PluginCapability.CODE_GENERATION],
      requirements: {
        minSdkVersion: "1.0.0",
        dependencies: [],
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
    if (!validation.isValid) {
      throw new Error(
        `Settings validation failed: ${validation.errors.map((e) => e.message).join(", ")}`
      );
    }

    // Extract settings values with defaults from CorePluginSettings
    const variableName = settings.variableName || "minimal_plugin";
    const message = settings.message || "Hello World!";
    const showTimestamp = settings.showTimestamp || false;

    // Safe context handling - getInput method available in TensorifyPlugin
    const hasInput =
      context && context.inputData && Object.keys(context.inputData).length > 0;

    // Generate code
    let code = `# Minimal Plugin\n`;

    if (hasInput) {
      code += `input_data = ${JSON.stringify(context.inputData)}\n`;
    }

    code += `${variableName} = "${message}"`;

    if (showTimestamp) {
      code += `\n# Timestamp: ${new Date().toISOString()}`;
    }

    code += `\nprint(${variableName})`;

    return code;
  }
}
